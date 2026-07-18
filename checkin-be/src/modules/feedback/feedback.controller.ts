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
    @Body() body: { rating: number; comment?: string; anonymousShare?: boolean },
    @Req() req: any
  ) {
    const profile = await this.feedbackService["prisma"].customerProfile.findUnique({
      where: { userId: req.user.sub },
    });
    if (!profile) throw new Error("Profile not found.");
    return this.feedbackService.submitFeedback(req.user.tenantId ?? "", bookingId, profile.id, body);
  }

  @Get("property/:propertyId")
  async getPropertyFeedback(@Param("propertyId") propertyId: string, @Req() req: any) {
    return this.feedbackService.getPropertyFeedback(req.user.tenantId, propertyId);
  }
}
