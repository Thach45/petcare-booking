import { NextResponse } from "next/server";
import { Prisma, UserRole } from "@prisma/client";
import { hashPassword, sessionCookie, signSession } from "@/lib/auth";
import { apiError, AppError, readJson } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/validators/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { password, ...input } = registerSchema.parse(await readJson(request));
    const user = await prisma.user.create({ data: { ...input, passwordHash: await hashPassword(password), role: UserRole.CUSTOMER }, select: { id: true, email: true, name: true, role: true } });
    const response = NextResponse.json({ data: user }, { status: 201 });
    response.cookies.set(sessionCookie(await signSession(user)));
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return apiError(new AppError(409, "EMAIL_TAKEN", "Email đã được sử dụng"));
    return apiError(error);
  }
}
