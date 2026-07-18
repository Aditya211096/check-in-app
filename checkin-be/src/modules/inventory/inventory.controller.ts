import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, ForbiddenException } from "@nestjs/common";
import { InventoryService } from "./inventory.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../auth/guards/tenant.guard";
import { Role, RoomKind } from "@prisma/client";

@Controller("inventory")
@UseGuards(JwtAuthGuard, TenantGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  private checkAdmin(req: any) {
    if (req.user.role !== Role.SUPER_ADMIN && req.user.role !== Role.PROPERTY_ADMIN) {
      throw new ForbiddenException("Only administrators can configure property inventory.");
    }
  }

  // Room Types
  @Post("room-types")
  async createRoomType(@Body() body: { propertyId: string; name: string; kind: RoomKind; basePrice: number }, @Req() req: any) {
    this.checkAdmin(req);
    return this.inventoryService.createRoomType(req.tenantId, body);
  }

  @Get("room-types/:propertyId")
  async findRoomTypes(@Param("propertyId") propertyId: string, @Req() req: any) {
    return this.inventoryService.findRoomTypes(req.tenantId, propertyId);
  }

  @Put("room-types/:id")
  async updateRoomType(@Param("id") id: string, @Body() body: { name?: string; basePrice?: number }, @Req() req: any) {
    this.checkAdmin(req);
    return this.inventoryService.updateRoomType(req.tenantId, id, body);
  }

  @Delete("room-types/:id")
  async removeRoomType(@Param("id") id: string, @Req() req: any) {
    this.checkAdmin(req);
    return this.inventoryService.removeRoomType(req.tenantId, id);
  }

  // Rooms
  @Post("rooms")
  async createRoom(@Body() body: { roomTypeId: string; code: string; bunkBedsCount?: number }, @Req() req: any) {
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
