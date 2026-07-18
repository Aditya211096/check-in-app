# DB Migrations & RLS

Prisma manages the schema (`checkin-be/prisma/schema.prisma`). For features Prisma can't express (RLS policies, GIN indexes, extensions), add a manual `prisma/migrations/<ts>_<name>/migration.sql` file appended after the generated diff.

## Extensions
```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
```

## Row-Level Security
Every tenant-scoped table follows this pattern (example on `Property`):
```sql
ALTER TABLE "Property" ENABLE ROW LEVEL SECURITY;

-- Reads
CREATE POLICY property_tenant_read ON "Property" FOR SELECT
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Writes
CREATE POLICY property_tenant_write ON "Property" FOR ALL
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Super admin bypass (uses a separate DB role)
CREATE POLICY property_super ON "Property" FOR ALL TO super_role USING (true) WITH CHECK (true);
```

Nest interceptor:
```ts
await this.prisma.$executeRawUnsafe(`SET LOCAL app.tenant_id = '${tenantId}'`);
```

## Migration workflow
```bash
# in checkin-be
npx prisma migrate dev --name m1_foundations
# Edit generated migration.sql to append RLS blocks
npx prisma migrate deploy  # in CI/CD
```

## Seed
`prisma/seed.ts` creates:
- 1 Super Admin (phone from env)
- 2 Tenants, 2 Properties each
- 4 Room types, 20 beds
- 3 Staff, 2 Managers per property
- 5 sample Customer profiles (verified KYC)
