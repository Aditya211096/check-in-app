import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma.service";
import { Role } from "@prisma/client";
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

    // Developer mode fallback for test OTP tokens without requiring service credentials
    if (process.env.NODE_ENV === "development" && idToken.startsWith("mock-token-")) {
      phoneNumber = idToken.replace("mock-token-", "");
    } else {
      try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const decodedPhone = decodedToken.phone_number;
        if (!decodedPhone) {
          throw new UnauthorizedException("Firebase token does not contain a phone number.");
        }
        phoneNumber = decodedPhone;
      } catch (error) {
        console.error("Firebase ID Token verification failed:", error);
        throw new UnauthorizedException("Invalid or expired Firebase authentication token.");
      }
    }

    // Lookup or auto-onboard user in database
    let user = await this.prisma.user.findUnique({
      where: { phone: phoneNumber },
      include: { tenant: true },
    });

    if (!user) {
      // Auto-onboard as CUSTOMER role by default
      user = await this.prisma.user.create({
        data: {
          phone: phoneNumber,
          role: Role.CUSTOMER,
          fullName: "New Guest",
        },
        include: { tenant: true },
      });
    }

    if (user.disabled) {
      throw new UnauthorizedException("Your user account has been disabled.");
    }

    // Sign custom session JWT
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      tenantId: user.tenantId,
    };

    const token = this.jwtService.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        tenantId: user.tenantId,
        tenantName: user.tenant?.name || null,
      },
    };
  }
}
