import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { UserRole } from "@prisma/client";
import { env } from "@/lib/env";
import { AppError } from "@/lib/errors";

const COOKIE_NAME = "petcare_session";
const secret = new TextEncoder().encode(env.JWT_SECRET);
export type SessionUser = { id: string; email: string; role: UserRole; name: string };

export async function hashPassword(password: string) { return bcrypt.hash(password, 12); }
export async function verifyPassword(password: string, hash: string) { return bcrypt.compare(password, hash); }

export async function signSession(user: SessionUser) {
  return new SignJWT({ email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" }).setSubject(user.id).setIssuedAt().setExpirationTime("7d").sign(secret);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.name !== "string" || !Object.values(UserRole).includes(payload.role as UserRole)) return null;
    return { id: payload.sub, email: payload.email, name: payload.name, role: payload.role as UserRole };
  } catch { return null; }
}

export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new AppError(401, "UNAUTHENTICATED", "Bạn cần đăng nhập");
  if (roles && !roles.includes(user.role)) throw new AppError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này");
  return user;
}

export function sessionCookie(token: string) {
  return { name: COOKIE_NAME, value: token, httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };
}
