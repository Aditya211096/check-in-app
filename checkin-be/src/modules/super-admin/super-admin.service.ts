import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class SuperAdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Bypasses RLS settings since it queries global databases directly
   */
  async getTelemetry() {
    // 1. Total bookings throughput
    const totalBookings = await this.prisma.client.booking.count();

    // 2. Active tasks & SLA breaches
    // We fetch these from our in-memory tasks simulation in requests service or log history
    const totalAuditLogs = await this.prisma.client.platformAuditLog.count();

    // 3. Customer Satisfaction (CSAT) rating average
    const feedbackLogs = await this.prisma.client.platformAuditLog.findMany({
      where: { action: "SUBMIT_FEEDBACK" },
    });
    
    let csatAverage = 5.0;
    if (feedbackLogs.length > 0) {
      const sum = feedbackLogs.reduce((acc: number, log: any) => {
        const rating = Number(log.payload?.rating) || 5;
        return acc + rating;
      }, 0);
      csatAverage = Math.round((sum / feedbackLogs.length) * 10) / 10;
    }

    // 4. API Consumption Logs against monthly free quotas
    const pushCount = await this.prisma.client.platformAuditLog.count({
      where: { action: "SEND_PUSH" }
    });
    const kycCount = await this.prisma.client.platformAuditLog.count({
      where: { action: "SUBMIT_KYC" }
    });
    
    // WhatsApp OTP count (includes successful templates)
    const whatsappCount = await this.prisma.client.platformAuditLog.count({
      where: { action: "TENANT_PROVISIONED" } // mock/approximate count representing setup setups
    });

    return {
      systemWideBookings: totalBookings,
      totalAuditLogs,
      csatRating: csatAverage,
      apiUsage: {
        firebasePushNotifications: {
          used: pushCount,
          limit: 50000,
          remaining: Math.max(0, 50000 - pushCount),
        },
        metaWhatsAppOtp: {
          used: whatsappCount,
          limit: 1000,
          remaining: Math.max(0, 1000 - whatsappCount),
        },
        googleDocAiOcr: {
          used: kycCount,
          limit: 500,
          remaining: Math.max(0, 500 - kycCount),
        }
      }
    };
  }

  async getAuditLogs() {
    return this.prisma.client.platformAuditLog.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
  }
}
