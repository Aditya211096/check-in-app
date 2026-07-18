import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class FeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async submitFeedback(
    tenantId: string,
    bookingId: string,
    profileId: string,
    data: { rating: number; comment?: string; anonymousShare?: boolean }
  ) {
    if (data.rating < 1 || data.rating > 5) {
      throw new BadRequestException("Rating must be between 1 and 5.");
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { feedback: true },
    });
    if (!booking) throw new NotFoundException("Booking not found.");
    if (booking.profileId !== profileId) throw new BadRequestException("Access denied.");
    if (booking.feedback) throw new BadRequestException("Feedback already submitted for this booking.");

    return this.prisma.feedback.create({
      data: {
        tenantId,
        bookingId,
        rating: data.rating,
        comment: data.comment,
        anonymousShare: data.anonymousShare ?? true,
      },
    });
  }

  async getPropertyFeedback(tenantId: string, propertyId: string) {
    const feedbacks = await this.prisma.feedback.findMany({
      where: {
        tenantId,
        booking: { propertyId },
        anonymousShare: true,
      },
      include: {
        booking: {
          select: {
            checkIn: true,
            checkOut: true,
            profile: { select: { fullName: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const avgRating =
      feedbacks.length > 0
        ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
        : 0;

    const distribution = [1, 2, 3, 4, 5].map((star) => ({
      star,
      count: feedbacks.filter((f) => f.rating === star).length,
    }));

    return { avgRating: Math.round(avgRating * 10) / 10, totalReviews: feedbacks.length, distribution, feedbacks };
  }
}
