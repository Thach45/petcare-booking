import { BookingStatus } from "@prisma/client";
import { z } from "zod";
import { isoDateTime, uuid } from "@/validators/common";

export const createBookingSchema = z.object({
  petId: uuid,
  serviceId: uuid,
  employeeId: uuid,
  startTime: isoDateTime,
  notes: z.string().trim().max(2_000).nullable().optional(),
});

export const availabilitySchema = z.object({
  employeeId: uuid,
  serviceId: uuid,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date phải có định dạng YYYY-MM-DD"),
});

export const bookingStatusSchema = z.object({ status: z.nativeEnum(BookingStatus) });
