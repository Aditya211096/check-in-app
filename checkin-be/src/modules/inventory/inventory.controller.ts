import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req, ForbiddenException } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../auth/guards/tenant.guard";

@Controller("inventory")
@UseGuards(JwtAuthGuard, TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== "SUPER_ADMIN" && req.user.role !== "PROPERTY_ADMIN") {
      throw new ForbiddenException("Only administrators can configure property inventory.");
    }
  }

  // Rooms
  @Post("rooms")
  async createRoom(@Body() body: { propertyId: string; roomNumber: string; isDormitory?: boolean; bunkCount?: number }, @Req() req: any) {
    this.checkAdmin(req);
    return this.inventoryService.createRoom(req.tenantId, body);
  }

  @Get("rooms/:propertyId")
  async findRooms(@Param("propertyId") propertyId: string, @Req() req: any) {
    return this.inventoryService.findRooms(req.tenantId, propertyId);
  }

  @Delete("rooms/:id")
  async removeRoom(@Param("id") id: string, @Req() req: any) {
    this.checkAdmin(req);
    return this.inventoryService.removeRoom(req.tenantId, id);
  }
}
