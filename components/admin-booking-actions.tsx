"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BookingStatus } from "@prisma/client";
import { updateBookingStatusAction } from "@/app/actions/booking-actions";

const nextStatusLabel: Partial<Record<BookingStatus, { status: BookingStatus; label: string }[]>> = {
  PENDING: [{ status: BookingStatus.CONFIRMED, label: "Xác nhận" }, { status: BookingStatus.CANCELLED, label: "Hủy" }],
  CONFIRMED: [{ status: BookingStatus.IN_PROGRESS, label: "Bắt đầu" }, { status: BookingStatus.CANCELLED, label: "Hủy" }],
  IN_PROGRESS: [{ status: BookingStatus.COMPLETED, label: "Hoàn tất" }],
};

export function AdminBookingActions({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const actions = nextStatusLabel[status] ?? [];
  if (actions.length === 0) return <span className="admin-action-empty">—</span>;

  function apply(next: BookingStatus) {
    setError("");
    startTransition(async () => {
      try {
        await updateBookingStatusAction(bookingId, { status: next });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không thể cập nhật trạng thái");
      }
    });
  }

  return <div className="admin-row-actions">
    {actions.map((action) => <button key={action.status} type="button" className="admin-ghost-button" disabled={pending} onClick={() => apply(action.status)}>{action.label}</button>)}
    {error && <span className="form-error" role="alert">{error}</span>}
  </div>;
}
