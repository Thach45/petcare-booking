import { NextResponse } from "next/server";
import { apiError } from "@/lib/errors";
import { sessionCookie } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const response = NextResponse.json({ data: { ok: true } });
    response.cookies.set({ ...sessionCookie(""), maxAge: 0 });
    return response;
  } catch (error) { return apiError(error); }
}
