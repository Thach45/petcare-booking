"use client";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

type SessionUser = { id: string; email: string; name: string; role: string };
type Pet = { id: string; name: string; species: string };
type Service = { id: string; name: string; durationMinutes: number };
type Employee = { id: string; name: string; role: string };
type Slot = { startTime: string; endTime: string };

function todayISODate() { return new Date().toISOString().slice(0, 10); }

function formatSlotTime(iso: string) { return new Intl.DateTimeFormat("vi-VN", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }

const PERIODS = [
  { key: "morning", label: "Buổi sáng", test: (hour: number) => hour < 12 },
  { key: "afternoon", label: "Buổi chiều", test: (hour: number) => hour >= 12 && hour < 18 },
  { key: "evening", label: "Buổi tối", test: (hour: number) => hour >= 18 },
];

function groupSlotsByPeriod(slots: Slot[]) {
  return PERIODS.map((period) => ({ ...period, slots: slots.filter((slot) => period.test(new Date(slot.startTime).getHours())) })).filter((group) => group.slots.length > 0);
}

function BookingForm() {
  const router = useRouter();
  const query = useSearchParams();
  const requestedService = query.get("service");

  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");

  const [petId, setPetId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(todayISODate());
  const [notes, setNotes] = useState("");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => setUser(payload.data))
      .catch(() => setUser(null))
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (checkingSession || !user) return;
    let cancelled = false;
    async function loadOptions() {
      try {
        const [petsRes, servicesRes, employeesRes] = await Promise.all([
          fetch("/api/pets?pageSize=100"),
          fetch("/api/services?pageSize=100"),
          fetch("/api/employees?pageSize=100"),
        ]);
        if (!petsRes.ok || !servicesRes.ok || !employeesRes.ok) throw new Error();
        const [petsPayload, servicesPayload, employeesPayload] = await Promise.all([petsRes.json(), servicesRes.json(), employeesRes.json()]);
        if (cancelled) return;
        setPets(petsPayload.data);
        setServices(servicesPayload.data);
        setEmployees(employeesPayload.data);
        const preselected = requestedService ? servicesPayload.data.find((service: Service) => service.name === requestedService) : null;
        setServiceId(preselected?.id ?? servicesPayload.data[0]?.id ?? "");
        setEmployeeId(employeesPayload.data[0]?.id ?? "");
        setPetId(petsPayload.data[0]?.id ?? "");
      } catch {
        if (!cancelled) setOptionsError("Không tải được dữ liệu dịch vụ/nhân sự/thú cưng. Vui lòng thử lại.");
      } finally {
        if (!cancelled) setLoadingOptions(false);
      }
    }
    loadOptions();
    return () => { cancelled = true; };
  }, [checkingSession, user, requestedService]);

  useEffect(() => {
    setSelectedSlot(null);
    if (!serviceId || !employeeId || !date) { setSlots([]); return; }
    let cancelled = false;
    setLoadingSlots(true);
    fetch(`/api/availability?employeeId=${employeeId}&serviceId=${serviceId}&date=${date}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => { if (!cancelled) setSlots(payload.data); })
      .catch(() => { if (!cancelled) setSlots([]); })
      .finally(() => { if (!cancelled) setLoadingSlots(false); });
    return () => { cancelled = true; };
  }, [serviceId, employeeId, date]);

  const selectedService = useMemo(() => services.find((service) => service.id === serviceId), [services, serviceId]);
  const slotGroups = useMemo(() => groupSlotsByPeriod(slots), [slots]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot) { setSubmitError("Vui lòng chọn một khung giờ còn trống."); return; }
    setSubmitting(true);
    setSubmitError("");
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ petId, serviceId, employeeId, startTime: selectedSlot.startTime, notes: notes.trim() || undefined }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Không thể đặt lịch lúc này");
      setComplete(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không thể đặt lịch lúc này");
    } finally {
      setSubmitting(false);
    }
  }

  if (!checkingSession && !user) {
    return <main className="booking-page"><SiteHeader /><section className="booking-layout"><div className="admin-empty admin-panel"><strong>Bạn cần đăng nhập để đặt lịch.</strong><span>Vui lòng đăng nhập hoặc tạo tài khoản trước khi tiếp tục.</span><div style={{ display: "flex", gap: 12, marginTop: 16 }}><Link href="/login?next=/booking" className="primary-button">Đăng nhập</Link><Link href="/register" className="outline-button">Đăng ký</Link></div></div></section><SiteFooter /></main>;
  }

  if (checkingSession || (user && loadingOptions)) {
    return <main className="booking-page"><SiteHeader /><div className="page-loading">Đang chuẩn bị lịch hẹn...</div><SiteFooter /></main>;
  }

  if (complete) {
    return <main className="booking-page"><SiteHeader /><section className="booking-layout"><section className="booking-success"><span>✓</span><p className="eyebrow">Yêu cầu đã được ghi nhận</p><h2>PetCare đang giữ lịch {selectedSlot ? formatSlotTime(selectedSlot.startTime) : ""} cho bé của bạn.</h2><p>Bạn có thể xem lại lịch hẹn trong tài khoản của mình.</p><Link href="/" className="primary-button">Về trang chủ</Link></section></section><SiteFooter /></main>;
  }

  return <main className="booking-page"><SiteHeader /><section className="booking-layout">
    <aside className="booking-aside"><p className="eyebrow">Đặt lịch PetCare</p><h1>Một buổi hẹn nhẹ nhàng cho bé.</h1><p>Chọn dịch vụ, thời gian và gửi yêu cầu. Hệ thống chỉ hiển thị khung giờ còn trống thật.</p><Link href="/services" className="back-link">← Xem lại dịch vụ</Link></aside>
    <form className="booking-form-page" onSubmit={submit}>
      <div className="form-heading"><p className="eyebrow">Thông tin đặt lịch</p><h2>Chọn dịch vụ và thời gian</h2></div>
      {optionsError && <p className="form-error" role="alert">{optionsError}</p>}
      {pets.length === 0 && <p className="form-error" role="alert">Bạn chưa có thú cưng nào. <Link href="/account">Thêm thú cưng</Link> trước khi đặt lịch.</p>}
      <label>Thú cưng<select required value={petId} onChange={(event) => setPetId(event.target.value)}>{pets.map((pet) => <option key={pet.id} value={pet.id}>{pet.name} — {pet.species}</option>)}</select></label>
      <div className="form-two-col">
        <label>Dịch vụ<select required value={serviceId} onChange={(event) => setServiceId(event.target.value)}>{services.map((service) => <option key={service.id} value={service.id}>{service.name} ({service.durationMinutes} phút)</option>)}</select></label>
        <label>Nhân viên<select required value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.name}</option>)}</select></label>
      </div>
      <label>Ngày hẹn<input required type="date" min={todayISODate()} value={date} onChange={(event) => setDate(event.target.value)} /></label>
      <fieldset>
        <legend>Chọn khung giờ còn trống{selectedService ? ` (${selectedService.durationMinutes} phút)` : ""}</legend>
        {selectedSlot && <p className="slot-selected-hint">Đã chọn <b>{formatSlotTime(selectedSlot.startTime)}</b></p>}
        {loadingSlots ? <p>Đang tải khung giờ...</p> : slotGroups.length ? <div className="slot-scroll">{slotGroups.map((group) => <div className="slot-period" key={group.key}><p className="slot-period-label">{group.label}</p><div className="slot-grid">{group.slots.map((slot) => <button type="button" key={slot.startTime} className={selectedSlot?.startTime === slot.startTime ? "slot active" : "slot"} onClick={() => setSelectedSlot(slot)}>{formatSlotTime(slot.startTime)}</button>)}</div></div>)}</div> : <p>Không còn khung giờ trống cho lựa chọn này, vui lòng đổi ngày hoặc nhân viên khác.</p>}
      </fieldset>
      <label className="note-field">Ghi chú cho PetCare<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Ví dụ: bé nhạy cảm với tiếng máy sấy..." rows={3} /></label>
      {submitError && <p className="form-error" role="alert">{submitError}</p>}
      <button type="submit" className="primary-button" disabled={submitting || !selectedSlot || pets.length === 0}>{submitting ? "Đang gửi..." : "Gửi yêu cầu đặt lịch"} <span>→</span></button>
      <p className="form-footnote">Bằng cách gửi yêu cầu, bạn đồng ý để PetCare liên hệ xác nhận lịch hẹn.</p>
    </form>
  </section><SiteFooter /></main>;
}

export default function BookingPage() {
  return <Suspense fallback={<main className="booking-page"><SiteHeader /><div className="page-loading">Đang chuẩn bị lịch hẹn...</div><SiteFooter /></main>}><BookingForm /></Suspense>;
}
