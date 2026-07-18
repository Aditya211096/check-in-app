import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from "@nestjs/common";
import { TenantsService } from "./tenants.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Role } from "@prisma/client";

@Controller("tenants")
@UseGuards(JwtAuthGuard)
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  private checkSuperAdmin(req: any) {
    if (req.user?.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException("Only super administrators can perform this action.");
    }
  }

  @Post()
  async create(@Body() body: { name: string; plan?: string }, @Req() req: any) {
    this.checkSuperAdmin(req);
    return this.tenantsService.create(body);
  }

  @Get()
  async findAll(@Req() req: any) {
    this.checkSuperAdmin(req);
    return this.tenantsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: any) {
    // A user can read their own tenant, or must be a SUPER_ADMIN
    if (req.user.role !== Role.SUPER_ADMIN && req.user.tenantId !== id) {
      throw new ForbiddenException("You do not have access to this tenant.");
    }
    return this.tenantsService.findOne(id);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: { name?: string; plan?: string }, @Req() req: any) {
    // Only SUPER_ADMIN or property admins of this tenant can update it
    if (req.user.role !== Role.SUPER_ADMIN && (req.user.role !== Role.PROPERTY_ADMIN || req.user.tenantId !== id)) {
      throw new ForbiddenException("You are not authorized to update this tenant.");
    }
    return this.tenantsService.update(id, body);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: any) {
    this.checkSuperAdmin(req);
    return this.tenantsService.remove(id);
  }
}
