import { Controller, Get, Module } from "@nestjs/common";

@Controller()
class HealthController {
  @Get("healthz") health() { return { ok: true, tenant: null }; }
}

@Module({
  imports: [],
  controllers: [HealthController],
})
export class AppModule {}
// TODO: import feature modules under src/modules/* per BRD milestones.
// Order: auth → tenants → properties → rooms → beds → customer-profile → ids-kyc →
//        bookings → checkin → checkout → requests → complaints → notifications →
//        feedback → billing → audit.
