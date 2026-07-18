import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { BookingStatus, BedStatus } from "@prisma/client";

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── AVAILABILITY ────────────────────────────────────────────────────────────

  /**
   * Returns all beds for a property with their availability status for a date range.
   * Conflicts are calculated by checking overlapping confirmed/checked-in bookings.
   */
  async checkAvailability(propertyId: string, checkIn: Date, checkOut: Date) {
    // Get rooms + beds for this property
    const rooms = await this.prisma.room.findMany({
      where: { roomType: { propertyId } },
      include: {
        roomType: true,
        beds: {
          include: {
            assignments: {
              include: {
                booking: {
                  select: { checkIn: true, checkOut: true, status: true },
                },
              },
            },
          },
        },
      },
    });

    // For each bed, check if it has a conflicting active booking
    const result = rooms.map((room) => ({
      roomId: room.id,
      roomCode: room.code,
      roomType: room.roomType.name,
      kind: room.roomType.kind,
      basePrice: room.roomType.basePrice,
      beds: room.beds.map((bed) => {
        const isConflicted = bed.assignments.some((a) => {
          const active = (
            [
              BookingStatus.CONFIRMED,
              BookingStatus.CHECKED_IN,
              BookingStatus.PAYMENT_PENDING,
            ] as string[]
          ).includes(a.booking.status);
          if (!active) return false;
          const bCheckIn = new Date(a.booking.checkIn);
          const bCheckOut = new Date(a.booking.checkOut);
          // overlap: not (checkOut <= bCheckIn || checkIn >= bCheckOut)
          return !(checkOut <= bCheckIn || checkIn >= bCheckOut);
        });
        return {
          bedId: bed.id,
          bedCode: bed.code,
          available: !isConflicted && bed.status === BedStatus.AVAILABLE,
        };
      }),
    }));

    return result;
  }

  // ─── CREATE BOOKING ──────────────────────────────────────────────────────────

  async createBooking(
    tenantId: string,
    profileId: string,
    data: {
      propertyId: string;
      checkIn: string;
      checkOut: string;
      bedIds: string[];
      specialReqs?: Record<string, unknown>;
    }
  ) {
    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);

    if (checkIn >= checkOut) {
      throw new BadRequestException("Check-out must be after check-in.");
    }
    if (data.bedIds.length === 0) {
      throw new BadRequestException("At least one bed must be selected.");
    }

    // Verify all beds are available
    const availability = await this.checkAvailability(data.propertyId, checkIn, checkOut);
    const allBeds = availability.flatMap((r) => r.beds);

    for (const bedId of data.bedIds) {
      const bedInfo = allBeds.find((b) => b.bedId === bedId);
      if (!bedInfo) throw new BadRequestException(`Bed ${bedId} not found in property.`);
      if (!bedInfo.available) throw new BadRequestException(`Bed ${bedInfo.bedCode} is not available for selected dates.`);
    }

    // Calculate price
    const nightsDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const roomInfo = availability.find((r) => r.beds.some((b) => b.bedId === data.bedIds[0]));
    const totalAmount = (roomInfo?.basePrice ?? 0) * nightsDiff * data.bedIds.length;

    // Create booking with bed assignments
    const booking = await this.prisma.booking.create({
      data: {
        tenantId,
        propertyId: data.propertyId,
        profileId,
        status: BookingStatus.PAYMENT_PENDING,
        checkIn,
        checkOut,
        totalAmount,
        specialReqs: (data.specialReqs as any) ?? {},
        beds: {
          create: data.bedIds.map((bedId) => ({ tenantId, bedId })),
        },
      },
      include: { beds: { include: { bed: true } }, property: true },
    });

    return booking;
  }

  // ─── LISTING ─────────────────────────────────────────────────────────────────

  async getBookingsForGuest(profileId: string) {
    return this.prisma.booking.findMany({
      where: { profileId },
      include: {
        property: { select: { name: true, city: true, slug: true } },
        beds: { include: { bed: { select: { code: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getBookingsForProperty(tenantId: string, propertyId: string, status?: BookingStatus) {
    return this.prisma.booking.findMany({
      where: {
        tenantId,
        propertyId,
        ...(status ? { status } : {}),
      },
      include: {
        profile: { select: { fullName: true } },
        beds: { include: { bed: { select: { code: true, room: { select: { code: true } } } } } },
      },
      orderBy: { checkIn: "asc" },
    });
  }

  async getBookingById(bookingId: string, profileId?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        beds: { include: { bed: { include: { room: { include: { roomType: true } } } } } },
        guests: true,
        requests: true,
        payments: true,
        feedback: true,
      },
    });

    if (!booking) throw new NotFoundException("Booking not found.");
    if (profileId && booking.profileId !== profileId) throw new ForbiddenException("Access denied.");
    return booking;
  }

  // ─── CANCEL ───────────────────────────────────────────────────────────────────

  async cancelBooking(bookingId: string, profileId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.profileId !== profileId) throw new ForbiddenException("Access denied.");

    const cancellable: BookingStatus[] = [BookingStatus.DRAFT, BookingStatus.PAYMENT_PENDING, BookingStatus.CONFIRMED];
    if (!cancellable.includes(booking.status)) {
      throw new BadRequestException(`Cannot cancel a booking with status: ${booking.status}`);
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED_BY_GUEST },
    });
  }

  // ─── MANAGER: CONFIRM BOOKING ────────────────────────────────────────────────

  async confirmBooking(bookingId: string, tenantId: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.tenantId !== tenantId) throw new ForbiddenException("Access denied.");

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CONFIRMED },
    });
  }
}
