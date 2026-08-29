"use client";
import { useEffect, useRef, useState } from "react";

type Notification = { id: string; title: string; message: string; read: boolean; createdAt: string };

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  return `${Math.round(hours / 24)} ngày trước`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const response = await fetch("/api/notifications?pageSize=10");
      if (!response.ok) return;
      const payload = await response.json();
      setItems(payload.data);
      setUnread(payload.meta.unread);
    } finally {
      setLoaded(true);
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next) await load();
  }

  async function markAllRead() {
    setItems((current) => current.map((item) => ({ ...item, read: true })));
    setUnread(0);
    await fetch("/api/notifications", { method: "PATCH" });
  }

  async function markOneRead(id: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item)));
    setUnread((count) => Math.max(0, count - 1));
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
  }

  return <div className="notification-root" ref={rootRef}>
    <button type="button" className="icon-button notification" aria-label="Thông báo" aria-expanded={open} onClick={toggle}>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>
      {unread > 0 && <span className="notification-badge">{unread > 9 ? "9+" : unread}</span>}
    </button>
    {open && <div className="notification-panel" role="menu">
      <div className="notification-panel-head"><strong>Thông báo</strong>{unread > 0 && <button type="button" onClick={markAllRead}>Đánh dấu đã đọc hết</button>}</div>
      {!loaded ? <p className="notification-empty">Đang tải...</p> : items.length ? <ul className="notification-list">{items.map((item) => <li key={item.id} className={item.read ? "" : "unread"}><button type="button" onClick={() => markOneRead(item.id)}><strong>{item.title}</strong><span>{item.message}</span><time>{timeAgo(item.createdAt)}</time></button></li>)}</ul> : <p className="notification-empty">Chưa có thông báo nào.</p>}
    </div>}
  </div>;
}
