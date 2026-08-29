import { EmployeeRole, PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SEED_PASSWORD = "petcare-dev-only-2026";

async function main() {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const admin = await prisma.user.upsert({ where: { email: "admin@petcare.local" }, update: { passwordHash, role: UserRole.ADMIN }, create: { email: "admin@petcare.local", name: "System Admin", role: UserRole.ADMIN, passwordHash } });
  const customer = await prisma.user.upsert({ where: { email: "customer@petcare.local" }, update: {}, create: { email: "customer@petcare.local", name: "Nguyễn Minh Anh", role: UserRole.CUSTOMER, passwordHash } });
  await prisma.pet.upsert({ where: { id: "milo-demo" }, update: {}, create: { id: "milo-demo", userId: customer.id, name: "Milo", species: "Chó", breed: "Poodle", weight: 6.5, age: 3, notes: "Dị ứng với nước hoa mạnh" } });
  await prisma.service.upsert({ where: { id: "service-basic" }, update: {}, create: { id: "service-basic", name: "Tắm và vệ sinh cơ bản", description: "Tắm, sấy và vệ sinh tai", basePrice: 150000, durationMinutes: 60 } });
  await prisma.service.upsert({ where: { id: "service-grooming" }, update: {}, create: { id: "service-grooming", name: "Cắt tỉa toàn diện", description: "Tắm, sấy và cắt tỉa tạo kiểu", basePrice: 300000, durationMinutes: 120 } });
  const count = await prisma.employee.count();
  if (count === 0) await prisma.employee.createMany({ data: [{ id: "staff-ha", name: "Trần Thu Hà", role: EmployeeRole.GROOMER }, { id: "staff-bao", name: "Lê Quốc Bảo", role: EmployeeRole.VET }] });
  console.log(`Seeded admin ${admin.email} and customer ${customer.email}. Dev-only password: ${SEED_PASSWORD} — never reuse in staging/production.`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
