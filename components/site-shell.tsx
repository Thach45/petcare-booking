"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NotificationBell } from "@/components/notification-bell";
import { useSession } from "@/lib/use-session";

const links = [
  { href: "/", label: "Trang chủ" }, { href: "/services", label: "Dịch vụ" }, { href: "/booking", label: "Đặt lịch" }, { href: "/pricing", label: "Bảng giá" }, { href: "/blog", label: "Blog" }, { href: "/about", label: "Về chúng tôi" }, { href: "/account", label: "Tài khoản" },
];

export function PetCareLogo() { return <Link className="brand" href="/" aria-label="PetCare — về trang chủ"><span className="brand-mark"><svg aria-hidden="true" width="29" height="29" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14.5c-2.8 0-5 2.1-5 4.5 0 1.5 1.2 2 2.5 1.5.9-.4 1.7-.4 2.5 0 1.3.5 2.5 0 2.5-1.5 0-2.4-2.2-4.5-5-4.5Z" /><ellipse cx="6.5" cy="10" rx="2" ry="2.7" /><ellipse cx="17.5" cy="10" rx="2" ry="2.7" /><ellipse cx="10" cy="6" rx="2" ry="2.7" /><ellipse cx="14" cy="6" rx="2" ry="2.7" /></svg></span><span><strong>Pet<span>Care</span></strong><small>Yêu thương thú cưng</small></span></Link>; }

function AccountMenu() {
  const router = useRouter();
  const { user, checking, setUser } = useSession();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function logout() {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  if (checking) return <span className="account-menu-skeleton" aria-hidden="true" />;

  if (!user) return <><Link className="login-button header-link" href="/login">Đăng nhập</Link><Link className="join-button header-link" href="/register">Đăng ký</Link></>;

  return <div className="account-menu" ref={rootRef}>
    <button type="button" className="account-menu-trigger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
      <span className="account-avatar">{user.name.slice(0, 1).toUpperCase()}</span>
      <span className="account-name">{user.name}</span>
      <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg>
    </button>
    {open && <div className="account-menu-panel" role="menu">
      <div className="account-menu-head"><strong>{user.name}</strong><span>{user.email}</span></div>
      <Link href="/account" role="menuitem" onClick={() => setOpen(false)}>Tài khoản của tôi</Link>
      {user.role === "ADMIN" && <Link href="/admin" role="menuitem" onClick={() => setOpen(false)}>Trang quản trị</Link>}
      <button type="button" role="menuitem" onClick={logout}>Đăng xuất</button>
    </div>}
  </div>;
}

export function SiteHeader() { const pathname = usePathname(); const [open, setOpen] = useState(false); return <header className="site-header"><div className="nav-shell"><PetCareLogo /><nav className={open ? "nav-links open" : "nav-links"} aria-label="Điều hướng chính">{links.map((link) => <Link key={link.href} href={link.href} className={pathname === link.href ? "active" : ""} onClick={() => setOpen(false)}>{link.label}</Link>)}</nav><div className="nav-actions"><NotificationBell /><AccountMenu /><button className="icon-button menu-button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Đóng menu" : "Mở menu"}>{open ? "×" : <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>}</button></div></div></header>; }
export function SiteFooter() { return <footer><PetCareLogo /><p>Chăm sóc chu đáo, mỗi ngày một đáng yêu hơn.</p><span>© 2026 PetCare</span></footer>; }
