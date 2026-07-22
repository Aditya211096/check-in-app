import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(tenantId: string, data: { propertyId: string; roomNumber: string; isDormitory?: boolean; bunkCount?: number }) {
    const property = await this.prisma.client.property.findFirst({
      where: { id: data.propertyId, tenantId },
    });
    if (!property) {
      throw new NotFoundException("Target property not found.");
    }

    const existingRoom = await this.prisma.client.room.findFirst({
      where: {
        roomNumber: data.roomNumber,
        propertyId: data.propertyId,
      },
    });
    if (existingRoom) {
      throw new BadRequestException(`Room with number ${data.roomNumber} already exists at this property.`);
    }

    return this.prisma.client.room.create({
      data: {
        propertyId: data.propertyId,
        roomNumber: data.roomNumber,
        isDormitory: data.isDormitory || false,
        bunkCount: data.bunkCount || 0,
      },
    });
  }

  async findRooms(tenantId: string, propertyId: string) {
    return this.prisma.client.room.findMany({
      where: {
        propertyId,
        property: { tenantId }
      },
      include: {
        property: true
      }
    });
  }

  async removeRoom(tenantId: string, id: string) {
    const room = await this.prisma.client.room.findFirst({
      where: {
        id,
        property: { tenantId }
      },
    });
    if (!room) {
      throw new NotFoundException("Room not found.");
    }

    return this.prisma.client.room.delete({
      where: { id },
    });
  }
}
