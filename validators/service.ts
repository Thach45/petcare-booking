import { z } from "zod";
import { money } from "@/validators/common";

export const serviceInputSchema = z.object({
  name: z.string().trim().min(1).max(140),
  description: z.string().trim().max(5_000).nullable().optional(),
  basePrice: money,
  durationMinutes: z.coerce.number().int().min(15).max(720),
  active: z.boolean().optional(),
});
