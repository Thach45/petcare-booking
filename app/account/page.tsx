"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

type SessionUser = { id: string; email: string; name: string; role: string };
type Pet = { id: string; name: string; species: string; breed: string | null; weight: string; age: number | null };
type Review = { rating: number; comment: string | null };
type Booking = { id: string; startTime: string; status: string; totalPrice: string; pet: { name: string }; service: { name: string }; employee: { name: string }; review: Review | null };

const statusLabel: Record<string, string> = { PENDING: "Chờ xác nhận", CONFIRMED: "Đã xác nhận", IN_PROGRESS: "Đang phục vụ", COMPLETED: "Hoàn tất", CANCELLED: "Đã hủy" };
const STARS = [1, 2, 3, 4, 5];

function formatDateTime(value: string) { return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); }
function formatMoney(value: string) { return `${new Intl.NumberFormat("vi-VN").format(Number(value))}đ`; }
function starDisplay(rating: number) { return STARS.map((n) => (n <= rating ? "★" : "☆")).join(""); }

function weightTier(weight: number) {
  if (weight < 5) return { label: "Miễn phụ thu", tone: "free" };
  if (weight < 15) return { label: "+50.000đ phụ thu", tone: "medium" };
  return { label: "+100.000đ phụ thu", tone: "large" };
}

function PawIcon() {
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 14.5c-2.8 0-5 2.1-5 4.5 0 1.5 1.2 2 2.5 1.5.9-.4 1.7-.4 2.5 0 1.3.5 2.5 0 2.5-1.5 0-2.4-2.2-4.5-5-4.5Z" /><ellipse cx="6.5" cy="10" rx="2" ry="2.7" /><ellipse cx="17.5" cy="10" rx="2" ry="2.7" /><ellipse cx="10" cy="6" rx="2" ry="2.7" /><ellipse cx="14" cy="6" rx="2" ry="2.7" /></svg>;
}

function PetCard({ pet }: { pet: Pet }) {
  const tier = weightTier(Number(pet.weight));
  return <article className="pet-card">
    <span className={`pet-card-icon tone-${tier.tone}`}><PawIcon /></span>
    <div className="pet-card-body">
      <strong>{pet.name}</strong>
      <span className="pet-card-meta">{pet.species}{pet.breed ? ` · ${pet.breed}` : ""}{pet.age != null ? ` · ${pet.age} tuổi` : ""}</span>
    </div>
    <div className="pet-card-weight">
      <b>{pet.weight}kg</b>
      <em className={`tone-${tier.tone}`}>{tier.label}</em>
    </div>
  </article>;
}

function ReviewCell({ booking, onSubmitted }: { booking: Booking; onSubmitted: () => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (booking.status !== "COMPLETED") return <span className="review-muted">—</span>;
  if (booking.review) return <span className="review-stars" title={`${booking.review.rating}/5`}>{starDisplay(booking.review.rating)}</span>;

  if (!open) return <button type="button" className="admin-ghost-button" onClick={() => setOpen(true)}>Đánh giá</button>;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id, rating, comment: comment.trim() || undefined }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Không thể gửi đánh giá lúc này");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể gửi đánh giá lúc này");
    } finally {
      setSaving(false);
    }
  }

  return <form className="review-form" onSubmit={submit}>
    <div className="review-star-picker" role="radiogroup" aria-label="Chọn số sao">{STARS.map((n) => <button key={n} type="button" role="radio" aria-checked={n === rating} className={n <= rating ? "on" : ""} onClick={() => setRating(n)}>★</button>)}</div>
    <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Cảm nhận của bạn (không bắt buộc)" rows={2} />
    {error && <p className="form-error" role="alert">{error}</p>}
    <div className="review-form-actions"><button type="submit" className="primary-button" disabled={saving}>{saving ? "Đang gửi..." : "Gửi đánh giá"}</button><button type="button" className="admin-ghost-button" onClick={() => setOpen(false)}>Hủy</button></div>
  </form>;
}

