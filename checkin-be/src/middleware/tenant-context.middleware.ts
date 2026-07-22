import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly cls: ClsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    const path = req.baseUrl || req.path || req.url || '';

    // Bypass list for routes that do not need tenant isolation context
    const isGlobal = path.includes('/healthz') || 
                     path.includes('/auth/verify') || 
                     path.includes('/internal/tenants/provision') ||
                     path.includes('/super/telemetry') ||
                     path.includes('/notifications/whatsapp/webhook');

    if (!tenantId && !isGlobal) {
      throw new UnauthorizedException('Tenant execution context is missing.');
    }

    this.cls.run(() => {
      if (tenantId) {
        this.cls.set('TENANT_ID', tenantId);
      }
      next();
    });
  }
}
