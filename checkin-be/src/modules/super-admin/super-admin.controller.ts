import { Controller, Get, UseGuards, Req, ForbiddenException } from "@nestjs/common";
import { SuperAdminService } from "./super-admin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("super")
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
  constructor(private readonly superService: SuperAdminService) {}

  private checkSuperAdmin(req: any) {
    if (req.user?.role !== "SUPER_ADMIN" && !req.user?.isSuperAdmin) {
      throw new ForbiddenException("Only super administrators are authorized to access this command center.");
    }
  }

  @Get("telemetry")
  async getTelemetry(@Req() req: any) {
    this.checkSuperAdmin(req);
    return this.superService.getTelemetry();
  }

  @Get("audit-logs")
  async getAuditLogs(@Req() req: any) {
    this.checkSuperAdmin(req);
    return this.superService.getAuditLogs();
  }
}
