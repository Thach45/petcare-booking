"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PetCareLogo } from "@/components/site-shell";

export default function LoginPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setMessage(""); const form = new FormData(event.currentTarget); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.message ?? "Không thể đăng nhập lúc này"); router.push("/booking"); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Không thể đăng nhập lúc này"); } finally { setPending(false); } }
  return <main className="auth-page"><section className="auth-art"><PetCareLogo /><div><p className="eyebrow">Chào mừng trở lại</p><h1>Mỗi lần đặt lịch, bé đều được nhớ đến.</h1><p>Quản lý thông tin thú cưng, theo dõi lịch hẹn và nhận nhắc lịch trong một nơi.</p></div><span className="auth-paw" aria-hidden="true" /></section><section className="auth-panel"><div className="auth-card"><p className="eyebrow">Đăng nhập</p><h2>Tiếp tục chăm sóc cho bé</h2><p className="auth-subtitle">Chưa có tài khoản? <Link href="/register">Đăng ký miễn phí</Link></p><form onSubmit={submit}><label>Email<input required name="email" type="email" autoComplete="email" placeholder="email@cuaban.com" /></label><label>Mật khẩu<input required name="password" type="password" autoComplete="current-password" placeholder="Nhập mật khẩu" /></label>{message && <p className="form-error" role="alert">{message}</p>}<button className="primary-button" type="submit" disabled={pending}>{pending ? "Đang đăng nhập..." : "Đăng nhập"}</button></form><Link className="back-link auth-back" href="/">← Trở về trang chủ</Link></div></section></main>;
}
