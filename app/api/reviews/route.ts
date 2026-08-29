import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError, AppError, readJson } from "@/lib/errors";
import { pageMeta, paginationSchema } from "@/lib/pagination";
import { createReviewSchema } from "@/validators/review";
import { createReview, listServiceReviews } from "@/services/review.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const serviceId = request.nextUrl.searchParams.get("serviceId");
    if (!serviceId) throw new AppError(422, "SERVICE_ID_REQUIRED", "Thiếu serviceId để lọc đánh giá");
    const { data, total, averageRating } = await listServiceReviews(serviceId, page, pageSize);
    return NextResponse.json({ data, meta: { ...pageMeta(page, pageSize, total), averageRating } });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const review = await createReview(user.id, createReviewSchema.parse(await readJson(request)));
    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) { return apiError(error); }
}
