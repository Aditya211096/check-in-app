import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";
import { RequestState } from "@prisma/client";

@Injectable()
export class RequestsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── GUEST: Create a Service Request or Complaint ─────────────────────────────
  async create(
    tenantId: string,
    bookingId: string,
    data: {
      type: "REQUEST" | "COMPLAINT";
      category: string;
      priority?: string;
      severity?: string;
      description?: string;
    }
  ) {
    // Verify booking belongs to this tenant
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, tenantId },
    });
    if (!booking) throw new NotFoundException("Booking not found.");

    if (data.type === "COMPLAINT") {
      return this.prisma.complaint.create({
        data: {
          tenantId,
          bookingId,
          category: data.category,
          severity: data.severity ?? "NORMAL",
          state: RequestState.NEW,
        },
      });
    }

    return this.prisma.request.create({
      data: {
        tenantId,
        bookingId,
        category: data.category,
        priority: data.priority ?? "NORMAL",
        state: RequestState.NEW,
      },
    });
  }

  // ── MANAGER: Get all pending requests/complaints for a property ──────────────
  async listForProperty(tenantId: string, propertyId: string, type: "REQUEST" | "COMPLAINT" = "REQUEST") {
    if (type === "COMPLAINT") {
      return this.prisma.complaint.findMany({
        where: { tenantId, booking: { propertyId } },
        include: { booking: { select: { id: true, profile: { select: { fullName: true } } } } },
        orderBy: { createdAt: "desc" },
      });
    }
    return this.prisma.request.findMany({
      where: { tenantId, booking: { propertyId } },
      include: {
        booking: { select: { id: true, profile: { select: { fullName: true } } } },
        events: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ── MANAGER: Acknowledge a request ───────────────────────────────────────────
  async acknowledge(requestId: string, tenantId: string, actorId: string) {
    const req = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found.");
    if (req.tenantId !== tenantId) throw new BadRequestException("Access denied.");
    if (req.state !== RequestState.NEW) throw new BadRequestException("Only NEW requests can be acknowledged.");

    const [updated] = await this.prisma.$transaction([
      this.prisma.request.update({
        where: { id: requestId },
        data: { state: RequestState.ACKNOWLEDGED, ackAt: new Date() },
      }),
      this.prisma.serviceEvent.create({
        data: {
          tenantId,
          requestId,
          actorId,
          fromState: "NEW",
          toState: "ACKNOWLEDGED",
        },
      }),
    ]);
    return updated;
  }

  // ── MANAGER: Assign request to a staff member ─────────────────────────────────
  async assign(requestId: string, tenantId: string, staffId: string, etaMinutes: number, actorId: string) {
    const req = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found.");
    if (req.tenantId !== tenantId) throw new BadRequestException("Access denied.");

    const [updated] = await this.prisma.$transaction([
      this.prisma.request.update({
        where: { id: requestId },
        data: {
          state: RequestState.ASSIGNED,
          assignedToId: staffId,
          assignedAt: new Date(),
          etaMinutes,
        },
      }),
      this.prisma.serviceEvent.create({
        data: {
          tenantId,
          requestId,
          actorId,
          fromState: req.state,
          toState: "ASSIGNED",
          note: `Assigned to staff ${staffId} · ETA ${etaMinutes} min`,
        },
      }),
    ]);
    return updated;
  }

  // ── STAFF: Mark as In Progress / Resolved ────────────────────────────────────
  async updateState(
    requestId: string,
    tenantId: string,
    newState: RequestState,
    actorId: string,
    note?: string,
    photoUri?: string
  ) {
    const req = await this.prisma.request.findUnique({ where: { id: requestId } });
    if (!req) throw new NotFoundException("Request not found.");
    if (req.tenantId !== tenantId) throw new BadRequestException("Access denied.");

    const updates: any = { state: newState };
    if (newState === RequestState.RESOLVED) updates.resolvedAt = new Date();

    const [updated] = await this.prisma.$transaction([
      this.prisma.request.update({ where: { id: requestId }, data: updates }),
      this.prisma.serviceEvent.create({
        data: {
          tenantId,
          requestId,
          actorId,
          fromState: req.state,
          toState: newState,
          note,
          photoUri,
        },
      }),
    ]);
    return updated;
  }

  // ── SLA: Auto-escalate requests older than 10 minutes with no ack ─────────────
  async escalateBreachedRequests(tenantId: string) {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const breached = await this.prisma.request.findMany({
      where: {
        tenantId,
        state: RequestState.NEW,
        createdAt: { lte: tenMinutesAgo },
      },
    });

    if (breached.length === 0) return { escalated: 0 };

    await this.prisma.request.updateMany({
      where: { id: { in: breached.map((r) => r.id) } },
      data: { state: RequestState.AUTO_ESCALATED },
    });

    // Log escalation events
    await this.prisma.serviceEvent.createMany({
      data: breached.map((r) => ({
        tenantId,
        requestId: r.id,
        actorId: "SYSTEM_SLA_DAEMON",
        fromState: "NEW",
        toState: "AUTO_ESCALATED",
        note: "SLA breach: no acknowledgment within 10 minutes",
      })),
    });

    return { escalated: breached.length };
  }
}
