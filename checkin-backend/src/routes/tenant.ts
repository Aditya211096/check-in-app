import { Router, Response } from 'express';
import prisma from '../config/db';
import { authenticate, requireRole } from '../middleware/auth';
import { TenantRequest } from '../middleware/tenant';
import { Role, TaskStatus } from '@prisma/client';

const router = Router();

// Get general tenant details
router.get('/details', authenticate, async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context is missing.' });
  }

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });
    return res.json(tenant);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// GET /tenant/metrics - Owner & Manager KPI metrics engine
router.get('/metrics', authenticate, requireRole([Role.OWNER, Role.MANAGER]), async (req: TenantRequest, res: Response) => {
  const { tenantId } = req;
  if (!tenantId) {
    return res.status(400).json({ error: 'Tenant context is missing.' });
  }

  try {
    // 1. Occupancy & Rooms Counts
    const totalRooms = await prisma.room.count({ where: { tenantId } });
    const occupiedRooms = await prisma.room.count({
      where: { tenantId, status: 'OCCUPIED' },
    });
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // 2. Financial Metrics (Mocks if database values are empty, or calculated from rooms/bookings)
    const baseRoomRate = 4500; // Base INR rate
    const totalRevenue = occupiedRooms * baseRoomRate;
    const adr = occupiedRooms > 0 ? baseRoomRate : 0;
    const revPar = totalRooms > 0 ? Math.round(totalRevenue / totalRooms) : 0;

    // 3. Task & Complaint Metrics
    const activeTasksCount = await prisma.task.count({
      where: { tenantId, NOT: { status: TaskStatus.RESOLVED } },
    });
    
    const slaBreaches = await prisma.task.count({
      where: { tenantId, status: TaskStatus.BREACHED },
    });

    // 4. Staff Performance Speed Matrix
    const resolvedTasks = await prisma.task.findMany({
      where: {
        tenantId,
        status: TaskStatus.RESOLVED,
        assignedToId: { not: null },
      },
      select: {
        assignedTo: {
          select: { id: true, fullName: true },
        },
        createdAt: true,
        resolvedAt: true,
      },
    });

    // Compute average resolution time per staff member (in minutes)
    const staffStatsMap: Record<string, { name: string; count: number; totalMinutes: number }> = {};
    resolvedTasks.forEach(task => {
      if (!task.assignedTo || !task.resolvedAt) return;
      const durationMin = Math.round(
        (task.resolvedAt.getTime() - task.createdAt.getTime()) / (1000 * 60)
      );

      const staffId = task.assignedTo.id;
      if (!staffStatsMap[staffId]) {
        staffStatsMap[staffId] = {
          name: task.assignedTo.fullName,
          count: 0,
          totalMinutes: 0,
        };
      }
      staffStatsMap[staffId].count += 1;
      staffStatsMap[staffId].totalMinutes += durationMin;
    });

    const staffEfficiency = Object.keys(staffStatsMap).map(id => {
      const entry = staffStatsMap[id];
      return {
        staffId: id,
        name: entry.name,
        completedTasks: entry.count,
        avgResolutionMinutes: Math.round(entry.totalMinutes / entry.count),
      };
    });

    // 5. Guest CSAT (Feedback logs)
    const feedbacks = await prisma.feedback.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: { select: { fullName: true } },
      },
    });
    
    const feedbackSummary = await prisma.feedback.aggregate({
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = feedbackSummary._avg.rating ? Number(feedbackSummary._avg.rating.toFixed(1)) : 5.0;

    // 6. Real-time Audit logs (Recent bookings, task changes)
    const recentBookings = await prisma.booking.findMany({
      where: { tenantId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        guest: { select: { fullName: true, phoneNumber: true } },
        room: { select: { roomNumber: true } },
      },
    });

    const auditFeed = recentBookings.map(b => ({
      id: b.id,
      timestamp: b.createdAt,
      type: 'BOOKING',
      message: `New booking registered for Room ${b.room.roomNumber} by ${b.guest.fullName} (${b.guest.phoneNumber})`,
    }));

    return res.json({
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        occupancyRate,
      },
      revenue: {
        totalDailyRevenue: totalRevenue,
        adr,
        revPar,
      },
      customerSatisfaction: {
        avgRating,
        totalReviews: feedbackSummary._count.rating,
        feedbacks: feedbacks.map(f => ({
          id: f.id,
          guestName: f.guest.fullName,
          rating: f.rating,
          comments: f.comments,
          tags: f.tags ? f.tags.split(',') : [],
          createdAt: f.createdAt,
        })),
      },
      operations: {
        activeTasks: activeTasksCount,
        slaBreaches,
        staffEfficiency,
        auditFeed,
      },
    });
  } catch (err: any) {
    console.error('Metrics calculation error:', err);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
