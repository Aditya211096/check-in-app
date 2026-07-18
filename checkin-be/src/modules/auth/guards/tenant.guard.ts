import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Role } from "@prisma/client";

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("User context is missing. Make sure JwtAuthGuard is applied first.");
    }

    let tenantId = user.tenantId;

    // Super Admin can override the active tenant context using a header
    if (user.role === Role.SUPER_ADMIN) {
      const headerTenantId = request.headers["x-tenant-id"];
      if (headerTenantId) {
        tenantId = headerTenantId;
      }
    }

    // Tenant-scoped users must have a valid tenant ID
    if (user.role !== Role.SUPER_ADMIN && user.role !== Role.CUSTOMER && !tenantId) {
      throw new ForbiddenException("A valid tenant context is required for this action.");
    }

    // Attach tenantId to request object for use in transaction context
    request.tenantId = tenantId;
    return true;
  }
}
