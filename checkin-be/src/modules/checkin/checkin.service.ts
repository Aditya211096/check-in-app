import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { BookingStatus, BedStatus } from "@prisma/client";
import * as crypto from "crypto";

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  // ── WALK-IN CHECK-IN (Manager assigns bed to guest on-the-spot) ──────────────
  async walkInCheckIn(
    tenantId: string,
    data: {
      propertyId: string;
      bedId: string;
      fullName: string;
      phone: string;
      checkOut: string;
      specialReqs?: Record<string, unknown>;
    }
  ) {
    // 1. Verify bed is available
    const bed = await this.prisma.bed.findUnique({ where: { id: data.bedId } });
    if (!bed) throw new NotFoundException("Bed not found.");
    if (bed.status !== BedStatus.AVAILABLE) {
      throw new BadRequestException(`Bed is currently ${bed.status}. Cannot check-in.`);
    }

    // 2. Find or create a guest user record
    let user = await this.prisma.user.findUnique({ where: { phone: data.phone } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone: data.phone,
          role: "CUSTOMER",
          fullName: data.fullName,
        },
      });
    }

    // 3. Ensure CustomerProfile exists
    let profile = await this.prisma.customerProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      profile = await this.prisma.customerProfile.create({
        data: { userId: user.id, fullName: data.fullName },
      });
    }

    // 4. Create a booking directly in CHECKED_IN state
    const booking = await this.prisma.booking.create({
      data: {
        tenantId,
        propertyId: data.propertyId,
        profileId: profile.id,
        status: BookingStatus.CHECKED_IN,
        checkIn: new Date(),
        checkOut: new Date(data.checkOut),
        specialReqs: (data.specialReqs as any) ?? {},
        beds: {
          create: [{ tenantId, bedId: data.bedId }],
        },
      },
      include: {
        beds: { include: { bed: true } },
        profile: true,
      },
    });

    // 5. Mark bed as OCCUPIED
    await this.prisma.bed.update({
      where: { id: data.bedId },
      data: { status: BedStatus.OCCUPIED },
    });

    return booking;
  }

  // ── CONFIRM EXISTING RESERVATION → CHECK-IN ────────────────────────────────
  async checkInBooking(bookingId: string, tenantId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { beds: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.tenantId !== tenantId) throw new BadRequestException("Access denied.");
    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException(`Booking must be CONFIRMED to check-in. Current status: ${booking.status}`);
    }

    // Mark beds OCCUPIED
    await this.prisma.bed.updateMany({
      where: { id: { in: booking.beds.map((b) => b.bedId) } },
      data: { status: BedStatus.OCCUPIED },
    });

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHECKED_IN },
    });
  }

  // ── CHECK-OUT ──────────────────────────────────────────────────────────────
  async checkOutBooking(bookingId: string, tenantId: string, notes?: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { beds: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.tenantId !== tenantId) throw new BadRequestException("Access denied.");
    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException(`Booking must be CHECKED_IN to check-out. Current: ${booking.status}`);
    }

    // Mark beds as DIRTY (needs cleaning)
    await this.prisma.bed.updateMany({
      where: { id: { in: booking.beds.map((b) => b.bedId) } },
      data: { status: BedStatus.DIRTY },
    });

    // Update booking status
    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHECKED_OUT },
    });

    // Log audit
    await this.prisma.auditLog.create({
      data: {
        tenantId,
        actorId: "SYSTEM",
        action: "CHECK_OUT",
        entity: "Booking",
        entityId: bookingId,
        meta: { notes: notes ?? "" },
      },
    });

    return updated;
  }

  // ── GENERATE DIGITAL PASS ─────────────────────────────────────────────────
  async getDigitalPass(bookingId: string, profileId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: { select: { name: true, city: true, address: true, checkInAt: true, checkOutAt: true } },
        beds: { include: { bed: { include: { room: { include: { roomType: true } } } } } },
        profile: { select: { fullName: true } },
      },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.profileId !== profileId) throw new BadRequestException("Access denied.");

    // Generate a deterministic QR payload (hash of bookingId + checkIn)
    const qrPayload = crypto
      .createHash("sha256")
      .update(bookingId + booking.checkIn.toISOString())
      .digest("hex")
      .slice(0, 16)
      .toUpperCase();

    return {
      bookingId,
      qrPayload,
      guestName: booking.profile.fullName,
      property: booking.property,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      status: booking.status,
      beds: booking.beds.map((bb) => ({
        bedCode: bb.bed.code,
        roomCode: bb.bed.room.code,
        roomType: bb.bed.room.roomType.name,
      })),
    };
  }

  // ── MARK BED CLEAN (Housekeeping) ──────────────────────────────────────────
  async markBedClean(bedId: string, tenantId: string) {
    const bed = await this.prisma.bed.findUnique({ where: { id: bedId } });
    if (!bed) throw new NotFoundException("Bed not found.");
    if (bed.tenantId !== tenantId) throw new BadRequestException("Access denied.");
    if (bed.status !== BedStatus.DIRTY) {
      throw new BadRequestException("Bed is not in DIRTY state.");
    }
    return this.prisma.bed.update({
      where: { id: bedId },
      data: { status: BedStatus.AVAILABLE },
    });
  }
}
