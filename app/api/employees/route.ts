import { NextRequest, NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/errors";
import { pageMeta, paginationSchema } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { employeeInputSchema } from "@/validators/employee";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const where: Prisma.EmployeeWhereInput = { active: true, ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) };
    const [data, total] = await prisma.$transaction([prisma.employee.findMany({ where, orderBy: { name: "asc" }, skip: (page - 1) * pageSize, take: pageSize }), prisma.employee.count({ where })]);
    return NextResponse.json({ data, meta: pageMeta(page, pageSize, total) });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  try {
    await requireUser([UserRole.ADMIN]);
    const employee = await prisma.employee.create({ data: employeeInputSchema.parse(await readJson(request)) });
    return NextResponse.json({ data: employee }, { status: 201 });
  } catch (error) { return apiError(error); }
}
