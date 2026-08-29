import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { AdminEmployeeForm, EmployeeActiveToggle } from "@/components/admin-employee-form";
import { requireAdminPage } from "@/lib/admin-page";
import { employeeRoleLabel } from "@/lib/employee-labels";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const user = await requireAdminPage();
  const staff = await prisma.employee.findMany({ orderBy: [{ active: "desc" }, { name: "asc" }] }).catch(() => []);
  return <AdminShell active="staff" userName={user.name}><div className="admin-content"><div className="admin-page-heading"><div><p className="admin-eyebrow">ĐỘI NGŨ</p><h1>Người chăm sóc bé mỗi ngày.</h1><span>Nhân sự có thể nhận lịch được hiển thị ưu tiên ở đầu danh sách.</span></div><Link href="/admin" className="admin-ghost-button">← Tổng quan</Link></div>
    <section className="admin-panel"><p className="admin-eyebrow">THÊM NHÂN SỰ MỚI</p><AdminEmployeeForm /></section>
    <section className="admin-staff-grid">{staff.length ? staff.map((employee) => <article key={employee.id} className="admin-staff-card"><span>{employee.name.slice(0, 1)}</span><div><strong>{employee.name}</strong><p>{employeeRoleLabel[employee.role]}</p></div><b className={employee.active ? "is-active" : "is-inactive"}>{employee.active ? "Đang làm việc" : "Tạm nghỉ"}</b><EmployeeActiveToggle employeeId={employee.id} active={employee.active} /></article>) : <div className="admin-empty admin-panel"><strong>Chưa có nhân sự.</strong><span>Thêm nhân sự ở form phía trên để sắp lịch hẹn và phân công chăm sóc.</span></div>}</section></div></AdminShell>;
}
