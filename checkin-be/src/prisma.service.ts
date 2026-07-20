import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    this.$connect()
      .then(() => {
        console.log("Prisma Client connected to Postgres database successfully.");
      })
      .catch((err) => {
        console.warn("Prisma Client initial DB connection notice (app running):", err?.message || err);
      });
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (err) {
      console.error("Prisma Client disconnect error:", err);
    }
  }

  /**
   * Helper to run queries inside a transaction with Postgres Tenant RLS context.
   */
  async tx<T>(tenantId: string | null | undefined, fn: (txPrisma: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>): Promise<T> {
    return this.$transaction(async (prisma) => {
      if (tenantId) {
        // Enforce UUID validation to prevent SQL injection in executeRawUnsafe
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(tenantId)) {
          await prisma.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
        } else {
          await prisma.$executeRawUnsafe(`SET LOCAL app.tenant_id = ''`);
        }
      } else {
        await prisma.$executeRawUnsafe(`SET LOCAL app.tenant_id = ''`);
      }
      return fn(prisma);
    });
  }
}
