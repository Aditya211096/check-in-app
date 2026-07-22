import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller()
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  private checkSuperAdmin(req: any) {
    if (req.user?.role !== "SUPER_ADMIN" && !req.user?.isSuperAdmin) {
      throw new ForbiddenException("Only super administrators can perform this action.");
    }
  }

  // Provisioning pipeline endpoint (bypass tenant isolation since it's global)
  @Post("internal/tenants/provision")
  async provision(
    @Body()
    body: {
      name: string;
      slug: string;
      adminUserPhone: string;
      adminFullName: string;
      propertyName: string;
      propertyAddress: string;
    }
  ) {
    // This is typically called by platform internal daemon or super admin
    return this.tenantsService.provision(body);
  }

  @Post("tenants")
  @UseGuards(JwtAuthGuard)
  async create(@Body() body: { name: string; slug: string }, @Req() req: any) {
    this.checkSuperAdmin(req);
    return this.tenantsService.create(body);
  }

  @Get("tenants")
  @UseGuards(JwtAuthGuard)
  async findAll(@Req() req: any) {
    this.checkSuperAdmin(req);
    return this.tenantsService.findAll();
  }

  @Get("tenants/:id")
  @UseGuards(JwtAuthGuard)
  async findOne(@Param("id") id: string, @Req() req: any) {
    if (req.user.role !== "SUPER_ADMIN" && !req.user.isSuperAdmin && req.user.tenantId !== id) {
      throw new ForbiddenException("You do not have access to this tenant.");
    }
    return this.tenantsService.findOne(id);
  }

  @Put("tenants/:id")
  @UseGuards(JwtAuthGuard)
  async update(@Param("id") id: string, @Body() body: { name?: string; status?: string }, @Req() req: any) {
    if (req.user.role !== "SUPER_ADMIN" && !req.user.isSuperAdmin && req.user.tenantId !== id) {
      throw new ForbiddenException("You are not authorized to update this tenant.");
    }
    return this.tenantsService.update(id, body);
  }

  @Delete("tenants/:id")
  @UseGuards(JwtAuthGuard)
  async remove(@Param("id") id: string, @Req() req: any) {
    this.checkSuperAdmin(req);
    return this.tenantsService.remove(id);
  }
}
