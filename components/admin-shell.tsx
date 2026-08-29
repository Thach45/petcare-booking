import Link from "next/link";
import { PetCareLogo } from "@/components/site-shell";

type AdminSection = "overview" | "bookings" | "services" | "staff";

const navItems: Array<{ href: string; label: string; section: AdminSection; icon: string }> = [
  { href: "/admin", label: "Tổng quan", section: "overview", icon: "⌂" },
  { href: "/admin/bookings", label: "Lịch hẹn", section: "bookings", icon: "◷" },
  { href: "/admin/services", label: "Dịch vụ", section: "services", icon: "✦" },
  { href: "/admin/staff", label: "Nhân sự", section: "staff", icon: "♙" },
];

export function AdminShell({ active, userName, children }: { active: AdminSection; userName: string; children: React.ReactNode }) {
  return <main className="admin-app"><aside className="admin-sidebar"><PetCareLogo /><p className="admin-kicker">TRUNG TÂM QUẢN TRỊ</p><nav aria-label="Điều hướng quản trị">{navItems.map((item) => <Link key={item.href} className={active === item.section ? "admin-nav-link active" : "admin-nav-link"} href={item.href}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav><div className="admin-sidebar-bottom"><div className="admin-help"><strong>Cần hỗ trợ?</strong><span>Nhóm vận hành luôn sẵn sàng.</span></div><Link href="/" className="admin-back-link">← Về trang PetCare</Link></div></aside><section className="admin-main"><header className="admin-topbar"><div><p>PetCare / Quản trị</p><strong>Xin chào, {userName}</strong></div><div className="admin-top-actions"><Link href="/booking" className="admin-ghost-button">Xem luồng đặt lịch</Link><span className="admin-avatar" aria-label={`Tài khoản ${userName}`}>{userName.slice(0, 1).toUpperCase()}</span></div></header>{children}</section></main>;
}
