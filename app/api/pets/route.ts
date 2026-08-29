import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { apiError, readJson } from "@/lib/errors";
import { pageMeta, paginationSchema } from "@/lib/pagination";
import { prisma } from "@/lib/prisma";
import { petInputSchema } from "@/validators/pet";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { page, pageSize } = paginationSchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const search = request.nextUrl.searchParams.get("search")?.trim();
    const species = request.nextUrl.searchParams.get("species")?.trim();
    const where: Prisma.PetWhereInput = { userId: user.id, ...(species ? { species: { equals: species, mode: "insensitive" } } : {}), ...(search ? { OR: [{ name: { contains: search, mode: "insensitive" } }, { breed: { contains: search, mode: "insensitive" } }] } : {}) };
    const [data, total] = await prisma.$transaction([prisma.pet.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize }), prisma.pet.count({ where })]);
    return NextResponse.json({ data, meta: pageMeta(page, pageSize, total) });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const input = petInputSchema.parse(await readJson(request));
    const pet = await prisma.pet.create({ data: { ...input, userId: user.id } });
    return NextResponse.json({ data: pet }, { status: 201 });
  } catch (error) { return apiError(error); }
}
