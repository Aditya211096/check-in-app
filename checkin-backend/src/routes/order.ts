import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { sseManager } from '../services/sse';
import { Role, OrderStatus } from '@prisma/client';

const router = Router();

// GET /orders - Fetch kitchen orders
router.get('/', authenticate, async (req: TenantRequest, res: Response) => {
  const { tenantId, userRole, userId } = req;

  try {
    if (userRole === Role.CUSTOMER) {
      const orders = await prisma.order.findMany({
        where: { guestId: userId },
        include: { booking: { include: { room: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(orders);
    }

    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context is missing.' });
    }

    // Kitchen/Staff/Manager see all orders
    const orders = await prisma.order.findMany({
      where: { tenantId },
      include: {
        booking: { include: { room: true } },
        guest: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(orders);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /orders - Place F&B kitchen order
router.post('/', authenticate, async (req: TenantRequest, res: Response) => {
  const { userId, tenantId } = req;
  const { items } = req.body; // Array of { name, quantity, price }

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array is required to place order.' });
  }

  try {
    // Locate guest's active check-in
    const activeBooking = await prisma.booking.findFirst({
      where: { guestId: userId, status: 'CHECKED_IN' },
    });

    if (!activeBooking) {
      return res.status(400).json({ error: 'No active check-in found to place service orders.' });
    }

    // Calculate total bill price
    let totalPrice = 0;
    items.forEach((item: any) => {
      totalPrice += (item.price || 0) * (item.quantity || 1);
    });

    const order = await prisma.order.create({
      data: {
        tenantId: activeBooking.tenantId,
        bookingId: activeBooking.id,
        guestId: userId!,
        items,
        totalPrice,
        status: OrderStatus.RECEIVED,
      },
      include: {
        booking: { include: { room: true } },
        guest: { select: { fullName: true } },
      },
    });

    // Notify Kitchen queue dashboard immediately
    sseManager.sendToTenantStaff(activeBooking.tenantId, 'order_new', order);

    return res.json({ message: 'Kitchen order placed successfully.', order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /orders/:id/status - Update kitchen order status (Kitchen/Staff/Manager)
router.put('/:id/status', authenticate, async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // RECEIVED, PREPARING, ON_THE_WAY, DELIVERED, CANCELLED

  if (!status || !Object.values(OrderStatus).includes(status)) {
    return res.status(400).json({ error: 'Invalid order status.' });
  }

  try {
    const order = await prisma.order.update({
      where: { id: id as string },
      data: { status },
      include: { booking: true },
    });

    // Send update notification to Guest
    sseManager.sendToUser((order as any).booking.guestId, 'order_updated', order);
    // Sync update to other staff
    sseManager.sendToTenantStaff(order.tenantId, 'order_updated', order);

    return res.json({ message: 'Order status updated successfully.', order });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
