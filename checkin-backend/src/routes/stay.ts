import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { Role, BookingStatus } from '@prisma/client';

const router = Router();

// GET /stay/rooms - Fetch rooms grid (scoped to tenantId)
router.get('/rooms', authenticate, async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context is missing.' });
  }

  try {
    const rooms = await prisma.room.findMany({
      where: { tenantId },
      orderBy: { roomNumber: 'asc' },
    });
    return res.json(rooms);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /stay/rooms - Create a room (Owner/Admin only)
router.post('/rooms', authenticate, requireRole([Role.OWNER]), async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  const { roomNumber, roomType, isDormitory, totalBunkBeds } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context is missing.' });
  }
  if (!roomNumber || !roomType) {
    return res.status(400).json({ error: 'Room number and type are required.' });
  }

  try {
    const room = await prisma.room.create({
      data: {
        tenantId,
        roomNumber,
        roomType,
        isDormitory: !!isDormitory,
        totalBunkBeds: isDormitory ? parseInt(totalBunkBeds || 0) : 0,
        status: 'AVAILABLE',
      },
    });
    return res.json({ message: 'Room created successfully.', room });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /stay/rooms/:id - Delete a room (Owner/Admin only)
router.delete('/rooms/:id', authenticate, requireRole([Role.OWNER]), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.room.delete({
      where: { id: id as string },
    });
    return res.json({ message: 'Room deleted successfully.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /stay/rooms/:id/status - Update room status (Staff/Housekeeping/Manager/Owner)
router.put('/rooms/:id/status', authenticate, async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // E.g., 'CLEANING', 'AVAILABLE', 'MAINTENANCE'

  try {
    const room = await prisma.room.update({
      where: { id: id as string },
      data: { status },
    });
    return res.json({ message: 'Room status updated.', room });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /stay/bookings - Fetch all bookings (scoped to tenant)
router.get('/bookings', authenticate, async (req: TenantRequest, res: Response) => {
  const { tenantId, userRole, userId } = req;

  try {
    // Customers can only see their own bookings
    if (userRole === Role.CUSTOMER) {
      const bookings = await prisma.booking.findMany({
        where: { guestId: userId },
        include: { room: true, tenant: true },
        orderBy: { checkInDate: 'desc' },
      });
      return res.json(bookings);
    }

    // Staff/Managers/Owners see all bookings in the tenant property
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context is missing.' });
    }
    const bookings = await prisma.booking.findMany({
      where: { tenantId },
      include: { room: true, guest: true },
      orderBy: { checkInDate: 'asc' },
    });
    return res.json(bookings);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /stay/bookings - Create booking (Front desk staff / Manager / Owner)
router.post('/bookings', authenticate, requireRole([Role.OWNER, Role.MANAGER, Role.STAFF]), async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  const { guestPhoneNumber, roomId, checkInDate, checkOutDate, specialRequests } = req.body;

  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context is missing.' });
  }

  try {
    // Find room details to check capacity
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const capacity = room.isDormitory ? room.totalBunkBeds * 2 : 1;

    // Check currently active or upcoming bookings for this room
    const activeCount = await prisma.booking.count({
      where: {
        roomId,
        status: { in: [BookingStatus.UPCOMING, BookingStatus.CHECKED_IN] },
      },
    });

    if (activeCount >= capacity) {
      return res.status(400).json({ error: 'Room capacity is full for the selected unit.' });
    }

    // Locate the guest by phone number
    const guest = await prisma.user.findUnique({
      where: { phoneNumber: guestPhoneNumber },
    });

    if (!guest) {
      return res.status(404).json({ error: 'Guest not registered. Onboard the guest phone number first.' });
    }

    const booking = await prisma.booking.create({
      data: {
        tenantId,
        guestId: guest.id,
        roomId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        specialRequests,
        status: BookingStatus.UPCOMING,
      },
    });

    return res.json({ message: 'Booking created successfully.', booking });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /stay/bookings/:id/check-in - Check-In action
router.post('/bookings/:id/check-in', authenticate, requireRole([Role.OWNER, Role.MANAGER, Role.STAFF]), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
      include: { guest: true },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    if (!(booking as any).guest.isVerified) {
      return res.status(400).json({ error: 'Cannot check-in. Guest ID verification is required.' });
    }

    const room = await prisma.room.findUnique({ where: { id: booking.roomId } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found.' });
    }

    const capacity = room.isDormitory ? room.totalBunkBeds * 2 : 1;

    // Check count of currently checked in guests
    const activeCount = await prisma.booking.count({
      where: {
        roomId: booking.roomId,
        status: BookingStatus.CHECKED_IN,
      },
    });

    if (activeCount >= capacity) {
      return res.status(400).json({ error: 'Cannot check-in. Room capacity is already at maximum.' });
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: id as string },
      data: { status: BookingStatus.CHECKED_IN },
    });

    // Update room status
    const newRoomStatus = room.isDormitory 
      ? (activeCount + 1 >= capacity ? 'OCCUPIED' : 'AVAILABLE')
      : 'OCCUPIED';

    await prisma.room.update({
      where: { id: booking.roomId },
      data: { status: newRoomStatus },
    });

    return res.json({ message: 'Check-in completed successfully.', booking: updatedBooking });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /stay/bookings/:id/check-out - Check-Out action
router.post('/bookings/:id/check-out', authenticate, async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: id as string },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    // Complete check-out status
    const updatedBooking = await prisma.booking.update({
      where: { id: id as string },
      data: { status: BookingStatus.CHECKED_OUT },
    });

    // Handle room cleaning status rules
    const room = await prisma.room.findUnique({ where: { id: booking.roomId } });
    const activeCount = await prisma.booking.count({
      where: {
        roomId: booking.roomId,
        status: BookingStatus.CHECKED_IN,
        NOT: { id: id as string },
      },
    });

    // Cleaning is triggered only when the last active booking in a dorm checks out
    const newRoomStatus = room?.isDormitory && activeCount > 0 ? 'AVAILABLE' : 'CLEANING';

    await prisma.room.update({
      where: { id: booking.roomId },
      data: { status: newRoomStatus },
    });

    return res.json({ message: 'Check-out completed successfully.', booking: updatedBooking });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
