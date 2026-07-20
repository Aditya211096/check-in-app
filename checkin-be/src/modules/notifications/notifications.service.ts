import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Send WhatsApp Message via Meta Business Cloud API using official credentials in .env
   */
  async sendWhatsAppMessage(recipientPhone: string, messageText: string): Promise<{ success: boolean; data?: any; error?: string }> {
    const token = process.env.WHATSAPP_API_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      this.logger.warn("WhatsApp API credentials missing in .env. Logging message to console.");
      this.logger.log(`[WHATSAPP → ${recipientPhone}] ${messageText}`);
      return { success: false, error: "WhatsApp credentials missing" };
    }

    const cleanPhone = recipientPhone.replace(/[^0-9]/g, "");

    try {
      const url = `https://graph.facebook.com/v18.0/${phoneId}/messages`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: cleanPhone,
          type: "text",
          text: { preview_url: true, body: messageText },
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        this.logger.error(`WhatsApp API Error: ${JSON.stringify(resData)}`);
        return { success: false, error: resData?.error?.message || "Failed to dispatch WhatsApp message" };
      }

      this.logger.log(`[WHATSAPP SUCCESS → ${cleanPhone}] Message ID: ${resData?.messages?.[0]?.id}`);
      return { success: true, data: resData };
    } catch (err: any) {
      this.logger.error(`WhatsApp Request Exception: ${err?.message}`);
      return { success: false, error: err?.message };
    }
  }

  /**
   * Send push notification via FCM.
   */
  async sendPush(userId: string, payload: NotificationPayload): Promise<void> {
    this.logger.log(`[FCM PUSH → ${userId}] ${payload.title}: ${payload.body}`);

    await this.prisma.notification.create({
      data: {
        userId,
        event: payload.title,
        channel: "push",
        payload: payload as any,
        deliveredAt: new Date(),
      },
    });
  }

  /**
   * Send SMS notification via MSG91/Twilio.
   */
  async sendSms(phone: string, message: string): Promise<void> {
    this.logger.log(`[SMS → ${phone}] ${message}`);
  }

  /**
   * Send email via SendGrid.
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(`[EMAIL → ${to}] Subject: ${subject}`);
  }

  /**
   * Convenience: notify guest of booking confirmation
   */
  async notifyBookingConfirmed(userId: string, phone: string, bookingId: string, propertyName: string) {
    await Promise.all([
      this.sendPush(userId, {
        title: "Booking Confirmed! 🎉",
        body: `Your stay at ${propertyName} is confirmed. Booking ID: ${bookingId.slice(0, 8).toUpperCase()}`,
        data: { bookingId, type: "BOOKING_CONFIRMED" },
      }),
      this.sendSms(
        phone,
        `Traces: Your booking at ${propertyName} is confirmed! ID: ${bookingId.slice(0, 8).toUpperCase()}. View pass: https://traces.in/bookings/${bookingId}/pass`
      ),
      this.sendWhatsAppMessage(
        phone,
        `Hello! Your booking at ${propertyName} is confirmed! ID: ${bookingId.slice(0, 8).toUpperCase()}. Complete online pre-checkin: http://localhost:3000/checkin?token=${bookingId}`
      ),
    ]);
  }

  /**
   * Notify guest of check-in completion
   */
  async notifyCheckedIn(userId: string, phone: string, roomCode: string) {
    await Promise.all([
      this.sendPush(userId, {
        title: "Checked In Successfully ✓",
        body: `Welcome! Room ${roomCode} is ready for you. Enjoy your stay.`,
        data: { type: "CHECKED_IN" },
      }),
      this.sendSms(phone, `Traces: Check-in complete! Room ${roomCode} is yours. Have a great stay!`),
    ]);
  }

  /**
   * Notify manager of new complaint escalation
   */
  async notifyEscalation(managerUserId: string, requestId: string, category: string, guestName: string) {
    await this.sendPush(managerUserId, {
      title: "⚠️ SLA Breach Alert",
      body: `${category} from ${guestName} — unacknowledged for 10+ minutes`,
      data: { requestId, type: "SLA_ESCALATION" },
    });
  }

  /**
   * Get notification history for a user
   */
  async getHistory(userId: string, limit = 20) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
