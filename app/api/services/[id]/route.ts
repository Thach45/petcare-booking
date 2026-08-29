import { NextResponse } from "next/server";
import { UserRole } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { apiError, AppError, readJson } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema } from "@/validators/service";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser([UserRole.ADMIN]);
    const exists = await prisma.service.findUnique({ where: { id: params.id }, select: { id: true } });
    if (!exists) throw new AppError(404, "SERVICE_NOT_FOUND", "Không tìm thấy dịch vụ");
    const service = await prisma.service.update({ where: { id: params.id }, data: serviceInputSchema.partial().parse(await readJson(request)) });
    return NextResponse.json({ data: service });
  } catch (error) { return apiError(error); }
}
