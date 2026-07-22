import { Controller, Post, Get, Body, Param, UseGuards, Req } from "@nestjs/common";
import { CheckInService } from "./checkin.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("checkin")
@UseGuards(JwtAuthGuard)
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  // Manager: walk-in guest check-in (no prior booking)
  @Post("walk-in")
  async walkIn(
    @Body() body: {
      propertyId: string;
      roomId: string;
      fullName: string;
      phone: string;
      checkOut: string;
    },
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.checkInService.walkInCheckIn(tenantId, body);
  }

  // Manager: confirm existing reservation → check-in
  @Post(":bookingId/confirm-checkin")
  async confirmCheckIn(@Param("bookingId") bookingId: string, @Req() req: any) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.checkInService.checkInBooking(bookingId, tenantId);
  }

  // Manager: check-out a booking
  @Post(":bookingId/checkout")
  async checkOut(
    @Param("bookingId") bookingId: string,
    @Body() body: { notes?: string },
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.checkInService.checkOutBooking(bookingId, tenantId, body.notes);
  }

  // Guest: get digital pass for their booking
  @Get("pass/:bookingId")
  async getPass(@Param("bookingId") bookingId: string, @Req() req: any) {
    return this.checkInService.getDigitalPass(bookingId, req.user.sub);
  }
}
