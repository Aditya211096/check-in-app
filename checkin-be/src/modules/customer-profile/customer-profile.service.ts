import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class CustomerProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.customerProfile.findUnique({
      where: { userId },
      include: { dependents: true, kycDocuments: true },
    });
    if (!profile) {
      throw new NotFoundException("Profile not found.");
    }
    return profile;
  }

  async upsertProfile(userId: string, data: { fullName: string; dob?: Date | string; address?: string; emergency?: string; consentShare?: boolean }) {
    const parsedDob = data.dob ? new Date(data.dob) : null;
    
    // Make sure we update User table fullName field as well to keep them in sync
    await this.prisma.user.update({
      where: { id: userId },
      data: { fullName: data.fullName },
    });

    return this.prisma.customerProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: data.fullName,
        dob: parsedDob,
        address: data.address,
        emergency: data.emergency,
        consentShare: data.consentShare ?? true,
      },
      update: {
        fullName: data.fullName,
        dob: parsedDob,
        address: data.address,
        emergency: data.emergency,
        consentShare: data.consentShare ?? true,
      },
      include: { dependents: true },
    });
  }

  // ================= DEPENDENTS =================

  async getDependents(userId: string) {
    const profile = await this.getProfile(userId);
    return this.prisma.dependent.findMany({
      where: { profileId: profile.id },
    });
  }

  async addDependent(userId: string, data: { fullName: string; relation: string; dob?: Date | string }) {
    const profile = await this.getProfile(userId);
    const parsedDob = data.dob ? new Date(data.dob) : null;

    return this.prisma.dependent.create({
      data: {
        profileId: profile.id,
        fullName: data.fullName,
        relation: data.relation,
        dob: parsedDob,
      },
    });
  }

  async removeDependent(userId: string, dependentId: string) {
    const profile = await this.getProfile(userId);
    const dependent = await this.prisma.dependent.findFirst({
      where: { id: dependentId, profileId: profile.id },
    });
    if (!dependent) {
      throw new NotFoundException("Dependent not found under your profile.");
    }
    return this.prisma.dependent.delete({
      where: { id: dependentId },
    });
  }
}
