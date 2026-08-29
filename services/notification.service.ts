import { BookingStatus, NotificationType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const statusNotification: Partial<Record<BookingStatus, { type: NotificationType; title: string; message: (serviceName: string) => string }>> = {
  CONFIRMED: { type: NotificationType.BOOKING_CONFIRMED, title: "Lịch hẹn đã được xác nhận", message: (name) => `Lịch hẹn "${name}" của bạn đã được xác nhận.` },
  IN_PROGRESS: { type: NotificationType.BOOKING_IN_PROGRESS, title: "Lịch hẹn đang được thực hiện", message: (name) => `PetCare đang thực hiện dịch vụ "${name}" cho bé.` },
  COMPLETED: { type: NotificationType.BOOKING_COMPLETED, title: "Lịch hẹn đã hoàn tất", message: (name) => `Dịch vụ "${name}" đã hoàn tất. Cảm ơn bạn đã tin tưởng PetCare!` },
  CANCELLED: { type: NotificationType.BOOKING_CANCELLED, title: "Lịch hẹn đã bị hủy", message: (name) => `Lịch hẹn "${name}" đã bị hủy.` },
};

export function notifyBookingCreated(tx: Prisma.TransactionClient, userId: string, bookingId: string, serviceName: string) {
  return tx.notification.create({
    data: { userId, type: NotificationType.BOOKING_CREATED, title: "Yêu cầu đặt lịch đã được ghi nhận", message: `PetCare đã nhận yêu cầu đặt "${serviceName}" và sẽ sớm xác nhận.`, bookingId },
  });
}

export function notifyBookingStatusChanged(tx: Prisma.TransactionClient, userId: string, bookingId: string, serviceName: string, newStatus: BookingStatus) {
  const template = statusNotification[newStatus];
  if (!template) return Promise.resolve(null);
  return tx.notification.create({
    data: { userId, type: template.type, title: template.title, message: template.message(serviceName), bookingId },
  });
}

export async function listNotifications(userId: string, page: number, pageSize: number) {
  const where = { userId };
  const [data, total, unread] = await prisma.$transaction([
    prisma.notification.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, read: false } }),
  ]);
  return { data, total, unread };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  return prisma.notification.updateMany({ where: { id: notificationId, userId }, data: { read: true } });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, read: false }, data: { read: true } });
}
