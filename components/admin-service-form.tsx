"use client";
import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createServiceAction, setServiceActiveAction } from "@/app/actions/catalog-actions";

export function AdminServiceForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    startTransition(async () => {
      try {
        await createServiceAction({ name, description: description || undefined, basePrice: Number(basePrice), durationMinutes: Number(durationMinutes), category: category || undefined });
        setName(""); setDescription(""); setBasePrice(""); setDurationMinutes(""); setCategory("");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể thêm dịch vụ");
      }
    });
  }

  return <form onSubmit={submit} className="dialog-form admin-inline-form">
    <label>Tên dịch vụ<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Tắm và vệ sinh cơ bản" /></label>
    <div className="form-two-col">
      <label>Giá cơ bản (đ)<input required type="number" min="0" value={basePrice} onChange={(event) => setBasePrice(event.target.value)} /></label>
      <label>Thời lượng (phút)<input required type="number" min="15" value={durationMinutes} onChange={(event) => setDurationMinutes(event.target.value)} /></label>
    </div>
    <label>Danh mục<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Grooming, Khám bệnh..." /></label>
    <label>Mô tả<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} /></label>
    {error && <p className="form-error" role="alert">{error}</p>}
    <button type="submit" className="primary-button" disabled={pending}>{pending ? "Đang lưu..." : "Thêm dịch vụ"}</button>
  </form>;
}

export function ServiceActiveToggle({ serviceId, active }: { serviceId: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function toggle() {
    startTransition(async () => {
      await setServiceActiveAction(serviceId, !active);
      router.refresh();
    });
  }
  return <button type="button" className="admin-ghost-button" disabled={pending} onClick={toggle}>{active ? "Tạm dừng" : "Mở lại"}</button>;
}
