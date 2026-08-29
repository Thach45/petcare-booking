import { NextRequest, NextResponse } from "next/server";
import { apiError } from "@/lib/errors";
import { getAvailableSlots } from "@/services/availability.service";
import { availabilitySchema } from "@/validators/booking";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const input = availabilitySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const slots = await getAvailableSlots(input.employeeId, input.serviceId, input.date);
    return NextResponse.json({ data: slots });
  } catch (error) { return apiError(error); }
}
