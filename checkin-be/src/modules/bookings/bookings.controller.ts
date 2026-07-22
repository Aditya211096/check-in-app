import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, BadRequestException } from "@nestjs/common";
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
    @Query("checkInAt") checkInAt: string,
    @Query("checkOutAt") checkOutAt: string
  ) {
    if (!checkInAt || !checkOutAt) {
      throw new BadRequestException("checkInAt and checkOutAt query parameters are required.");
    }
    return this.bookingsService.checkAvailability(propertyId, new Date(checkInAt), new Date(checkOutAt));
  }

  // ── CREATE BOOKING ────────────────────────────────────────────────────────

  @Post()
  async createBooking(
    @Body()
    body: {
      propertyId: string;
      checkInAt: string;
      checkOutAt: string;
      roomId?: string;
    },
    @Req() req: any
  ) {
    const user = req.user;
    const tenantId = user.tenantId || "global-tenant";
    return this.bookingsService.createBooking(tenantId, user.sub, body);
  }

  // ── GUEST BOOKINGS ────────────────────────────────────────────────────────

  @Get("mine")
  async getMyBookings(@Req() req: any) {
    return this.bookingsService.getBookingsForGuest(req.user.sub);
  }

  @Get("mine/:id")
  async getMyBookingById(@Param("id") id: string, @Req() req: any) {
    return this.bookingsService.getBookingById(id, req.user.sub);
  }

  @Delete("mine/:id/cancel")
  async cancelMyBooking(@Param("id") id: string, @Req() req: any) {
    return this.bookingsService.cancelBooking(id, req.user.sub);
  }

  // ── MANAGER/PROPERTY BOOKINGS ─────────────────────────────────────────────

  @Get("property/:propertyId")
  async getPropertyBookings(
    @Param("propertyId") propertyId: string,
    @Query("status") status: BookingStatus,
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.bookingsService.getBookingsForProperty(tenantId, propertyId, status);
  }

  @Post(":id/confirm")
  async confirmBooking(@Param("id") id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.bookingsService.confirmBooking(id, tenantId);
  }
}
