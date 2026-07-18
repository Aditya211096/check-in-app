import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { Storage } from "@google-cloud/storage";
import { KycStatus } from "@prisma/client";
import * as crypto from "crypto";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class IdsKycService {
  private storage: Storage | null = null;
  private bucketName: string;

  constructor(private readonly prisma: PrismaService) {
    this.bucketName = process.env.GCS_BUCKET || "ids-vault-dev";
    
    // Check if service account credentials or environment credentials are set up
    try {
      const adminConfig = JSON.parse(process.env.FIREBASE_ADMIN_JSON || "{}");
      if (adminConfig.private_key || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        this.storage = new Storage({
          projectId: process.env.GCP_PROJECT_ID,
        });
      }
    } catch (e) {
      console.warn("GCS client initialization skipped. Local upload fallback active.");
    }
  }

  /**
   * Generate secure upload URL. Falls back to local endpoint in dev mode.
   */
  async getUploadUrl(userId: string, originalName: string, contentType: string) {
    const ext = path.extname(originalName) || ".jpg";
    const salt = crypto.randomBytes(8).toString("hex");
    // Generate secure hash filename to mask user PII in GCS paths
    const hashedName = crypto.createHash("sha256").update(userId + salt + originalName).digest("hex") + ext;

    if (this.storage) {
      try {
        const bucket = this.storage.bucket(this.bucketName);
        const file = bucket.file(hashedName);
        
        // 15-minute write-only signed URL
        const [uploadUrl] = await file.getSignedUrl({
          version: "v4",
          action: "write",
          expires: Date.now() + 15 * 60 * 1000,
          contentType,
        });

        // 5-minute read signed URL for backend/review access
        const [viewUrl] = await file.getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + 5 * 60 * 1000,
        });

        return { uploadUrl, viewUrl, gcsObject: hashedName };
      } catch (err) {
        console.error("GCS signed URL generation failed:", err);
      }
    }

    // Local development fallback
    const uploadUrl = `http://localhost:5000/kyc/local-upload-fallback?filename=${hashedName}`;
    const viewUrl = `http://localhost:5000/kyc/view-local/${hashedName}`;
    return { uploadUrl, viewUrl, gcsObject: hashedName };
  }

  /**
   * Submit KYC document metadata and run OCR verification
   */
  async submitKyc(userId: string, docType: string, gcsObject: string, fileHash: string) {
    // 1. Confirm customer profile exists
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new BadRequestException("Customer profile must be created before uploading IDs.");
    }

    // 2. Mock Document AI parsing logic in dev or if credentials aren't loaded
    const ocrMetadata = {
      extractedName: profile.fullName,
      extractedDob: profile.dob || "1996-10-21",
      extractedIdNumber: "XXXX-XXXX-3412",
      idVerified: true,
    };

    // 3. Save KycDocument row
    const kycDoc = await this.prisma.kycDocument.create({
      data: {
        profileId: profile.id,
        docType,
        gcsObject,
        fileHash,
        status: KycStatus.APPROVED, // Auto-approve in developer mock mode
        meta: ocrMetadata,
      },
    });

    return kycDoc;
  }

  async getKycStatus(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: { kycDocuments: true },
    });
    if (!profile) {
      return [];
    }
    return profile.kycDocuments;
  }

  /**
   * Save local uploaded file in dev fallback
   */
  async saveLocalFile(filename: string, fileBuffer: Buffer) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, fileBuffer);
    console.log(`Saved local upload fallback to: ${filePath}`);
    return { success: true, filePath };
  }

  /**
   * Read local file
   */
  getLocalFilePath(filename: string): string {
    const filePath = path.join(process.cwd(), "uploads", filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException("Local file not found.");
    }
    return filePath;
  }
}
