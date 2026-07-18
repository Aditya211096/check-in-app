import { Controller, Get, Module } from "@nestjs/common";
import { PrismaModule } from "./prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { TenantsModule } from "./modules/tenants/tenants.module";
import { PropertiesModule } from "./modules/properties/properties.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { CustomerProfileModule } from "./modules/customer-profile/customer-profile.module";
import { IdsKycModule } from "./modules/ids-kyc/ids-kyc.module";
import { BookingsModule } from "./modules/bookings/bookings.module";

@Controller()
class HealthController {
  @Get("healthz") health() { return { ok: true }; }
}

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    TenantsModule,
    PropertiesModule,
    InventoryModule,
    CustomerProfileModule,
    IdsKycModule,
    BookingsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}






// TODO: import feature modules under src/modules/* per BRD milestones.
// Order: auth → tenants → properties → rooms → beds → customer-profile → ids-kyc →
//        bookings → checkin → checkout → requests → complaints → notifications →
//        feedback → billing → audit.
