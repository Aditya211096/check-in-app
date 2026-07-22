import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submitFeedback(
    tenantId: string,
    bookingId: string,
    guestId: string,
    data: { rating: number; comment?: string }
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5.");
    }

    const booking = await this.prisma.client.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.guestId !== guestId) throw new BadRequestException("Access denied.");

    // Log the feedback directly to PlatformAuditLog for CSAT analytics
    return this.prisma.client.platformAuditLog.create({
      data: {
        userId: guestId,
        action: "SUBMIT_FEEDBACK",
        entityType: "Booking",
        entityId: bookingId,
        payload: {
          rating: data.rating,
          comment: data.comment || "",
          tenantId,
        },
        ipAddress: "127.0.0.1",
      },
    });
  }

  async getPropertyFeedback(tenantId: string, propertyId: string) {
    // Retrieve feedback events logged under PlatformAuditLog
    const logs = await this.prisma.client.platformAuditLog.findMany({
      where: {
        action: "SUBMIT_FEEDBACK",
      },
      include: {
        user: true
      },
      orderBy: { createdAt: "desc" },
    });

    // Filter logs that belong to this tenant's bookings
    const filteredFeedback = logs.filter((log: any) => {
      return log.payload?.tenantId === tenantId;
    });

    const feedbacks = filteredFeedback.map((log: any) => ({
      id: log.id,
      rating: log.payload?.rating || 5,
      comment: log.payload?.comment || "",
      createdAt: log.createdAt,
      booking: {
        profile: { fullName: log.user.fullName }
      }
    }));

    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) / feedbacks.length
        : 0;

    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: feedbacks.filter((f: any) => f.rating === star).length,
    }));

    return { 
      avgRating: Math.round(avgRating * 10) / 10, 
      totalReviews: feedbacks.length, 
      distribution, 
      feedbacks 
    };
  }
}
