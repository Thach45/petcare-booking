import { NextRequest, NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { apiError, AppError, readJson } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { pageMeta, paginationSchema } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema } from "@/validators/service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "true";
    if (includeInactive) await requireUser([UserRole.ADMIN]);
    const where: Prisma.ServiceWhereInput = { ...(includeInactive ? {} : { active: true }), ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) };
    const [data, total] = await prisma.$transaction([prisma.service.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * pageSize, take: pageSize }), prisma.service.count({ where })]);
    return NextResponse.json({ data, meta: pageMeta(page, pageSize, total) });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    await requireUser([UserRole.ADMIN]);
    const service = await prisma.service.create({ data: serviceInputSchema.parse(await readJson(request)) });
    return NextResponse.json({ data: service }, { status: 201 });
  } catch (error) { return apiError(error); }
}
