import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/errors";
import { markNotificationRead } from "@/services/notification.service";

export const dynamic = "force-dynamic";

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    await markNotificationRead(user.id, params.id);
    return NextResponse.json({ data: { ok: true } });
  } catch (error) { return apiError(error); }
}
