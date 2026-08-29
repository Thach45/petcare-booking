import { BookingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";

export type CreateReviewInput = { bookingId: string; rating: number; comment?: string | null };

export async function createReview(userId: string, input: CreateReviewInput) {
  const booking = await prisma.booking.findFirst({ where: { id: input.bookingId, userId } });
  if (!booking) throw new AppError(404, "BOOKING_NOT_FOUND", "Không tìm thấy lịch đặt của bạn");
  if (booking.status !== BookingStatus.COMPLETED) throw new AppError(409, "BOOKING_NOT_COMPLETED", "Chỉ có thể đánh giá sau khi lịch hẹn đã hoàn tất");

  try {
    return await prisma.review.create({
      data: { bookingId: booking.id, userId, serviceId: booking.serviceId, rating: input.rating, comment: input.comment ?? null },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new AppError(409, "REVIEW_ALREADY_EXISTS", "Bạn đã đánh giá lịch hẹn này rồi");
    throw error;
  }
}

export async function listServiceReviews(serviceId: string, page: number, pageSize: number) {
  const where = { serviceId };
  const [data, total, aggregate] = await prisma.$transaction([
    prisma.review.findMany({ where, include: { user: { select: { name: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.review.count({ where }),
    prisma.review.aggregate({ where, _avg: { rating: true } }),
  ]);
  return { data, total, averageRating: aggregate._avg.rating };
}
