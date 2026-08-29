import { Decimal } from "@prisma/client/runtime/library";
import { AppError } from "@/lib/errors";

export const WEIGHT_SURCHARGE = {
  MEDIUM: new Decimal(50_000),
  LARGE: new Decimal(100_000),
} as const;

export function calculateSurcharge(weight: Decimal): Decimal {
  if (weight.lessThan(5)) return new Decimal(0);
  if (weight.lessThan(15)) return WEIGHT_SURCHARGE.MEDIUM;
  return WEIGHT_SURCHARGE.LARGE;
}

export function calculateTotalPrice(basePrice: Decimal, weight: Decimal): Decimal {
  if (basePrice.isNegative() || weight.lessThanOrEqualTo(0)) throw new AppError(500, "INVALID_PRICING_DATA", "Dữ liệu giá hoặc cân nặng trong hệ thống không hợp lệ");
  return basePrice.plus(calculateSurcharge(weight));
}
