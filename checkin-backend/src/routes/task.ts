import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { sseManager } from '../services/sse';
import { Role, TaskStatus } from '@prisma/client';

const router = Router();

// GET /tasks - Fetch active complaints/tasks
router.get('/', authenticate, async (req: TenantRequest, res: Response) => {
  const { tenantId, userRole, userId } = req;

  try {
    if (userRole === Role.CUSTOMER) {
      // Customer gets complaints raised by themselves
      const tasks = await prisma.task.findMany({
        where: { creatorId: userId },
        include: { booking: { include: { room: true } } },
        orderBy: { createdAt: 'desc' },
      });
      return res.json(tasks);
    }

    // Staff / Manager sees all tasks for the property
    if (!tenantId) {
      return res.status(400).json({ error: 'Tenant context is missing.' });
    }

    const tasks = await prisma.task.findMany({
      where: { tenantId },
      include: {
        booking: { include: { room: true } },
        creator: { select: { fullName: true, phoneNumber: true } },
        assignedTo: { select: { fullName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tasks);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /tasks - Raise a complaint / service request
router.post('/', authenticate, async (req: TenantRequest, res: Response) => {
  const { tenantId, userId, userRole } = req;
  const { bookingId, description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required.' });
  }

  try {
    let resolvedTenantId = tenantId;
    let resolvedBookingId = bookingId;

    // If raised by Guest, auto-detect booking and tenant details
    if (userRole === Role.CUSTOMER) {
      const activeBooking = await prisma.booking.findFirst({
        where: { guestId: userId, status: 'CHECKED_IN' },
      });

      if (!activeBooking) {
        return res.status(400).json({ error: 'No active check-in found to link complaint.' });
      }

      resolvedTenantId = activeBooking.tenantId;
      resolvedBookingId = activeBooking.id;
    }

    if (!resolvedTenantId || !resolvedBookingId) {
      return res.status(400).json({ error: 'Tenant context and booking ID are required.' });
    }

    const task = await prisma.task.create({
      data: {
        tenantId: resolvedTenantId,
        bookingId: resolvedBookingId,
        description,
        creatorId: userId!,
        status: TaskStatus.PENDING,
      },
      include: {
        booking: { include: { room: true } },
        creator: { select: { fullName: true } },
      },
    });

    // Notify all staff at the property about the new ticket (Real-time SSE)
    sseManager.sendToTenantStaff(resolvedTenantId, 'task_new', task);

    return res.json({ message: 'Complaint registered successfully.', task });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /tasks/:id/acknowledge - Staff/Housekeeping acknowledges ticket
router.post('/:id/acknowledge', authenticate, async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { userId, userRole } = req;

  if (userRole === Role.CUSTOMER) {
    return res.status(403).json({ error: 'Forbidden.' });
  }

  try {
    const task = await prisma.task.update({
      where: { id: id as string },
      data: {
        status: TaskStatus.IN_PROGRESS,
        assignedToId: userId,
      },
      include: { booking: true },
    });

    // Notify Guest of ticket assignment and state change
    sseManager.sendToUser((task as any).booking.guestId, 'task_updated', task);
    // Sync update to other staff
    sseManager.sendToTenantStaff(task.tenantId, 'task_updated', task);

    return res.json({ message: 'Task acknowledged and marked in-progress.', task });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /tasks/:id/eta - Manager/Admin sets ETA to solve (compulsory details step)
router.put('/:id/eta', authenticate, requireRole([Role.OWNER, Role.MANAGER, Role.STAFF]), async (req: TenantRequest, res: Response) => {
  const { id } = req.params;
  const { etaMinutes } = req.body; // in minutes

  if (!etaMinutes || isNaN(etaMinutes)) {
    return res.status(400).json({ error: 'A valid solve ETA (in minutes) is required.' });
  }

  try {
    const task = await prisma.task.update({
      where: { id: id as string },
      data: {
        etaMinutes: parseInt(etaMinutes),
        etaSetAt: new Date(),
      },
      include: { booking: true },
    });

    // Send real-time countdown clock values to Guest
    sseManager.sendToUser((task as any).booking.guestId, 'task_updated', task);
    // Update the owner/manager UI dashboard
    sseManager.sendToTenantStaff(task.tenantId, 'task_updated', task);

    return res.json({ message: 'ETA updated successfully.', task });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /tasks/:id/resolve - Mark task as solved
router.post('/:id/resolve', authenticate, async (req: TenantRequest, res: Response) => {
  const { id } = req.params;

  try {
    const task = await prisma.task.update({
      where: { id: id as string },
      data: {
        status: TaskStatus.RESOLVED,
        resolvedAt: new Date(),
      },
      include: { booking: true },
    });

    // Notify Guest of resolution
    sseManager.sendToUser((task as any).booking.guestId, 'task_resolved', task);
    // Notify Manager/Owner dashboard
    sseManager.sendToTenantStaff(task.tenantId, 'task_updated', task);

    return res.json({ message: 'Task resolved successfully.', task });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
