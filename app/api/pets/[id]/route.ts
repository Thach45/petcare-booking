import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { apiError, AppError, readJson } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { petInputSchema } from "@/validators/pet";

export const dynamic = "force-dynamic";

type Context = { params: { id: string } };
async function ownedPet(id: string, userId: string) {
  const pet = await prisma.pet.findFirst({ where: { id, userId } });
  if (!pet) throw new AppError(404, "PET_NOT_FOUND", "Không tìm thấy thú cưng của bạn");
  return pet;
}
export async function GET(_: NextRequest, { params }: Context) {
  try { const user = await requireUser(); return NextResponse.json({ data: await ownedPet(params.id, user.id) }); }
  catch (error) { return apiError(error); }
}
export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await requireUser(); await ownedPet(params.id, user.id);
    const pet = await prisma.pet.update({ where: { id: params.id }, data: petInputSchema.partial().parse(await readJson(request)) });
    return NextResponse.json({ data: pet });
  } catch (error) { return apiError(error); }
}