export default function AccountPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const [weight, setWeight] = useState("");
  const [age, setAge] = useState("");
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadData() {
    setLoadingData(true);
    try {
      const [petsRes, bookingsRes] = await Promise.all([fetch("/api/pets?pageSize=100"), fetch("/api/bookings?pageSize=20")]);
      if (petsRes.ok) setPets((await petsRes.json()).data);
      if (bookingsRes.ok) setBookings((await bookingsRes.json()).data);
    } finally {
      setLoadingData(false);
    }
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => setUser(payload.data))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => { if (user) loadData(); }, [user]);

  async function addPet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    setSaving(true);
    try {
      const response = await fetch("/api/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, species, breed: breed || undefined, weight: Number(weight), age: age ? Number(age) : undefined }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message ?? "Không thể thêm thú cưng lúc này");
      setName(""); setSpecies(""); setBreed(""); setWeight(""); setAge("");
      await loadData();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Không thể thêm thú cưng lúc này");
    } finally {
      setSaving(false);
    }
  }

  if (checking) return <main className="booking-page"><SiteHeader /><div className="page-loading">Đang tải tài khoản...</div><SiteFooter /></main>;

  if (!user) {
    return <main className="booking-page"><SiteHeader /><section className="booking-layout"><div className="admin-empty admin-panel"><strong>Bạn cần đăng nhập để xem tài khoản.</strong><div style={{ display: "flex", gap: 12, marginTop: 16 }}><Link href="/login?next=/account" className="primary-button">Đăng nhập</Link></div></div></section><SiteFooter /></main>;
  }

  return <main className="booking-page"><SiteHeader />
    <section className="booking-layout">
      <aside className="booking-aside"><p className="eyebrow">Tài khoản của bạn</p><h1>Xin chào, {user.name}.</h1><p>Quản lý thú cưng và theo dõi lịch hẹn đã đặt.</p><Link href="/booking" className="back-link">Đặt lịch mới →</Link></aside>

      <section className="booking-form-page">
        <div className="form-heading"><p className="eyebrow">Thú cưng của bạn</p><h2>{loadingData ? "Đang tải..." : `${pets.length} thú cưng`}</h2></div>
        {pets.length > 0 ? <div className="pet-grid">{pets.map((pet) => <PetCard key={pet.id} pet={pet} />)}</div> : !loadingData && <div className="admin-empty" style={{ marginBottom: 24 }}><strong>Bạn chưa có thú cưng nào.</strong><span>Thêm thú cưng ở form bên dưới để bắt đầu đặt lịch.</span></div>}

        <form onSubmit={addPet} className="dialog-form">
          <label>Tên thú cưng<input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Ví dụ: Milo" /></label>
          <div className="form-two-col">
            <label>Loài<input required value={species} onChange={(event) => setSpecies(event.target.value)} placeholder="Chó, Mèo..." /></label>
            <label>Giống<input value={breed} onChange={(event) => setBreed(event.target.value)} placeholder="Poodle..." /></label>
          </div>
          <div className="form-two-col">
            <label>Cân nặng (kg)<input required type="number" step="0.1" min="0.1" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
            <label>Tuổi<input type="number" min="0" value={age} onChange={(event) => setAge(event.target.value)} /></label>
          </div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <button className="primary-button" type="submit" disabled={saving}>{saving ? "Đang lưu..." : "Thêm thú cưng"}</button>
        </form>

        <div className="form-heading" style={{ marginTop: 40 }}><p className="eyebrow">Lịch hẹn của bạn</p><h2>{loadingData ? "Đang tải..." : `${bookings.length} lịch hẹn gần nhất`}</h2></div>
        {bookings.length ? <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Thời gian</th><th>Dịch vụ</th><th>Thú cưng</th><th>Nhân viên</th><th>Giá</th><th>Trạng thái</th><th>Đánh giá</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td>{formatDateTime(booking.startTime)}</td><td>{booking.service.name}</td><td>{booking.pet.name}</td><td>{booking.employee.name}</td><td>{formatMoney(booking.totalPrice)}</td><td><span className={`admin-status ${booking.status.toLowerCase()}`}>{statusLabel[booking.status] ?? booking.status}</span></td><td><ReviewCell booking={booking} onSubmitted={loadData} /></td></tr>)}</tbody></table></div> : !loadingData && <div className="admin-empty"><strong>Bạn chưa có lịch hẹn nào.</strong></div>}
      </section>
    </section>
  <SiteFooter /></main>;
}
