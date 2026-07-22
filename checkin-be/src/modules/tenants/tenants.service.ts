import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { TenantRole } from "@prisma/client";

@Injectable()
export class TenantsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; slug: string; status?: string }) {
    return this.prisma.client.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        status: data.status || "ACTIVE",
      },
    });
  }

  /**
   * Automated Tenant Provisioning Pipeline (Section 3)
   */
  async provision(data: {
    name: string;
    slug: string;
    adminUserPhone: string;
    adminFullName: string;
    propertyName: string;
    propertyAddress: string;
  }) {
    // 1. Create Tenant
    const tenant = await this.create({
      name: data.name,
      slug: data.slug,
      status: "ACTIVE",
    });

    // 2. Find or create admin User
    const cleanPhone = data.adminUserPhone.replace(/\D/g, "").slice(-10);
    let user = await this.prisma.client.user.findUnique({
      where: { phoneNumber: cleanPhone }
    });

    if (!user) {
      user = await this.prisma.client.user.create({
        data: {
          phoneNumber: cleanPhone,
          fullName: data.adminFullName,
        }
      });
    }

    // 3. Associate UserRoleTenant as PROPERTY_ADMIN
    await this.prisma.client.userRoleTenant.create({
      data: {
        userId: user.id,
        tenantId: tenant.id,
        role: TenantRole.PROPERTY_ADMIN,
      }
    });

    // 4. Create default Property
    const property = await this.prisma.client.property.create({
      data: {
        tenantId: tenant.id,
        name: data.propertyName,
        address: data.propertyAddress,
      }
    });

    // 5. Seed default Room configurations
    const rooms = await Promise.all([
      this.prisma.client.room.create({
        data: {
          propertyId: property.id,
          roomNumber: "101",
          isDormitory: false,
        }
      }),
      this.prisma.client.room.create({
        data: {
          propertyId: property.id,
          roomNumber: "102",
          isDormitory: true,
          bunkCount: 6,
        }
      })
    ]);

    // 6. Log provisioning event to WORM PlatformAuditLog
    await this.prisma.client.platformAuditLog.create({
      data: {
        userId: user.id,
        action: "TENANT_PROVISIONED",
        entityType: "Tenant",
        entityId: tenant.id,
        payload: {
          tenantName: tenant.name,
          propertyId: property.id,
          roomsCount: rooms.length,
        },
        ipAddress: "127.0.0.1",
      }
    });

    return {
      success: true,
      tenant,
      admin: user,
      property,
      rooms,
    };
  }

  async findAll() {
    return this.prisma.client.tenant.findMany();
  }

  async findOne(id: string) {
    const tenant = await this.prisma.client.tenant.findUnique({
      where: { id },
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async update(id: string, data: { name?: string; status?: string }) {
    await this.findOne(id);
    return this.prisma.client.tenant.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.prisma.client.tenant.delete({
      where: { id },
    });
    return { success: true };
  }
}
