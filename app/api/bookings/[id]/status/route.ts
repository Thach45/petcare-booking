import { NextResponse } from "next/server";
import { apiError, readJson } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { updateBookingStatus } from "@/services/booking.service";
import { bookingStatusSchema } from "@/validators/booking";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const { status } = bookingStatusSchema.parse(await readJson(request));
    const booking = await updateBookingStatus(user, params.id, status);
    return NextResponse.json({ data: booking });
  } catch (error) { return apiError(error); }
}
