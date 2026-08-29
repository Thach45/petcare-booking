import { NextResponse } from "next/server";
import { apiError } from "@/lib/errors";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try { return NextResponse.json({ data: await requireUser() }); }
  catch (error) { return apiError(error); }
}
