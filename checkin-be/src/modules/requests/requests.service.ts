import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Subject } from "rxjs";

export interface Task {
  id: string;
  tenantId: string;
  propertyId: string;
  bookingId: string;
  type: "REQUEST" | "COMPLAINT";
  category: string;
  priority: string;
  severity: string;
  state: "NEW" | "ACKNOWLEDGED" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "AUTO_ESCALATED";
  etaMinutes?: number;
  assignedToId?: string;
  createdAt: Date;
  ackAt?: Date;
  assignedAt?: Date;
  resolvedAt?: Date;
  notes?: string;
}

@Injectable()
export class RequestsService {
  private tasks: Task[] = [];
  public readonly sse$ = new Subject<{ type: string; data: any }>();

  constructor() {
    // Seed initial mock tasks for development & testing SLA colors
    this.tasks = [
      {
        id: "task-1",
        tenantId: "8586816812", // Owner/Manager default tenant ID
        propertyId: "prop-1",
        bookingId: "bk-001",
        type: "REQUEST",
        category: "Plumbing",
        priority: "HIGH",
        severity: "NORMAL",
        state: "NEW",
        createdAt: new Date(Date.now() - 12 * 60 * 1000), // older than 10 mins (triggers saffron flashing)
      },
      {
        id: "task-2",
        tenantId: "8586816812",
        propertyId: "prop-1",
        bookingId: "bk-001",
        type: "COMPLAINT",
        category: "Air Conditioning",
        priority: "NORMAL",
        severity: "HIGH",
        state: "NEW",
        createdAt: new Date(Date.now() - 4 * 60 * 1000), // warning state (gold color)
      },
      {
        id: "task-3",
        tenantId: "8586816812",
        propertyId: "prop-1",
        bookingId: "bk-001",
        type: "REQUEST",
        category: "Housekeeping",
        priority: "LOW",
        severity: "NORMAL",
        state: "RESOLVED",
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 10 * 60 * 1000),
      }
    ];

    // Periodically run auto-escalation check (simulating cron daemon)
    setInterval(() => {
      this.escalateBreachedRequests();
    }, 30000);
  }

  async create(
    tenantId: string,
    bookingId: string,
    data: {
      propertyId?: string;
      type: "REQUEST" | "COMPLAINT";
      category: string;
      priority?: string;
      severity?: string;
    }
  ) {
    const task: Task = {
      id: `task-${Date.now()}`,
      tenantId,
      propertyId: data.propertyId || "prop-1",
      bookingId,
      type: data.type,
      category: data.category,
      priority: data.priority || "NORMAL",
      severity: data.severity || "NORMAL",
      state: "NEW",
      createdAt: new Date(),
    };

    this.tasks.push(task);
    this.emitSse("TASK_CREATED", task);
    return task;
  }

  async listForProperty(tenantId: string, propertyId: string) {
    return this.tasks.filter(t => t.propertyId === propertyId);
  }

  async acknowledge(requestId: string, tenantId: string, actorId: string) {
    const task = this.tasks.find(t => t.id === requestId);
    if (!task) throw new NotFoundException("Task not found.");
    if (task.state !== "NEW") throw new BadRequestException("Only NEW tasks can be acknowledged.");

    task.state = "ACKNOWLEDGED";
    task.ackAt = new Date();
    this.emitSse("TASK_UPDATED", task);
    return task;
  }

  async assign(requestId: string, tenantId: string, staffId: string, etaMinutes: number, actorId: string) {
    const task = this.tasks.find(t => t.id === requestId);
    if (!task) throw new NotFoundException("Task not found.");

    task.state = "ASSIGNED";
    task.assignedToId = staffId;
    task.assignedAt = new Date();
    task.etaMinutes = etaMinutes;
    this.emitSse("TASK_UPDATED", task);
    return task;
  }

  async updateState(requestId: string, tenantId: string, newState: any, actorId: string, note?: string) {
    const task = this.tasks.find(t => t.id === requestId);
    if (!task) throw new NotFoundException("Task not found.");

    task.state = newState;
    if (newState === "RESOLVED") {
      task.resolvedAt = new Date();
    }
    if (note) {
      task.notes = note;
    }
    this.emitSse("TASK_UPDATED", task);
    return task;
  }

  async escalateBreachedRequests() {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    let escalatedCount = 0;

    this.tasks.forEach(task => {
      if (task.state === "NEW" && task.createdAt <= tenMinutesAgo) {
        task.state = "AUTO_ESCALATED";
        escalatedCount++;
        this.emitSse("TASK_UPDATED", task);
      }
    });

    return { escalated: escalatedCount };
  }

  private emitSse(type: string, data: any) {
    this.sse$.next({ type, data });
  }
}
