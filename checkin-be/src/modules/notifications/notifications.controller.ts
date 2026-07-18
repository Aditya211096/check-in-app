import { Controller, Get, Query, UseGuards, Req } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("notifications")
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("history")
  async getHistory(@Query("limit") limit: string, @Req() req: any) {
    return this.notificationsService.getHistory(req.user.sub, limit ? parseInt(limit, 10) : 20);
  }
}
