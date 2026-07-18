import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { BookingStatus } from "@prisma/client";

@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  // ── AVAILABILITY ──────────────────────────────────────────────────────────

  @Get("availability")
  async checkAvailability(
    @Query("propertyId") propertyId: string,
    @Query("checkIn") checkIn: string,
    @Query("checkOut") checkOut: string
  ) {
    return this.bookingsService.checkAvailability(propertyId, new Date(checkIn), new Date(checkOut));
  }

  // ── CREATE BOOKING ────────────────────────────────────────────────────────

  @Post()
  async createBooking(
    @Body()
    body: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      bedIds: string[];
      specialReqs?: Record<string, unknown>;
    },
    @Req() req: any
  ) {
    const user = req.user;
    // Resolve profileId from user
    const profile = await this.bookingsService["prisma"].customerProfile.findUnique({
      where: { userId: user.sub },
    });
    if (!profile) {
      throw new Error("Please complete your guest profile before booking.");
    }
    return this.bookingsService.createBooking(user.tenantId ?? "global", profile.id, body);
  }

  // ── GUEST BOOKINGS ────────────────────────────────────────────────────────

  @Get("mine")
  async getMyBookings(@Req() req: any) {
    const profile = await this.bookingsService["prisma"].customerProfile.findUnique({
      where: { userId: req.user.sub },
    });
    if (!profile) return [];
    return this.bookingsService.getBookingsForGuest(profile.id);
  }

  @Get("mine/:id")
  async getMyBookingById(@Param("id") id: string, @Req() req: any) {
    const profile = await this.bookingsService["prisma"].customerProfile.findUnique({
      where: { userId: req.user.sub },
    });
    return this.bookingsService.getBookingById(id, profile?.id);
  }

  @Delete("mine/:id/cancel")
  async cancelMyBooking(@Param("id") id: string, @Req() req: any) {
    const profile = await this.bookingsService["prisma"].customerProfile.findUnique({
      where: { userId: req.user.sub },
    });
    if (!profile) throw new Error("Profile not found.");
    return this.bookingsService.cancelBooking(id, profile.id);
  }

  // ── MANAGER/PROPERTY BOOKINGS ─────────────────────────────────────────────

  @Get("property/:propertyId")
  async getPropertyBookings(
    @Param("propertyId") propertyId: string,
    @Query("status") status: BookingStatus,
    @Req() req: any
  ) {
    return this.bookingsService.getBookingsForProperty(req.user.tenantId, propertyId, status);
  }

  @Post(":id/confirm")
  async confirmBooking(@Param("id") id: string, @Req() req: any) {
    return this.bookingsService.confirmBooking(id, req.user.tenantId);
  }
}
