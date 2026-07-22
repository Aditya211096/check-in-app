import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { BookingStatus } from "@prisma/client";
import * as crypto from "crypto";

@Injectable()
export class CheckInService {
  constructor(private readonly prisma: PrismaService) {}

  // ── WALK-IN CHECK-IN (Manager assigns room to guest on-the-spot) ──────────────
  async walkInCheckIn(
    tenantId: string,
    data: {
      propertyId: string;
      roomId: string;
      fullName: string;
      phone: string;
      checkOut: string;
    }
  ) {
    // 1. Verify room exists
    const room = await this.prisma.client.room.findUnique({ where: { id: data.roomId } });
    if (!room) throw new NotFoundException("Room not found.");

    // 2. Find or create user
    const cleanPhone = data.phone.replace(/\D/g, "").slice(-10);
    let user = await this.prisma.client.user.findUnique({ where: { phoneNumber: cleanPhone } });
    if (!user) {
      user = await this.prisma.client.user.create({
        data: {
          phoneNumber: cleanPhone,
          fullName: data.fullName,
        },
      });
    }

    // 3. Create booking directly in CHECKED_IN state
    const booking = await this.prisma.client.booking.create({
      data: {
        tenantId,
        propertyId: data.propertyId,
        guestId: user.id,
        roomId: data.roomId,
        status: BookingStatus.CHECKED_IN,
        checkInAt: new Date(),
        checkOutAt: new Date(data.checkOut),
      },
      include: {
        room: true,
        guest: true,
      },
    });

    return booking;
  }

  // ── CONFIRM EXISTING RESERVATION → CHECK-IN ────────────────────────────────
  async checkInBooking(bookingId: string, tenantId: string) {
    const booking = await this.prisma.client.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.tenantId !== tenantId) throw new BadRequestException("Access denied.");
    if (booking.status !== BookingStatus.CONFIRMED && booking.status !== BookingStatus.PAYMENT_PENDING) {
      throw new BadRequestException(`Booking must be CONFIRMED or PAYMENT_PENDING to check-in. Current status: ${booking.status}`);
    }

    return this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHECKED_IN },
    });
  }

  // ── CHECK-OUT ──────────────────────────────────────────────────────────────
  async checkOutBooking(bookingId: string, tenantId: string, notes?: string) {
    const booking = await this.prisma.client.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.tenantId !== tenantId) throw new BadRequestException("Access denied.");
    if (booking.status !== BookingStatus.CHECKED_IN) {
      throw new BadRequestException(`Booking must be CHECKED_IN to check-out. Current: ${booking.status}`);
    }

    // Update booking status
    const updated = await this.prisma.client.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHECKED_OUT },
    });

    // Log platform audit
    await this.prisma.client.platformAuditLog.create({
      data: {
        userId: booking.guestId,
        action: "CHECK_OUT",
        entityType: "Booking",
        entityId: bookingId,
        payload: { notes: notes ?? "" },
        ipAddress: "127.0.0.1",
      },
    });

    return updated;
  }

  // ── GENERATE DIGITAL PASS ─────────────────────────────────────────────────
  async getDigitalPass(bookingId: string, guestId: string) {
    const booking = await this.prisma.client.booking.findUnique({
      where: { id: bookingId },
      include: {
        property: true,
        room: true,
        guest: true,
      },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.guestId !== guestId) throw new BadRequestException("Access denied.");

    // Generate a deterministic QR payload
    const qrPayload = crypto
      .createHash("sha256")
      .update(bookingId + booking.checkInAt.toISOString())
      .digest("hex")
      .slice(0, 16)
      .toUpperCase();

    return {
      bookingId,
      qrPayload,
      guestName: booking.guest.fullName,
      property: {
        name: booking.property.name,
        address: booking.property.address,
      },
      checkInAt: booking.checkInAt,
      checkOutAt: booking.checkOutAt,
      status: booking.status,
      room: booking.room ? {
        roomNumber: booking.room.roomNumber,
        isDormitory: booking.room.isDormitory,
      } : null,
    };
  }
}
