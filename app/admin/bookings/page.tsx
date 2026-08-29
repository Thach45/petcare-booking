import { BookingStatus } from "@prisma/client";
import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminBookingActions } from "@/components/admin-booking-actions";
import { requireAdminPage } from "@/lib/admin-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function dateTime(value: Date) { return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(value); }
function statusLabel(status: BookingStatus) { return ({ PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", IN_PROGRESS: "Đang phục vụ", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy" })[status]; }

export default async function AdminBookingsPage() {
  const user = await requireAdminPage();
  const bookings = await prisma.booking.findMany({ include: { pet: true, service: true, employee: true, user: true }, orderBy: { startTime: "desc" }, take: 20 }).catch(() => []);
  return <AdminShell active="bookings" userName={user.name}><div className="admin-content"><div className="admin-page-heading"><div><p className="admin-eyebrow">ĐIỀU PHỐI LỊCH</p><h1>Lịch hẹn của PetCare.</h1><span>Kiểm tra và xử lý các yêu cầu mới theo thứ tự thời gian.</span></div><Link href="/admin" className="admin-ghost-button">← Tổng quan</Link></div><section className="admin-panel admin-table-panel"><div className="admin-panel-head"><div><p className="admin-eyebrow">DANH SÁCH GẦN ĐÂY</p><h2>{bookings.length} lịch hẹn</h2></div><span className="admin-live-dot">Đang đồng bộ</span></div>{bookings.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Thời gian</th><th>Thú cưng</th><th>Dịch vụ</th><th>Khách hàng</th><th>Nhân sự</th><th>Trạng thái</th><th>Thao tác</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td>{dateTime(booking.startTime)}</td><td><strong>{booking.pet.name}</strong><small>{booking.pet.species}</small></td><td>{booking.service.name}</td><td>{booking.user.name}</td><td>{booking.employee.name}</td><td><span className={`admin-status ${booking.status.toLowerCase()}`}>{statusLabel(booking.status)}</span></td><td><AdminBookingActions bookingId={booking.id} status={booking.status} /></td></tr>)}</tbody></table></div> : <div className="admin-empty"><strong>Chưa có dữ liệu lịch hẹn.</strong><span>Khi khách gửi yêu cầu, lịch sẽ hiển thị tại đây.</span></div>}</section></div></AdminShell>;
}
