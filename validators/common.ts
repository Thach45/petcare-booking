import { z } from "zod";

// IDs are generated with Prisma's cuid(), not UUIDs — do not use z.string().uuid() here.
export const id = z.string().trim().min(1).max(191);
export const uuid = id;
export const money = z.coerce.number().finite().int().min(0).max(100_000_000);
export const positiveWeight = z.coerce.number().finite().gt(0).max(300);
export const isoDateTime = z.string().datetime({ offset: true });
