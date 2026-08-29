import { Decimal } from "@prisma/client/runtime/library";
import { describe, expect, it } from "vitest";
import { calculateSurcharge, calculateTotalPrice, WEIGHT_SURCHARGE } from "@/services/pricing.service";
import { AppError } from "@/lib/errors";

describe("calculateSurcharge", () => {
  it("is free under 5kg", () => {
    expect(calculateSurcharge(new Decimal(4.99)).toNumber()).toBe(0);
  });

  it("charges the medium surcharge at exactly 5kg (boundary is inclusive)", () => {
    expect(calculateSurcharge(new Decimal(5)).equals(WEIGHT_SURCHARGE.MEDIUM)).toBe(true);
  });

  it("charges the medium surcharge just under 15kg", () => {
    expect(calculateSurcharge(new Decimal(14.99)).equals(WEIGHT_SURCHARGE.MEDIUM)).toBe(true);
  });

  it("charges the large surcharge at exactly 15kg (boundary is inclusive)", () => {
    expect(calculateSurcharge(new Decimal(15)).equals(WEIGHT_SURCHARGE.LARGE)).toBe(true);
  });

  it("charges the large surcharge for anything heavier", () => {
    expect(calculateSurcharge(new Decimal(40)).equals(WEIGHT_SURCHARGE.LARGE)).toBe(true);
  });
});

describe("calculateTotalPrice", () => {
  it("adds the weight surcharge to the base price", () => {
    const total = calculateTotalPrice(new Decimal(150_000), new Decimal(6.5));
    expect(total.equals(new Decimal(200_000))).toBe(true);
  });

  it("rejects a non-positive weight — bad data should never silently price at 0kg", () => {
    expect(() => calculateTotalPrice(new Decimal(100_000), new Decimal(0))).toThrow(AppError);
  });

  it("rejects a negative base price", () => {
    expect(() => calculateTotalPrice(new Decimal(-1), new Decimal(5))).toThrow(AppError);
  });
});
