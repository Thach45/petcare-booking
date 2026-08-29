import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminServiceForm, ServiceActiveToggle } from "@/components/admin-service-form";
import { requireAdminPage } from "@/lib/admin-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(value: { toString(): string }) { return `${new Intl.NumberFormat("vi-VN").format(Number(value.toString()))}đ`; }

export default async function AdminServicesPage() {
  const user = await requireAdminPage();
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } }).catch(() => []);
  return <AdminShell active="services" userName={user.name}><div className="admin-content"><div className="admin-page-heading"><div><p className="admin-eyebrow">DANH MỤC DỊCH VỤ</p><h1>Những điều PetCare đang làm.</h1><span>Giá cơ bản và thời lượng được dùng để tạo các buổi hẹn.</span></div><Link href="/admin" className="admin-ghost-button">← Tổng quan</Link></div>
    <section className="admin-panel"><p className="admin-eyebrow">THÊM DỊCH VỤ MỚI</p><AdminServiceForm /></section>
    <section className="admin-service-list">{services.length ? services.map((service) => <article key={service.id} className="admin-service-row"><span className="admin-service-mark">✦</span><div><strong>{service.name}</strong><p>{service.description ?? "Chưa có mô tả cho dịch vụ này."}</p></div><span>{service.durationMinutes} phút</span><b>{money(service.basePrice)}</b><em className={service.active ? "is-active" : "is-inactive"}>{service.active ? "Đang mở" : "Tạm dừng"}</em><ServiceActiveToggle serviceId={service.id} active={service.active} /></article>) : <div className="admin-empty admin-panel"><strong>Chưa có dịch vụ để quản lý.</strong><span>Thêm dịch vụ ở form phía trên để danh mục xuất hiện ở đây.</span></div>}</section></div></AdminShell>;
}
