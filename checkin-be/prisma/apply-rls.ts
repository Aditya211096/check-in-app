import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  console.log("Applying Row-Level Security (RLS) policies to PostgreSQL...");

  const tenantScopedTables = [
    "Property",
    "RoomType",
    "Room",
    "Bed",
    "Booking",
    "BookingBed",
    "BookingGuest",
    "Request",
    "Complaint",
    "ServiceEvent",
    "Feedback",
    "Payment",
    "AuditLog"
  ];

  try {
    // 1. Enable RLS on Tenant table based on its own ID
    console.log("Enabling RLS on Tenant table...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "Tenant" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS tenant_isolation_policy ON "Tenant";`);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY tenant_isolation_policy ON "Tenant" FOR ALL
        USING ("id" = nullif(current_setting('app.tenant_id', true), ''));
    `);

    // 2. Enable RLS on Tenant-scoped tables based on tenantId column
    for (const table of tenantScopedTables) {
      console.log(`Enabling RLS on ${table}...`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "${table}" ENABLE ROW LEVEL SECURITY;`);
      await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS ${table.toLowerCase()}_tenant_policy ON "${table}";`);
      await prisma.$executeRawUnsafe(`
        CREATE POLICY ${table.toLowerCase()}_tenant_policy ON "${table}" FOR ALL
          USING ("tenantId" = nullif(current_setting('app.tenant_id', true), ''))
          WITH CHECK ("tenantId" = nullif(current_setting('app.tenant_id', true), ''));
      `);
    }

    // 3. Enable RLS on User table (allows global users or matching tenantId)
    console.log("Enabling RLS on User table...");
    await prisma.$executeRawUnsafe(`ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;`);
    await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS user_tenant_policy ON "User";`);
    await prisma.$executeRawUnsafe(`
      CREATE POLICY user_tenant_policy ON "User" FOR ALL
        USING (
          "tenantId" IS NULL OR 
          "tenantId" = nullif(current_setting('app.tenant_id', true), '')
        );
    `);

    console.log("Successfully applied all Row-Level Security (RLS) policies.");
  } catch (error) {
    console.error("Error applying RLS policies:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
