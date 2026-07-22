import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, data: { name: string; address: string }) {
    return this.prisma.client.property.create({
      data: {
        tenantId,
        name: data.name,
        address: data.address,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.client.property.findMany({
      where: { tenantId }
    });
  }

  async findOne(tenantId: string, id: string) {
    const property = await this.prisma.client.property.findFirst({
      where: {
        id,
        tenantId,
      }
    });
    if (!property) {
      throw new NotFoundException(`Property with identifier ${id} not found under this tenant`);
    }
    return property;
  }

  async update(tenantId: string, id: string, data: { name?: string; address?: string }) {
    await this.findOne(tenantId, id);
    return this.prisma.client.property.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    return this.prisma.client.property.delete({
      where: { id },
    });
  }
}
