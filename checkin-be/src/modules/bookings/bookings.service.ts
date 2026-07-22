import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { BookingStatus } from "@prisma/client";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── AVAILABILITY ────────────────────────────────────────────────────────────

  /**
   * Returns all rooms for a property with their availability status for a date range.
   */
  async checkAvailability(propertyId: string, checkInAt: Date, checkOutAt: Date) {
    const rooms = await this.prisma.client.room.findMany({
      where: { propertyId },
      include: {
        bookings: {
          where: {
            status: {
              in: [
                BookingStatus.CONFIRMED,
                BookingStatus.CHECKED_IN,
                BookingStatus.PAYMENT_PENDING,
              ],
            },
            NOT: {
              OR: [
                { checkOutAt: { lte: checkInAt } },
                { checkInAt: { gte: checkOutAt } },
              ],
            },
          },
        },
      },
    });

    return rooms.map((room: any) => {
      const occupancy = room.bookings.length;
      const isAvailable = room.isDormitory 
        ? occupancy < room.bunkCount 
        : occupancy === 0;

      return {
        roomId: room.id,
        roomNumber: room.roomNumber,
        isDormitory: room.isDormitory,
        bunkCount: room.bunkCount,
        available: isAvailable,
        currentOccupancy: occupancy,
      };
    });
  }

  // ─── CREATE BOOKING ──────────────────────────────────────────────────────────

  async createBooking(
    tenantId: string,
    guestId: string,
    data: {
      propertyId: string;
      checkInAt: string;
      checkOutAt: string;
      roomId?: string;
    }
  ) {
    const checkInAt = new Date(data.checkInAt);
    const checkOutAt = new Date(data.checkOutAt);

    if (checkInAt >= checkOutAt) {
      throw new BadRequestException("Check-out must be after check-in.");
    }

    if (data.roomId) {
      const availability = await this.checkAvailability(data.propertyId, checkInAt, checkOutAt);
      const roomInfo = availability.find((r: any) => r.roomId === data.roomId);
      if (!roomInfo) throw new BadRequestException("Room not found in property.");
      if (!roomInfo.available) throw new BadRequestException(`Room ${roomInfo.roomNumber} is fully occupied for the selected dates.`);
    }

    return this.prisma.client.booking.create({
      data: {
        tenantId,
        propertyId: data.propertyId,
        guestId,
        roomId: data.roomId || null,
        status: BookingStatus.PAYMENT_PENDING,
        checkInAt,
        checkOutAt,
      },
      include: { room: true, guest: true },
    });
  }

  // ─── LISTING ─────────────────────────────────────────────────────────────────

  async getBookingsForGuest(guestId: string) {
    return this.prisma.client.booking.findMany({
      where: { guestId },
      include: {
        room: true,
        guest: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getBookingsForProperty(tenantId: string, propertyId: string, status?: BookingStatus) {
    return this.prisma.client.booking.findMany({
      where: {
        tenantId,
        propertyId,
        ...(status ? { status } : {}),
      },
      include: {
        room: true,
        guest: true,
      },
      orderBy: { checkInAt: "asc" },
    });
  }

  async getBookingById(bookingId: string, guestId?: string) {
    const booking = await this.prisma.client.booking.findUnique({
      where: { id: bookingId },
      include: {
        room: true,
        guest: true,
      },
    });

    if (!booking) throw new NotFoundException("Booking not found.");
    if (guestId && booking.guestId !== guestId) throw new ForbiddenException("Access denied.");
    return booking;
  }

  // ─── CANCEL ───────────────────────────────────────────────────────────────────

  async cancelBooking(bookingId: string, guestId: string) {
    const booking = await this.getBookingById(bookingId, guestId);

    const cancellable: BookingStatus[] = [BookingStatus.DRAFT, BookingStatus.PAYMENT_PENDING, BookingStatus.CONFIRMED];
    if (!cancellable.includes(booking.status)) {
      throw new BadRequestException(`Cannot cancel a booking with status: ${booking.status}`);
    }

    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED_BY_GUEST },
    });
  }

  // ─── MANAGER: CONFIRM BOOKING ────────────────────────────────────────────────

  async confirmBooking(bookingId: string, tenantId: string) {
    const booking = await this.prisma.client.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.tenantId !== tenantId) throw new ForbiddenException("Access denied.");

    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });
  }
}
