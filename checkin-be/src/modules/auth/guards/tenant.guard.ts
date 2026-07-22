import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User context is missing. Make sure JwtAuthGuard is applied first.");
    }

    let tenantId = user.tenantId;

    // Super Admin can override active tenant context via header
    if (user.role === "SUPER_ADMIN" || user.isSuperAdmin) {
      const headerTenantId = request.headers["x-tenant-id"];
      if (headerTenantId) {
        tenantId = headerTenantId;
      }
    }

    // Tenant-scoped users must have a valid tenant ID
    if (user.role !== "SUPER_ADMIN" && !user.isSuperAdmin && user.role !== "CUSTOMER" && !tenantId) {
      throw new ForbiddenException("A valid tenant context is required for this action.");
    }

    request.tenantId = tenantId;
    return true;
  }
}
