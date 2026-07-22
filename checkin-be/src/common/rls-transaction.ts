import { PrismaClient } from '@prisma/client';

export async function executeRlsTransaction<T>(
  prisma: PrismaClient,
  tenantId: string,
  callback: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL app.current_tenant_id = '${tenantId}';`
    );
    return callback(tx as any);
  });
}
