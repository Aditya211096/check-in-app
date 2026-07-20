import { Controller, Get, Post, Body, Query, UseGuards, Req } from "@nestjs/common";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get("history")
  async getHistory(@Query("limit") limit: string, @Req() req: any) {
    return this.notificationsService.getHistory(req.user?.sub ?? "demo-user", limit ? parseInt(limit, 10) : 20);
  }

  @Post("whatsapp")
  async sendWhatsApp(@Body() body: { phone: string; message: string }) {
    return this.notificationsService.sendWhatsAppMessage(body.phone, body.message);
  }
}
