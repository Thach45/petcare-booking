import { z } from "zod";
import { positiveWeight } from "@/validators/common";

export const petInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  species: z.string().trim().min(1).max(80),
  breed: z.string().trim().min(1).max(100).nullable().optional(),
  weight: positiveWeight,
  age: z.coerce.number().int().min(0).max(80).nullable().optional(),
  notes: z.string().trim().max(5_000).nullable().optional(),
});
