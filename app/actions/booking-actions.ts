"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { createBooking, updateBookingStatus } from "@/services/booking.service";
import { createBookingSchema, bookingStatusSchema } from "@/validators/booking";

export async function createBookingAction(payload: unknown) {
  const user = await requireUser([UserRole.CUSTOMER]);
  const booking = await createBooking(user.id, createBookingSchema.parse(payload));
  revalidatePath("/bookings");
  return booking;
}

export async function updateBookingStatusAction(bookingId: string, payload: unknown) {
  const user = await requireUser();
  const booking = await updateBookingStatus(user, bookingId, bookingStatusSchema.parse(payload).status);
  revalidatePath("/bookings");
  return booking;
}
