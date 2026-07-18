import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from "@nestjs/common";
import { CustomerProfileService } from "./customer-profile.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("me")
@UseGuards(JwtAuthGuard)
export class CustomerProfileController {
  constructor(private readonly profileService: CustomerProfileService) {}

  @Get("profile")
  async getProfile(@Req() req: any) {
    try {
      return await this.profileService.getProfile(req.user.sub);
    } catch (e) {
      // If profile does not exist yet, return null/default structure gracefully
      return null;
    }
  }

  @Post("profile")
  async upsertProfile(@Body() body: { fullName: string; dob?: string; address?: string; emergency?: string; consentShare?: boolean }, @Req() req: any) {
    return this.profileService.upsertProfile(req.user.sub, body);
  }

  @Get("dependents")
  async getDependents(@Req() req: any) {
    return this.profileService.getDependents(req.user.sub);
  }

  @Post("dependents")
  async addDependent(@Body() body: { fullName: string; relation: string; dob?: string }, @Req() req: any) {
    return this.profileService.addDependent(req.user.sub, body);
  }

  @Delete("dependents/:id")
  async removeDependent(@Param("id") id: string, @Req() req: any) {
    return this.profileService.removeDependent(req.user.sub, id);
  }
}
