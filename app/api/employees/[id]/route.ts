import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { apiError, AppError, readJson } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { employeeInputSchema } from "@/validators/employee";

export const dynamic = "force-dynamic";

const employeePatchSchema = employeeInputSchema.partial();

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser([UserRole.ADMIN]);
    const employee = await prisma.employee.update({ where: { id: params.id }, data: employeePatchSchema.parse(await readJson(request)) });
    return NextResponse.json({ data: employee });
  } catch (error) {
    if (error instanceof Error && "code" in error && (error as { code?: string }).code === "P2025") return apiError(new AppError(404, "EMPLOYEE_NOT_FOUND", "Không tìm thấy nhân viên"));
    return apiError(error);
  }
}
