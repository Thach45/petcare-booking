"use client";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmployeeRole } from "@prisma/client";
import { createEmployeeAction, setEmployeeActiveAction } from "@/app/actions/catalog-actions";
import { employeeRoleLabel, employeeRoles } from "@/lib/employee-labels";

export function AdminEmployeeForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [role, setRole] = useState<EmployeeRole>(EmployeeRole.GROOMER);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await createEmployeeAction({ name, role });
        setName(""); setRole(EmployeeRole.GROOMER);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể thêm nhân sự");
      }
    });
  }

  return <form onSubmit={submit} className="dialog-form admin-inline-form">
    <div className="form-two-col">
      <label>Tên nhân sự<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Trần Thu Hà" /></label>
      <label>Vai trò<select value={role} onChange={(event) => setRole(event.target.value as EmployeeRole)}>{employeeRoles.map((item) => <option key={item} value={item}>{employeeRoleLabel[item]}</option>)}</select></label>
    </div>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="submit" className="primary-button" disabled={pending}>{pending ? "Đang lưu..." : "Thêm nhân sự"}</button>
  </form>;
}

export function EmployeeActiveToggle({ employeeId, active }: { employeeId: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function toggle() {
    startTransition(async () => {
      await setEmployeeActiveAction(employeeId, !active);
      router.refresh();
    });
  }
  return <button type="button" className="admin-ghost-button" disabled={pending} onClick={toggle}>{active ? "Cho nghỉ" : "Kích hoạt lại"}</button>;
}
