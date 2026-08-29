import { NextRequest, NextResponse } from "next/server";
import { BookingStatus, Prisma, UserRole } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { apiError, AppError, readJson } from "@/lib/errors";
import { pageMeta, paginationSchema } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from "@/validators/booking";
import { createBooking } from "@/services/booking.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const status = request.nextUrl.searchParams.get("status");
    const employeeId = request.nextUrl.searchParams.get("employeeId");
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");
    if (status && !Object.values(BookingStatus).includes(status as BookingStatus)) throw new AppError(422, "INVALID_STATUS", "Trạng thái lọc không hợp lệ");
    if (from && Number.isNaN(new Date(from).getTime())) throw new AppError(422, "INVALID_FROM_DATE", "from không phải thời điểm hợp lệ");
    if (to && Number.isNaN(new Date(to).getTime())) throw new AppError(422, "INVALID_TO_DATE", "to không phải thời điểm hợp lệ");
    const where: Prisma.BookingWhereInput = {
      ...(user.role === UserRole.CUSTOMER ? { userId: user.id } : {}),
      ...(status ? { status: status as BookingStatus } : {}),
      ...(employeeId ? { employeeId } : {}),
      ...(from || to ? { startTime: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to) } : {}) } } : {}),
    };
    const query = { where, include: { pet: true, service: true, employee: true, review: true }, orderBy: { startTime: "desc" as const }, skip: (page - 1) * pageSize, take: pageSize };
    const [data, total] = await prisma.$transaction([prisma.booking.findMany(query), prisma.booking.count({ where })]);
    return NextResponse.json({ data, meta: pageMeta(page, pageSize, total) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser([UserRole.CUSTOMER]);
    const booking = await createBooking(user.id, createBookingSchema.parse(await readJson(request)));
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) { return apiError(error); }
}
