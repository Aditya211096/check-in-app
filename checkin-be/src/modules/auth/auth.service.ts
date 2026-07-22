import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma.service";
import { GlobalRole, TenantRole } from "@prisma/client";
import * as admin from "firebase-admin";

@Injectable()
export class AuthService {
  private firebaseApp: admin.app.App | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {
    let adminConfig: any = {};
    try {
      adminConfig = JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}");
    } catch {
      adminConfig = {};
    }

    try {
      if (!admin.apps.length) {
        if (adminConfig.private_key) {
          this.firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(adminConfig),
          });
        } else {
          this.firebaseApp = admin.initializeApp({
            projectId: adminConfig.project_id || process.env.GCP_PROJECT_ID || "traces-checkin-app",
          });
        }
      } else {
        this.firebaseApp = admin.apps[0]!;
      }
    } catch (err) {
      console.warn("Firebase Admin initializeApp skipped/warning:", err);
    }
  }

  /**
   * Verify Firebase ID Token and return custom JWT session token.
   */
  async verifyFirebaseToken(idToken: string): Promise<{ token: string; user: any }> {
    let phoneNumber: string;

    if (process.env.NODE_ENV === "development" && idToken.startsWith("mock-token-")) {
      phoneNumber = idToken.replace("mock-token-", "");
    } else {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const decodedPhone = decodedToken.phone_number;
        if (!decodedPhone) {
          throw new UnauthorizedException("Firebase token does not contain a phone number.");
        }
        phoneNumber = decodedPhone.replace("+", ""); // normalize phone number format without "+" symbol
      } catch (error) {
        console.error("Firebase ID Token verification failed:", error);
        throw new UnauthorizedException("Invalid or expired Firebase authentication token.");
      }
    }

    // normalize phone number to standard 10 digit representation if needed
    const cleanPhone = phoneNumber.replace(/\D/g, "").slice(-10);

    // Lookup or auto-onboard user in database
    let user = await this.prisma.client.user.findUnique({
      where: { phoneNumber: cleanPhone },
      include: {
        globalRoles: true,
        tenantRoles: {
          include: { tenant: true }
        }
      },
    });

    if (!user) {
      // Auto-onboard as a generic user
      user = await this.prisma.client.user.create({
        data: {
          phoneNumber: cleanPhone,
          fullName: "New Guest",
        },
        include: {
          globalRoles: true,
          tenantRoles: {
            include: { tenant: true }
          }
        },
      });
    }

    // Determine highest role
    const isSuperAdmin = user.globalRoles.some((r: any) => r.role === GlobalRole.SUPER_ADMIN);
    
    let activeRole: string = "CUSTOMER";
    let activeTenantId: string | null = null;
    let activeTenantName: string | null = null;

    if (isSuperAdmin) {
      activeRole = "SUPER_ADMIN";
    } else if (user.tenantRoles.length > 0) {
      const firstRole = user.tenantRoles[0];
      activeRole = firstRole.role;
      activeTenantId = firstRole.tenantId;
      activeTenantName = firstRole.tenant.name;
    }

    // Sign session JWT
    const payload = {
      sub: user.id,
      phone: user.phoneNumber,
      role: activeRole,
      tenantId: activeTenantId,
      isSuperAdmin,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        phone: user.phoneNumber,
        role: activeRole,
        fullName: user.fullName,
        tenantId: activeTenantId,
        tenantName: activeTenantName,
      },
    };
  }
}
