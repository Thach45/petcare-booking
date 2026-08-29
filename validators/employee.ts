import { EmployeeRole } from "@prisma/client";
import { z } from "zod";

export const employeeInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.nativeEnum(EmployeeRole),
  active: z.boolean().optional(),
});
