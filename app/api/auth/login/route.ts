import { NextResponse } from "next/server";
import { apiError, AppError, readJson } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/validators/auth";
import { sessionCookie, signSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await readJson(request));
    const user = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true, email: true, name: true, role: true, passwordHash: true } });
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) throw new AppError(401, "INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng");
    const sessionUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const response = NextResponse.json({ data: sessionUser });
    response.cookies.set(sessionCookie(await signSession(sessionUser)));
    return response;
  } catch (error) { return apiError(error); }
}
