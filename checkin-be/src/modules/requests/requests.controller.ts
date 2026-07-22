import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, Sse, MessageEvent } from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@Controller("requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // Real-time task stream for staff panel
  @Sse("sse")
  sse(): Observable<MessageEvent> {
    return this.requestsService.sse$.asObservable().pipe(
      map(event => ({ data: event } as MessageEvent))
    );
  }

  // Guest: raise a service request or complaint
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Body() body: {
      bookingId: string;
      propertyId?: string;
      type: "REQUEST" | "COMPLAINT";
      category: string;
      priority?: string;
      severity?: string;
    },
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.requestsService.create(tenantId, body.bookingId, body);
  }

  // Manager/Staff: list requests for a property
  @Get("property/:propertyId")
  @UseGuards(JwtAuthGuard)
  async listForProperty(
    @Param("propertyId") propertyId: string,
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.requestsService.listForProperty(tenantId, propertyId);
  }

  // Manager: acknowledge
  @Post(":id/acknowledge")
  @UseGuards(JwtAuthGuard)
  async acknowledge(@Param("id") id: string, @Req() req: any) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.requestsService.acknowledge(id, tenantId, req.user.sub);
  }

  // Manager: assign to staff
  @Post(":id/assign")
  @UseGuards(JwtAuthGuard)
  async assign(
    @Param("id") id: string,
    @Body() body: { staffId: string; etaMinutes: number },
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.requestsService.assign(id, tenantId, body.staffId, body.etaMinutes, req.user.sub);
  }

  // Staff: update state (IN_PROGRESS, RESOLVED)
  @Post(":id/state")
  @UseGuards(JwtAuthGuard)
  async updateState(
    @Param("id") id: string,
    @Body() body: { state: string; note?: string },
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.requestsService.updateState(id, tenantId, body.state, req.user.sub, body.note);
  }

  // System/cron: SLA escalation trigger
  @Post("sla/escalate")
  @UseGuards(JwtAuthGuard)
  async escalate(@Req() req: any) {
    return this.requestsService.escalateBreachedRequests();
  }
}
