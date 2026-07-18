import { Request, Response, NextFunction } from 'express';

// Extend Express Request type locally for safety
export interface TenantRequest extends Request {
  tenantId?: string;
  userRole?: string;
  userId?: string;
}

export const tenantHandler = (req: Request, res: Response, next: NextFunction) => {
  // Extract tenant ID from custom header, query param, or subdomain
  let tenantId = req.headers['x-tenant-id'] as string || req.query.tenantId as string;

  if (!tenantId && req.headers.host) {
    const hostParts = req.headers.host.split('.');
    // If using subdomains, e.g., hotel-a.checkinapp.com
    if (hostParts.length > 2) {
      tenantId = hostParts[0];
    }
  }

  // Attach to request context
  (req as TenantRequest).tenantId = tenantId;

  next();
};

export const requireTenant = (req: Request, res: Response, next: NextFunction) => {
  const tenantRequest = req as TenantRequest;
  if (!tenantRequest.tenantId) {
    return res.status(400).json({
      error: 'Tenant context is missing. Please provide X-Tenant-ID header or tenantId query parameter.',
    });
  }
  next();
};
