"use server";

import { revalidatePath } from "next/cache";
import { UserRole } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { serviceInputSchema } from "@/validators/service";
import { employeeInputSchema } from "@/validators/employee";

export async function createServiceAction(payload: unknown) {
  await requireUser([UserRole.ADMIN]);
  const service = await prisma.service.create({ data: serviceInputSchema.parse(payload) });
  revalidatePath("/admin/services");
  return service;
}

export async function setServiceActiveAction(serviceId: string, active: boolean) {
  await requireUser([UserRole.ADMIN]);
  const service = await prisma.service.update({ where: { id: serviceId }, data: { active } });
  revalidatePath("/admin/services");
  return service;
}

export async function createEmployeeAction(payload: unknown) {
  await requireUser([UserRole.ADMIN]);
  const employee = await prisma.employee.create({ data: employeeInputSchema.parse(payload) });
  revalidatePath("/admin/staff");
  return employee;
}

export async function setEmployeeActiveAction(employeeId: string, active: boolean) {
  await requireUser([UserRole.ADMIN]);
  const employee = await prisma.employee.update({ where: { id: employeeId }, data: { active } });
  revalidatePath("/admin/staff");
  return employee;
}
