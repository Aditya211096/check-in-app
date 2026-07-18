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
      bedId: string;
      fullName: string;
      phone: string;
      checkOut: string;
      specialReqs?: Record<string, unknown>;
    },
    @Req() req: any
  ) {
    return this.checkInService.walkInCheckIn(req.user.tenantId, body);
  }

  // Manager: confirm existing reservation → check-in
  @Post(":bookingId/confirm-checkin")
  async confirmCheckIn(@Param("bookingId") bookingId: string, @Req() req: any) {
    return this.checkInService.checkInBooking(bookingId, req.user.tenantId);
  }

  // Manager: check-out a booking
  @Post(":bookingId/checkout")
  async checkOut(
    @Param("bookingId") bookingId: string,
    @Body() body: { notes?: string },
    @Req() req: any
  ) {
    return this.checkInService.checkOutBooking(bookingId, req.user.tenantId, body.notes);
  }

  // Guest: get digital pass for their booking
  @Get("pass/:bookingId")
  async getPass(@Param("bookingId") bookingId: string, @Req() req: any) {
    const profile = await this.checkInService["prisma"].customerProfile.findUnique({
      where: { userId: req.user.sub },
    });
    if (!profile) throw new Error("Profile not found.");
    return this.checkInService.getDigitalPass(bookingId, profile.id);
  }

  // Housekeeping: mark a bed clean
  @Post("bed/:bedId/clean")
  async markClean(@Param("bedId") bedId: string, @Req() req: any) {
    return this.checkInService.markBedClean(bedId, req.user.tenantId);
  }
}
