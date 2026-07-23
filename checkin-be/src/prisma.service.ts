import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private _tenantClient: any;

  constructor(private readonly cls: ClsService) {
    // Setup pg connection pool for connection pooling (Section 8)
    const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";
    const pool = new Pool({
      connectionString: dbUrl,
      max: Number(process.env.DATABASE_MAX_CONNECTIONS) || 2,
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 5000,
      ssl: process.env.NODE_ENV === 'production' || dbUrl.includes('sslmode') ? { rejectUnauthorized: false } : undefined,
    });
    
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;

    // Build the dynamic tenancy client (Section 2 Step B)
    this._tenantClient = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }: { model: string; operation: string; args: any; query: any }) {
            const tenantId = cls.get<string>('TENANT_ID');
            
            if (!tenantId) {
              return query(args); // Skip filtering for system tasks, migrations, and global SuperAdmin tasks
            }

            const globalModels = ['Tenant', 'User', 'UserGlobalRole', 'PlatformAuditLog'];
            if (globalModels.includes(model)) {
              return query(args);
            }

            // Convert findUnique to findFirst to allow dynamic where filters with tenantId
            if (operation === 'findUnique') {
              operation = 'findFirst';
            }

            const readOperations = ['findMany', 'findFirst', 'findUnique', 'count', 'aggregate', 'groupBy'];
            if (readOperations.includes(operation)) {
              args.where = args.where || {};
              args.where['tenantId'] = tenantId;
            }

            const writeOperations = ['create', 'createMany', 'update', 'updateMany', 'upsert', 'delete', 'deleteMany'];
            if (writeOperations.includes(operation)) {
              if (operation === 'create') {
                args.data = args.data || {};
                args.data['tenantId'] = tenantId;
              } else if (operation === 'createMany') {
                const records = args.data;
                if (Array.isArray(records)) {
                  records.forEach((row: any) => {
                    row['tenantId'] = tenantId;
                  });
                }
              } else {
                args.where = args.where || {};
                args.where['tenantId'] = tenantId;
              }
            }

            return query(args);
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      await this.pool.end();
    } catch (err) {
      console.error("Prisma Client disconnect error:", err);
    }
  }

  // Exposed client for developers to run queries on
  get client() {
    return this._tenantClient;
  }

  /**
   * Helper to run queries inside a transaction with dynamic CLS Tenant context (compatibility helper).
   */
  async tx<T>(tenantId: string | null | undefined, fn: (txPrisma: any) => Promise<T>): Promise<T> {
    if (tenantId) {
      return this.cls.run(async () => {
        this.cls.set('TENANT_ID', tenantId);
        return fn(this.client);
      });
    }
    return fn(this.client);
  }
}
