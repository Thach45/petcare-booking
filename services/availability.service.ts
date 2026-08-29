import { BookingStatus } from "@prisma/client";
import { DateTime } from "luxon";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const OPEN_HOUR = 8;
const CLOSE_HOUR = 20;

export type TimeSlot = { startTime: string; endTime: string };

function businessDay(date: string) {
  const day = DateTime.fromISO(date, { zone: env.BUSINESS_TIME_ZONE });
  if (!day.isValid || day.toISODate() !== date) throw new AppError(422, "INVALID_DATE", "Ngày không hợp lệ");
  return day.startOf("day");
}

export function workingWindow(date: string) {
  const day = businessDay(date);
  return { open: day.set({ hour: OPEN_HOUR }), close: day.set({ hour: CLOSE_HOUR }) };
}

export function ensureWorkingPeriod(startTime: Date, durationMinutes: number) {
  const start = DateTime.fromJSDate(startTime, { zone: "utc" }).setZone(env.BUSINESS_TIME_ZONE);
  const { open, close } = workingWindow(start.toISODate()!);
  const end = start.plus({ minutes: durationMinutes });
  if (start.toMillis() < open.toMillis() || end.toMillis() > close.toMillis() || start.second !== 0 || start.millisecond !== 0) {
    throw new AppError(422, "OUTSIDE_WORKING_HOURS", "Khung giờ phải nằm trong 08:00–20:00 và bắt đầu đúng phút");
  }
  return end.toUTC().toJSDate();
}

export async function getAvailableSlots(employeeId: string, serviceId: string, date: string): Promise<TimeSlot[]> {
  const [employee, service] = await Promise.all([
    prisma.employee.findFirst({ where: { id: employeeId, active: true }, select: { id: true } }),
    prisma.service.findFirst({ where: { id: serviceId, active: true }, select: { durationMinutes: true } }),
  ]);
  if (!employee) throw new AppError(404, "EMPLOYEE_NOT_FOUND", "Không tìm thấy nhân viên đang hoạt động");
  if (!service) throw new AppError(404, "SERVICE_NOT_FOUND", "Không tìm thấy dịch vụ đang hoạt động");

  const { open, close } = workingWindow(date);
  const bookings = await prisma.booking.findMany({
    where: {
      employeeId,
      status: { not: BookingStatus.CANCELLED },
      startTime: { lt: close.toUTC().toJSDate() },
      endTime: { gt: open.toUTC().toJSDate() },
    },
    select: { startTime: true, endTime: true },
  });

  const slots: TimeSlot[] = [];
  for (let cursor = open; cursor.plus({ minutes: service.durationMinutes }).toMillis() <= close.toMillis(); cursor = cursor.plus({ minutes: 15 })) {
    const end = cursor.plus({ minutes: service.durationMinutes });
    const overlaps = bookings.some((booking) => cursor.toMillis() < booking.endTime.getTime() && end.toMillis() > booking.startTime.getTime());
    if (!overlaps) slots.push({ startTime: cursor.toUTC().toISO()!, endTime: end.toUTC().toISO()! });
  }
  return slots;
}
