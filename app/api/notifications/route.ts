import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError } from "@/lib/errors";
import { pageMeta, paginationSchema } from "@/lib/pagination";
import { listNotifications, markAllNotificationsRead } from "@/services/notification.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const { data, total, unread } = await listNotifications(user.id, page, pageSize);
    return NextResponse.json({ data, meta: { ...pageMeta(page, pageSize, total), unread } });
  } catch (error) { return apiError(error); }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireUser();
    await markAllNotificationsRead(user.id);
    return NextResponse.json({ data: { ok: true } });
  } catch (error) { return apiError(error); }
}
