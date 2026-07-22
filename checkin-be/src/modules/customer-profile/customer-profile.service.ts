import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class CustomerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.client.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException("Profile not found.");
    }
    // Return compatible shape for frontend
    return {
      id: user.id,
      userId: user.id,
      fullName: user.fullName,
      email: user.email,
      dob: null,
      address: null,
      emergency: null,
      consentShare: true,
      dependents: [],
      kycDocuments: [],
    };
  }

  async upsertProfile(userId: string, data: { fullName: string; email?: string }) {
    return this.prisma.client.user.update({
      where: { id: userId },
      data: {
        fullName: data.fullName,
        email: data.email,
      },
    });
  }

  // ================= DEPENDENTS (MOCK FOR COMPATIBILITY) =================

  async getDependents(userId: string) {
    return [];
  }

  async addDependent(userId: string, data: { fullName: string; relation: string; dob?: Date | string }) {
    return { id: "mock-dep-id", ...data };
  }

  async removeDependent(userId: string, dependentId: string) {
    return { success: true };
  }
}
