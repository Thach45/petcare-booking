import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { ensureWorkingPeriod, workingWindow } from "@/services/availability.service";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

const DATE = "2026-09-01";

function localTime(hour: number, minute = 0) {
  return DateTime.fromISO(DATE, { zone: env.BUSINESS_TIME_ZONE }).set({ hour, minute, second: 0, millisecond: 0 }).toJSDate();
}

describe("workingWindow", () => {
  it("opens at 08:00 and closes at 20:00 in the business timezone", () => {
    const { open, close } = workingWindow(DATE);
    expect(open.hour).toBe(8);
    expect(close.hour).toBe(20);
  });

  it("rejects a malformed date", () => {
    expect(() => workingWindow("2026-13-40")).toThrow(AppError);
  });
});

describe("ensureWorkingPeriod", () => {
  it("accepts a slot starting exactly at opening time", () => {
    const end = ensureWorkingPeriod(localTime(8, 0), 60);
    expect(DateTime.fromJSDate(end).setZone(env.BUSINESS_TIME_ZONE).hour).toBe(9);
  });

  it("accepts a slot that ends exactly at closing time", () => {
    expect(() => ensureWorkingPeriod(localTime(19, 0), 60)).not.toThrow();
  });

  it("rejects a slot starting before opening time", () => {
    expect(() => ensureWorkingPeriod(localTime(7, 59), 30)).toThrow(AppError);
  });

  it("rejects a slot that would end after closing time", () => {
    expect(() => ensureWorkingPeriod(localTime(19, 30), 60)).toThrow(AppError);
  });

  it("rejects a start time not aligned to a whole minute", () => {
    const start = localTime(9, 0);
    start.setSeconds(30);
    expect(() => ensureWorkingPeriod(start, 30)).toThrow(AppError);
  });
});
