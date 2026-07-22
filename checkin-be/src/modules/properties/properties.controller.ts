import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from "@nestjs/common";
import { PropertiesService } from "./properties.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../auth/guards/tenant.guard";

@Controller("properties")
@UseGuards(JwtAuthGuard, TenantGuard)
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "PROPERTY_ADMIN") {
      throw new ForbiddenException("Only administrators can manage property settings.");
    }
  }

  @Post()
  async create(@Body() body: { name: string; address: string }, @Req() req: any) {
    this.checkAdmin(req);
    return this.propertiesService.create(req.tenantId, body);
  }

  @Get()
  async findAll(@Req() req: any) {
    return this.propertiesService.findAll(req.tenantId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Req() req: any) {
    return this.propertiesService.findOne(req.tenantId, id);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() body: { name?: string; address?: string }, @Req() req: any) {
    this.checkAdmin(req);
    return this.propertiesService.update(req.tenantId, id, body);
  }

  @Delete(":id")
  async remove(@Param("id") id: string, @Req() req: any) {
    this.checkAdmin(req);
    return this.propertiesService.remove(req.tenantId, id);
  }
}
