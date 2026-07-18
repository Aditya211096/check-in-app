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
   * Send push notification via FCM.
   * In dev mode logs to console. In production, uses Firebase Admin SDK.
   */
  async sendPush(userId: string, payload: NotificationPayload): Promise<void> {
    this.logger.log(`[FCM PUSH → ${userId}] ${payload.title}: ${payload.body}`);

    // Log to Notification table
    await this.prisma.notification.create({
      data: {
        userId,
        event: payload.title,
        channel: "push",
        payload: payload as any,
        deliveredAt: new Date(),
      },
    });

    // TODO: Replace with Firebase Admin SDK in production:
    // const message = {
    //   notification: { title: payload.title, body: payload.body },
    //   data: payload.data ?? {},
    //   token: fcmToken,
    // };
    // await admin.messaging().send(message);
  }

  /**
   * Send SMS notification via MSG91/Twilio.
   * In dev mode logs to console.
   */
  async sendSms(phone: string, message: string): Promise<void> {
    this.logger.log(`[SMS → ${phone}] ${message}`);
    // TODO: Replace with MSG91/Twilio SDK in production:
    // await msg91.sendSMS({ to: phone, message });
  }

  /**
   * Send email via SendGrid.
   * In dev mode logs to console.
   */
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    this.logger.log(`[EMAIL → ${to}] Subject: ${subject}`);
    // TODO: Replace with SendGrid SDK in production:
    // await sgMail.send({ to, from: 'noreply@traces.in', subject, html });
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
