import { BookingStatus, Prisma, UserRole } from "@prisma/client";
import { DateTime } from "luxon";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { calculateTotalPrice } from "@/services/pricing.service";
import { ensureWorkingPeriod } from "@/services/availability.service";
import { notifyBookingCreated, notifyBookingStatusChanged } from "@/services/notification.service";

const BOOKING_INCLUDE = { pet: true, service: true, employee: true } satisfies Prisma.BookingInclude;
export type CreateBookingInput = { petId: string; serviceId: string; employeeId: string; startTime: string; notes?: string | null };

function bookingLockKey(employeeId: string, start: Date) {
  return `${employeeId}:${DateTime.fromJSDate(start, { zone: "utc" }).toFormat("yyyy-LL-dd")}`;
}

export async function createBooking(customerId: string, input: CreateBookingInput) {
  const startTime = new Date(input.startTime);
  if (Number.isNaN(startTime.getTime())) throw new AppError(422, "INVALID_START_TIME", "startTime không hợp lệ");

  try {
    return await prisma.$transaction(async (tx) => {
      const [pet, service, employee] = await Promise.all([
        tx.pet.findFirst({ where: { id: input.petId, userId: customerId } }),
        tx.service.findFirst({ where: { id: input.serviceId, active: true } }),
        tx.employee.findFirst({ where: { id: input.employeeId, active: true } }),
      ]);
      if (!pet) throw new AppError(404, "PET_NOT_FOUND", "Không tìm thấy thú cưng của bạn");
      if (!service) throw new AppError(404, "SERVICE_NOT_FOUND", "Không tìm thấy dịch vụ đang hoạt động");
      if (!employee) throw new AppError(404, "EMPLOYEE_NOT_FOUND", "Không tìm thấy nhân viên đang hoạt động");

      const endTime = ensureWorkingPeriod(startTime, service.durationMinutes);
      // pg_advisory_xact_lock returns void — $queryRaw cannot deserialize a void column,
      // so this must go through $executeRaw (no result row parsing) instead.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${bookingLockKey(input.employeeId, startTime)}))`;
      const conflict = await tx.booking.findFirst({
        where: {
          employeeId: input.employeeId,
          status: { not: BookingStatus.CANCELLED },
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
        select: { id: true },
      });
      if (conflict) throw new AppError(409, "SLOT_UNAVAILABLE", "Khung giờ này vừa được đặt; vui lòng chọn khung giờ khác");

      const booking = await tx.booking.create({
        data: { userId: customerId, petId: pet.id, serviceId: service.id, employeeId: employee.id, startTime, endTime, notes: input.notes ?? null, totalPrice: calculateTotalPrice(service.basePrice, pet.weight) },
        include: BOOKING_INCLUDE,
      });
      await tx.bookingStatusHistory.create({ data: { bookingId: booking.id, fromStatus: null, toStatus: booking.status, changedByUserId: customerId } });
      await notifyBookingCreated(tx, customerId, booking.id, service.name);
      return booking;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable, maxWait: 5_000, timeout: 10_000 });
  } catch (error) {
    if (error instanceof AppError) throw error;
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") throw new AppError(409, "BOOKING_CONFLICT", "Lịch đang được cập nhật, vui lòng thử lại");
    throw error;
  }
}

const validTransitions: Record<BookingStatus, BookingStatus[]> = {
  PENDING: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
  CONFIRMED: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED],
  IN_PROGRESS: [BookingStatus.COMPLETED],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateBookingStatus(actor: { id: string; role: UserRole }, bookingId: string, newStatus: BookingStatus) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: BOOKING_INCLUDE });
  if (!booking) throw new AppError(404, "BOOKING_NOT_FOUND", "Không tìm thấy lịch đặt");
  const isOwner = booking.userId === actor.id;
  if (actor.role === UserRole.CUSTOMER && !(isOwner && newStatus === BookingStatus.CANCELLED)) throw new AppError(403, "FORBIDDEN", "Khách hàng chỉ có thể hủy lịch của chính mình");
  if (actor.role === UserRole.STAFF && newStatus === BookingStatus.CANCELLED) throw new AppError(403, "FORBIDDEN", "Nhân viên không có quyền hủy lịch");
  if (!validTransitions[booking.status].includes(newStatus)) throw new AppError(409, "INVALID_STATUS_TRANSITION", `Không thể chuyển từ ${booking.status} sang ${newStatus}`);
  return prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({ where: { id: bookingId }, data: { status: newStatus }, include: BOOKING_INCLUDE });
    await tx.bookingStatusHistory.create({ data: { bookingId, fromStatus: booking.status, toStatus: newStatus, changedByUserId: actor.id } });
    await notifyBookingStatusChanged(tx, booking.userId, bookingId, booking.service.name, newStatus);
    return updated;
  });
}
