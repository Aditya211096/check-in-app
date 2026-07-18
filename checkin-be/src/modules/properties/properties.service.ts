import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { slug: string; name: string; city: string; address: string; gstin?: string; policies?: any }) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      return txPrisma.property.create({
        data: {
          tenantId,
          slug: data.slug,
          name: data.name,
          city: data.city,
          address: data.address,
          gstin: data.gstin,
          policies: data.policies || {},
        },
      });
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      return txPrisma.property.findMany();
    });
  }

  async findOne(tenantId: string, idOrSlug: string) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      const property = await txPrisma.property.findFirst({
        where: {
          OR: [
            { id: idOrSlug },
            { slug: idOrSlug }
          ]
        }
      });
      if (!property) {
        throw new NotFoundException(`Property with identifier ${idOrSlug} not found under this tenant`);
      }
      return property;
    });
  }

  async update(tenantId: string, id: string, data: { name?: string; city?: string; address?: string; gstin?: string; policies?: any }) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      await this.findOne(tenantId, id);
      return txPrisma.property.update({
        where: { id },
        data,
      });
    });
  }

  async remove(tenantId: string, id: string) {
    return this.prisma.tx(tenantId, async (txPrisma) => {
      await this.findOne(tenantId, id);
      return txPrisma.property.delete({
        where: { id },
      });
    });
  }
}
