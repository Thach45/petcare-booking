"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { PetCareLogo } from "@/components/site-shell";

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setPending(true); setMessage(""); const form = new FormData(event.currentTarget); try { const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: form.get("name"), email: form.get("email"), password: form.get("password") }) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error?.message ?? "Không thể tạo tài khoản lúc này"); router.push("/booking"); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Không thể tạo tài khoản lúc này"); } finally { setPending(false); } }
  return <main className="auth-page"><section className="auth-art register-art"><PetCareLogo /><div><p className="eyebrow">Bắt đầu thật dễ dàng</p><h1>Đồng hành cùng bé từ những điều nhỏ nhất.</h1><p>Tạo tài khoản để lưu thông tin bé cưng và đặt lịch chỉ trong vài thao tác.</p></div><span className="auth-paw" aria-hidden="true" /></section><section className="auth-panel"><div className="auth-card"><p className="eyebrow">Đăng ký</p><h2>Tạo tài khoản PetCare</h2><p className="auth-subtitle">Đã có tài khoản? <Link href="/login">Đăng nhập</Link></p><form onSubmit={submit}><label>Họ và tên<input required name="name" type="text" autoComplete="name" placeholder="Nguyễn Minh Anh" /></label><label>Email<input required name="email" type="email" autoComplete="email" placeholder="email@cuaban.com" /></label><label>Mật khẩu<input required name="password" type="password" minLength={8} autoComplete="new-password" placeholder="Ít nhất 8 ký tự" /></label>{message && <p className="form-error" role="alert">{message}</p>}<button className="primary-button" type="submit" disabled={pending}>{pending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}</button></form><Link className="back-link auth-back" href="/">← Trở về trang chủ</Link></div></section></main>;
}
