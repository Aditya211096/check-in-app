import { Controller, Get, Post, Body, Param, UseGuards, Req } from "@nestjs/common";
import { FeedbackService } from "./feedback.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("feedback")
@UseGuards(JwtAuthGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post(":bookingId")
  async submit(
    @Param("bookingId") bookingId: string,
    @Body() body: { rating: number; comment?: string },
    @Req() req: any
  ) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.feedbackService.submitFeedback(tenantId, bookingId, req.user.sub, body);
  }

  @Get("property/:propertyId")
  async getPropertyFeedback(@Param("propertyId") propertyId: string, @Req() req: any) {
    const tenantId = req.user.tenantId || "global-tenant";
    return this.feedbackService.getPropertyFeedback(tenantId, propertyId);
  }
}
