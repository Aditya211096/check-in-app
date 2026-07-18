import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { RoomKind, BedStatus } from "@prisma/client";

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  // ================= ROOM TYPES =================

  async createRoomType(tenantId: string, data: { propertyId: string; name: string; kind: RoomKind; basePrice: number }) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      // Confirm property exists in tenant scope
      const property = await txPrisma.property.findFirst({
        where: { id: data.propertyId },
      });
      if (!property) {
        throw new NotFoundException("Target property not found.");
      }

      return txPrisma.roomType.create({
        data: {
          tenantId,
          propertyId: data.propertyId,
          name: data.name,
          kind: data.kind,
          basePrice: data.basePrice,
        },
      });
    });
  }

  async findRoomTypes(tenantId: string, propertyId: string) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      return txPrisma.roomType.findMany({
        where: { propertyId },
      });
    });
  }

  async updateRoomType(tenantId: string, id: string, data: { name?: string; basePrice?: number }) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      const roomType = await txPrisma.roomType.findUnique({
        where: { id },
      });
      if (!roomType) {
        throw new NotFoundException("Room Type not found.");
      }
      return txPrisma.roomType.update({
        where: { id },
        data,
      });
    });
  }

  async removeRoomType(tenantId: string, id: string) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      const roomType = await txPrisma.roomType.findUnique({
        where: { id },
      });
      if (!roomType) {
        throw new NotFoundException("Room Type not found.");
      }
      return txPrisma.roomType.delete({
        where: { id },
      });
    });
  }

  // ================= ROOMS & BEDS =================

  async createRoom(tenantId: string, data: { roomTypeId: string; code: string; bunkBedsCount?: number }) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      const roomType = await txPrisma.roomType.findUnique({
        where: { id: data.roomTypeId },
      });
      if (!roomType) {
        throw new NotFoundException("Room type does not exist.");
      }

      // Check if room with this code already exists in this tenant scope
      const existingRoom = await txPrisma.room.findFirst({
        where: {
          code: data.code,
          roomType: { propertyId: roomType.propertyId },
        },
      });
      if (existingRoom) {
        throw new BadRequestException(`Room with code ${data.code} already exists at this property.`);
      }

      // Create the Room entry
      const room = await txPrisma.room.create({
        data: {
          tenantId,
          roomTypeId: data.roomTypeId,
          code: data.code,
        },
      });

      // Automatically generate Beds
      const bedsData: any[] = [];
      if (roomType.kind === RoomKind.DORM) {
        const bunkBeds = data.bunkBedsCount || 1;
        // Each bunk bed yields 2 single beds: Lower (L) and Upper (U)
        for (let i = 1; i <= bunkBeds; i++) {
          bedsData.push({
            tenantId,
            roomId: room.id,
            code: `${data.code}-B${i}-L`,
            status: BedStatus.AVAILABLE,
          });
          bedsData.push({
            tenantId,
            roomId: room.id,
            code: `${data.code}-B${i}-U`,
            status: BedStatus.AVAILABLE,
          });
        }
      } else {
        // Private room maps to exactly 1 bed entry
        bedsData.push({
          tenantId,
          roomId: room.id,
          code: `${data.code}-Bed`,
          status: BedStatus.AVAILABLE,
        });
      }

      await txPrisma.bed.createMany({
        data: bedsData,
      });

      return txPrisma.room.findUnique({
        where: { id: room.id },
        include: { beds: true },
      });
    });
  }

  async findRooms(tenantId: string, propertyId: string) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      return txPrisma.room.findMany({
        where: {
          roomType: { propertyId },
        },
        include: {
          roomType: true,
          beds: true,
        },
      });
    });
  }

  async removeRoom(tenantId: string, id: string) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      const room = await txPrisma.room.findUnique({
        where: { id },
      });
      if (!room) {
        throw new NotFoundException("Room not found.");
      }

      // Delete child beds first
      await txPrisma.bed.deleteMany({
        where: { roomId: id },
      });

      return txPrisma.room.delete({
        where: { id },
      });
    });
  }
}
