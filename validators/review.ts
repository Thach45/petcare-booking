import { z } from "zod";
import { id } from "@/validators/common";

export const createReviewSchema = z.object({
  bookingId: id,
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(2_000).nullable().optional(),
});
