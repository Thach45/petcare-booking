import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  BUSINESS_TIME_ZONE: z.string().default("Asia/Ho_Chi_Minh"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  BUSINESS_TIME_ZONE: process.env.BUSINESS_TIME_ZONE,
});
