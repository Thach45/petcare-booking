-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('GROOMER', 'VET', 'RECEPTIONIST', 'MANAGER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BOOKING_CREATED', 'BOOKING_CONFIRMED', 'BOOKING_IN_PROGRESS', 'BOOKING_COMPLETED', 'BOOKING_CANCELLED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'STAFF', 'ADMIN');

-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "fromStatus" "BookingStatus",
    "toStatus" "BookingStatus" NOT NULL,
    "changedByUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "startTime" TIMESTAMPTZ(3) NOT NULL,
    "endTime" TIMESTAMPTZ(3) NOT NULL,
    "totalPrice" DECIMAL(12,2) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "cancelReason" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "EmployeeRole" NOT NULL DEFAULT 'GROOMER',
    "email" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "bookingId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pets" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "breed" TEXT,
    "weight" DECIMAL(6,2) NOT NULL,
    "age" INTEGER,
    "notes" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "pets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "basePrice" DECIMAL(12,2) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_status_history_bookingId_idx" ON "booking_status_history"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "bookings_employeeId_idx" ON "bookings"("employeeId" ASC);

-- CreateIndex
CREATE INDEX "bookings_employeeId_startTime_endTime_idx" ON "bookings"("employeeId" ASC, "startTime" ASC, "endTime" ASC);

-- CreateIndex
CREATE INDEX "bookings_endTime_idx" ON "bookings"("endTime" ASC);

-- CreateIndex
CREATE INDEX "bookings_petId_idx" ON "bookings"("petId" ASC);

-- CreateIndex
CREATE INDEX "bookings_startTime_idx" ON "bookings"("startTime" ASC);

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status" ASC);

-- CreateIndex
CREATE INDEX "bookings_userId_idx" ON "bookings"("userId" ASC);

-- CreateIndex
CREATE INDEX "employees_active_idx" ON "employees"("active" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "employees_email_key" ON "employees"("email" ASC);

-- CreateIndex
CREATE INDEX "employees_role_idx" ON "employees"("role" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "employees_userId_key" ON "employees"("userId" ASC);

-- CreateIndex
CREATE INDEX "notifications_bookingId_idx" ON "notifications"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "notifications_userId_read_idx" ON "notifications"("userId" ASC, "read" ASC);

-- CreateIndex
CREATE INDEX "pets_userId_idx" ON "pets"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId" ASC);

-- CreateIndex
CREATE INDEX "reviews_serviceId_idx" ON "reviews"("serviceId" ASC);

-- CreateIndex
CREATE INDEX "reviews_userId_idx" ON "reviews"("userId" ASC);

-- CreateIndex
CREATE INDEX "services_active_idx" ON "services"("active" ASC);

-- CreateIndex
CREATE INDEX "services_category_idx" ON "services"("category" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email" ASC);

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role" ASC);

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_petId_fkey" FOREIGN KEY ("petId") REFERENCES "pets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pets" ADD CONSTRAINT "pets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Extension required for the exclusion constraint below (gist index on a text equality operator)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- CheckConstraints (not representable in schema.prisma — enforced at the DB layer only)
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_end_after_start" CHECK ("endTime" > "startTime");
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_total_price_non_negative" CHECK ("totalPrice" >= 0);
ALTER TABLE "pets" ADD CONSTRAINT "pets_weight_positive" CHECK (weight > 0);
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_rating_range" CHECK (rating >= 1 AND rating <= 5);
ALTER TABLE "services" ADD CONSTRAINT "services_base_price_non_negative" CHECK ("basePrice" >= 0);
ALTER TABLE "services" ADD CONSTRAINT "services_duration_positive" CHECK ("durationMinutes" > 0);

-- ExclusionConstraint: a second, DB-level guarantee against double-booking an employee
-- (belt-and-suspenders alongside the advisory lock + overlap check in services/booking.service.ts)
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_no_overlap_per_employee"
  EXCLUDE USING gist ("employeeId" WITH =, tstzrange("startTime", "endTime", '[)') WITH &&)
  WHERE (status <> 'CANCELLED');
