import { Controller, Get, Module, NestModule, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { PrismaModule } from "./prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { PropertiesModule } from "./modules/properties/properties.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { CustomerProfileModule } from "./modules/customer-profile/customer-profile.module";
import { IdsKycModule } from "./modules/ids-kyc/ids-kyc.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { CheckInModule } from "./modules/checkin/checkin.module";
import { RequestsModule } from "./modules/requests/requests.module";
import { FeedbackModule } from "./modules/feedback/feedback.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { SuperAdminModule } from "./modules/super-admin/super-admin.module";
import { TenantContextMiddleware } from "./middleware/tenant-context.middleware";

@Controller()
class HealthController {
  @Get("healthz") health() { return { ok: true }; }
}

@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: false }, // Mounted manually below via TenantContextMiddleware
    }),
    PrismaModule,
    AuthModule,
    TenantsModule,
    PropertiesModule,
    InventoryModule,
    CustomerProfileModule,
    IdsKycModule,
    BookingsModule,
    CheckInModule,
    RequestsModule,
    FeedbackModule,
    NotificationsModule,
    SuperAdminModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantContextMiddleware)
      .exclude(
        { path: 'healthz', method: RequestMethod.GET },
        { path: 'auth/verify', method: RequestMethod.POST },
        { path: 'internal/tenants/provision', method: RequestMethod.POST },
        { path: 'notifications/whatsapp/webhook', method: RequestMethod.ALL },
        { path: 'requests/sse', method: RequestMethod.GET }
      )
      .forRoutes('*');
  }
}
