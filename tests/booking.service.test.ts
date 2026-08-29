import { randomUUID } from "node:crypto";
import { BookingStatus, EmployeeRole, UserRole } from "@prisma/client";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/errors";
import { createBooking, updateBookingStatus } from "@/services/booking.service";

// Integration tests against a real database (DATABASE_URL) — they create their own
// throwaway fixtures (tagged with a run-specific suffix) and delete them afterwards.

const tag = randomUUID().slice(0, 8);
const START_TIME = "2026-09-15T10:00:00+07:00";

let userId: string;
let otherUserId: string;
let petId: string;
let serviceId: string;
let employeeId: string;

beforeAll(async () => {
  const user = await prisma.user.create({ data: { email: `booking-test-${tag}@petcare.local`, name: "Booking Test User", passwordHash: "test", role: UserRole.CUSTOMER } });
  const otherUser = await prisma.user.create({ data: { email: `booking-test-other-${tag}@petcare.local`, name: "Booking Test User 2", passwordHash: "test", role: UserRole.CUSTOMER } });
  const pet = await prisma.pet.create({ data: { userId: user.id, name: "Test Pet", species: "Chó", weight: 6 } });
  const otherPet = await prisma.pet.create({ data: { userId: otherUser.id, name: "Test Pet 2", species: "Chó", weight: 6 } });
  const service = await prisma.service.create({ data: { name: `Test Service ${tag}`, basePrice: 100_000, durationMinutes: 60 } });
  const employee = await prisma.employee.create({ data: { name: `Test Employee ${tag}`, role: EmployeeRole.GROOMER } });
  userId = user.id;
  otherUserId = otherUser.id;
  petId = pet.id;
  serviceId = service.id;
  employeeId = employee.id;
  // stash the second pet id on globalThis so we don't need another module-level export
  (globalThis as { __otherPetId?: string }).__otherPetId = otherPet.id;
});

// Runs after every test, success or failure, so one failed assertion can never leak a
// leftover booking that poisons the next test with a false SLOT_UNAVAILABLE conflict.
afterEach(async () => {
  await prisma.bookingStatusHistory.deleteMany({ where: { booking: { employeeId } } });
  await prisma.booking.deleteMany({ where: { employeeId } });
});

afterAll(async () => {
  await prisma.pet.deleteMany({ where: { userId: { in: [userId, otherUserId] } } });
  await prisma.service.delete({ where: { id: serviceId } });
  await prisma.employee.delete({ where: { id: employeeId } });
  await prisma.user.deleteMany({ where: { id: { in: [userId, otherUserId] } } });
});

describe("createBooking", () => {
  it("computes the price server-side from the service base price and pet weight", async () => {
    const booking = await createBooking(userId, { petId, serviceId, employeeId, startTime: START_TIME });
    expect(booking.totalPrice.toString()).toBe("150000"); // 100_000 base + 50_000 medium-weight surcharge
  });

  it("writes a booking_status_history row on creation", async () => {
    const booking = await createBooking(userId, { petId, serviceId, employeeId, startTime: START_TIME });
    const history = await prisma.bookingStatusHistory.findMany({ where: { bookingId: booking.id } });
    expect(history).toHaveLength(1);
    expect(history[0].toStatus).toBe(BookingStatus.PENDING);
    expect(history[0].fromStatus).toBeNull();
  });

  it("rejects two concurrent bookings for the same employee and overlapping time — only one may win", async () => {
    const otherPetId = (globalThis as { __otherPetId?: string }).__otherPetId!;
    const results = await Promise.allSettled([
      createBooking(userId, { petId, serviceId, employeeId, startTime: START_TIME }),
      createBooking(otherUserId, { petId: otherPetId, serviceId, employeeId, startTime: START_TIME }),
    ]);

    const fulfilled = results.filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof createBooking>>> => result.status === "fulfilled");
    const rejected = results.filter((result) => result.status === "rejected");
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    // Under Serializable isolation the loser can surface either as our own overlap
    // check (SLOT_UNAVAILABLE) or as a Postgres serialization conflict that we map
    // to BOOKING_CONFLICT — both mean "you lost the race", which is what matters here.
    expect((rejected[0] as PromiseRejectedResult).reason).toBeInstanceOf(AppError);
    expect(["SLOT_UNAVAILABLE", "BOOKING_CONFLICT"]).toContain(((rejected[0] as PromiseRejectedResult).reason as AppError).code);

    const stored = await prisma.booking.findMany({ where: { employeeId, startTime: new Date(START_TIME) } });
    expect(stored).toHaveLength(1);
  });

  it("rejects a slot outside working hours", async () => {
    await expect(createBooking(userId, { petId, serviceId, employeeId, startTime: "2026-09-15T21:00:00+07:00" })).rejects.toMatchObject({ code: "OUTSIDE_WORKING_HOURS" });
  });
});

describe("updateBookingStatus", () => {
  it("walks PENDING -> CONFIRMED -> IN_PROGRESS -> COMPLETED and logs each transition", async () => {
    const booking = await createBooking(userId, { petId, serviceId, employeeId, startTime: START_TIME });
    await updateBookingStatus({ id: userId, role: UserRole.ADMIN }, booking.id, BookingStatus.CONFIRMED);
    await updateBookingStatus({ id: userId, role: UserRole.ADMIN }, booking.id, BookingStatus.IN_PROGRESS);
    const completed = await updateBookingStatus({ id: userId, role: UserRole.ADMIN }, booking.id, BookingStatus.COMPLETED);
    expect(completed.status).toBe(BookingStatus.COMPLETED);

    const history = await prisma.bookingStatusHistory.findMany({ where: { bookingId: booking.id }, orderBy: { createdAt: "asc" } });
    expect(history.map((entry) => entry.toStatus)).toEqual([BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED]);
  });

  it("does not let STAFF cancel a booking", async () => {
    const booking = await createBooking(userId, { petId, serviceId, employeeId, startTime: START_TIME });
    await expect(updateBookingStatus({ id: "staff-1", role: UserRole.STAFF }, booking.id, BookingStatus.CANCELLED)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not let a customer cancel someone else's booking", async () => {
    const booking = await createBooking(userId, { petId, serviceId, employeeId, startTime: START_TIME });
    await expect(updateBookingStatus({ id: otherUserId, role: UserRole.CUSTOMER }, booking.id, BookingStatus.CANCELLED)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects an invalid status transition", async () => {
    const booking = await createBooking(userId, { petId, serviceId, employeeId, startTime: START_TIME });
    await expect(updateBookingStatus({ id: userId, role: UserRole.ADMIN }, booking.id, BookingStatus.COMPLETED)).rejects.toMatchObject({ code: "INVALID_STATUS_TRANSITION" });
  });
});
