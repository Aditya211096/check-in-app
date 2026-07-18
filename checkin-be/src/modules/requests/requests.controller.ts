import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from "@nestjs/common";
import { RequestsService } from "./requests.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RequestState } from "@prisma/client";

@Controller("requests")
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // Guest: raise a service request or complaint
  @Post()
  async create(
    @Body() body: {
      bookingId: string;
      type: "REQUEST" | "COMPLAINT";
      category: string;
      priority?: string;
      severity?: string;
    },
    @Req() req: any
  ) {
    return this.requestsService.create(req.user.tenantId ?? "", body.bookingId, body);
  }

  // Manager: list requests for a property
  @Get("property/:propertyId")
  async listForProperty(
    @Param("propertyId") propertyId: string,
    @Query("type") type: "REQUEST" | "COMPLAINT" = "REQUEST",
    @Req() req: any
  ) {
    return this.requestsService.listForProperty(req.user.tenantId, propertyId, type);
  }

  // Manager: acknowledge
  @Post(":id/acknowledge")
  async acknowledge(@Param("id") id: string, @Req() req: any) {
    return this.requestsService.acknowledge(id, req.user.tenantId, req.user.sub);
  }

  // Manager: assign to staff
  @Post(":id/assign")
  async assign(
    @Param("id") id: string,
    @Body() body: { staffId: string; etaMinutes: number },
    @Req() req: any
  ) {
    return this.requestsService.assign(id, req.user.tenantId, body.staffId, body.etaMinutes, req.user.sub);
  }

  // Staff: update state (IN_PROGRESS, RESOLVED)
  @Post(":id/state")
  async updateState(
    @Param("id") id: string,
    @Body() body: { state: RequestState; note?: string; photoUri?: string },
    @Req() req: any
  ) {
    return this.requestsService.updateState(id, req.user.tenantId, body.state, req.user.sub, body.note, body.photoUri);
  }

  // System/cron: SLA escalation trigger
  @Post("sla/escalate")
  async escalate(@Req() req: any) {
    return this.requestsService.escalateBreachedRequests(req.user.tenantId);
  }
}
