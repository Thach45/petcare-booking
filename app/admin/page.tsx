import { BookingStatus, UserRole } from "@prisma/client";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type DashboardData = { customers: number; today: number; pending: number; activeServices: number; bookings: Array<{ id: string; startTime: Date; status: BookingStatus; pet: { name: string; species: string }; service: { name: string }; user: { name: string }; employee: { name: string } }> };

function viNumber(value: number) { return new Intl.NumberFormat("vi-VN").format(value); }
function appointmentTime(value: Date) { return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(value); }
function statusLabel(status: BookingStatus) { return ({ PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", IN_PROGRESS: "Đang phục vụ", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy" })[status]; }

async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const start = new Date(now); start.setHours(0, 0, 0, 0);
  const end = new Date(now); end.setHours(23, 59, 59, 999);
  try {
    const [customers, today, pending, activeServices, bookings] = await prisma.$transaction([
      prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      prisma.booking.count({ where: { startTime: { gte: start, lte: end }, status: { not: BookingStatus.CANCELLED } } }),
      prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
      prisma.service.count({ where: { active: true } }),
      prisma.booking.findMany({ where: { startTime: { gte: start, lte: end }, status: { in: [BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS] } }, include: { pet: true, service: true, user: true, employee: true }, orderBy: { startTime: "asc" }, take: 6 }),
    ]);
    return { customers, today, pending, activeServices, bookings };
  } catch {
    return { customers: 0, today: 0, pending: 0, activeServices: 0, bookings: [] };
  }
}

export default async function AdminDashboardPage() {
  const user = await requireAdminPage();
  const data = await getDashboardData();
  const cards = [
    { label: "Lịch hẹn hôm nay", value: viNumber(data.today), detail: "Theo lịch đã đặt", tone: "orange" },
    { label: "Chờ xác nhận", value: viNumber(data.pending), detail: "Cần xử lý sớm", tone: "amber" },
    { label: "Khách hàng", value: viNumber(data.customers), detail: "Tài khoản khách", tone: "blue" },
    { label: "Dịch vụ hoạt động", value: viNumber(data.activeServices), detail: "Đang nhận đặt lịch", tone: "green" },
  ];
  return <AdminShell active="overview" userName={user.name}><div className="admin-content"><div className="admin-page-heading"><div><p className="admin-eyebrow">VẬN HÀNH HÔM NAY</p><h1>Chăm sóc đang diễn ra.</h1><span>Theo dõi lịch hẹn, khách hàng và đội ngũ trong một màn hình.</span></div><Link href="/admin/bookings" className="admin-primary-button">Xử lý lịch hẹn <span>→</span></Link></div><section className="admin-stats" aria-label="Số liệu vận hành">{cards.map((card) => <article className={`admin-stat ${card.tone}`} key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.detail}</small></article>)}</section><section className="admin-grid"><article className="admin-panel admin-schedule"><div className="admin-panel-head"><div><p className="admin-eyebrow">LỊCH HẸN</p><h2>Hôm nay</h2></div><Link href="/admin/bookings">Xem tất cả</Link></div>{data.bookings.length ? <div className="admin-appointment-list">{data.bookings.map((booking) => <article key={booking.id} className="admin-appointment"><time>{appointmentTime(booking.startTime)}</time><div className="admin-pet-dot">{booking.pet.name.slice(0, 1)}</div><div><strong>{booking.pet.name} · {booking.service.name}</strong><span>{booking.user.name} · {booking.employee.name}</span></div><b className={`admin-status ${booking.status.toLowerCase()}`}>{statusLabel(booking.status)}</b></article>)}</div> : <div className="admin-empty"><strong>Chưa có lịch hẹn trong hôm nay.</strong><span>Lịch mới sẽ xuất hiện tại đây để đội ngũ xử lý.</span></div>}</article><article className="admin-panel admin-workflow"><p className="admin-eyebrow">NHỊP VẬN HÀNH</p><h2>Buổi hẹn được chăm sóc rõ ràng.</h2><p>Từ lúc khách đặt lịch đến khi hoàn tất, đội ngũ luôn nhìn thấy bước tiếp theo.</p><ol><li><b>01</b><span><strong>Tiếp nhận</strong>Kiểm tra yêu cầu mới.</span></li><li><b>02</b><span><strong>Xác nhận</strong>Phân công nhân sự phù hợp.</span></li><li><b>03</b><span><strong>Hoàn tất</strong>Cập nhật kết quả cho chủ nuôi.</span></li></ol><Link href="/admin/services" className="admin-text-link">Quản lý danh mục dịch vụ →</Link></article></section></div></AdminShell>;
}
