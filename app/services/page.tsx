"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageCta, PublicPage } from "@/components/public-page";

type Service = { id: string; name: string; category: string | null; description: string | null; durationMinutes: number; basePrice: string };

const ALL = "Tất cả";
const pageSize = 4;
const tones = ["blue", "green", "coral", "violet", "peach", "yellow"];

function money(value: string) { return `${new Intl.NumberFormat("vi-VN").format(Number(value))}đ`; }
function code(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase(); }

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(ALL);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/services?pageSize=100")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((payload) => setServices(payload.data))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => [ALL, ...Array.from(new Set(services.map((service) => service.category).filter((value): value is string => Boolean(value))))], [services]);
  const filtered = useMemo(() => activeFilter === ALL ? services : services.filter((service) => service.category === activeFilter), [services, activeFilter]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  function filter(category: string) { setActiveFilter(category); setPage(1); }

  return <PublicPage eyebrow="Dịch vụ PetCare" title="Chọn đúng dịch vụ cho bé" copy="Lọc nhanh theo nhu cầu, xem thông tin rõ ràng và đặt lịch ở thời gian phù hợp.">
    <section className="content-section service-directory">
      <aside className="service-filter" aria-label="Lọc danh sách dịch vụ"><strong>Lọc theo nhu cầu</strong>{categories.map((item) => <button type="button" key={item} className={activeFilter === item ? "active" : ""} onClick={() => filter(item)}>{item}<span>{item === ALL ? services.length : services.filter((service) => service.category === item).length}</span></button>)}</aside>
      <div className="service-directory-main">
        <div className="service-directory-head"><div><p className="eyebrow">Danh mục dịch vụ</p><h2>{activeFilter === ALL ? "Tất cả dịch vụ" : activeFilter}</h2></div><span>{loading ? "Đang tải..." : `Hiển thị ${visible.length} / ${filtered.length} dịch vụ`}</span></div>
        <div className="service-list">{visible.map((service, index) => <article className="service-list-item" key={service.id}><span className={`service-list-code ${tones[index % tones.length]}`}>{code(service.name)}</span><div><p>{service.category ?? "Dịch vụ PetCare"} · {service.durationMinutes} phút</p><h3>{service.name}</h3><span>{service.description ?? ""}</span></div><strong>{money(service.basePrice)}</strong><Link href={`/booking?service=${encodeURIComponent(service.name)}`}>Đặt lịch <span>→</span></Link></article>)}</div>
        {!loading && services.length === 0 && <div className="admin-empty admin-panel"><strong>Chưa có dịch vụ nào đang mở.</strong></div>}
        {totalPages > 1 && <nav className="service-pagination" aria-label="Phân trang dịch vụ"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>← Trước</button>{Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button type="button" key={number} aria-current={page === number ? "page" : undefined} className={page === number ? "active" : ""} onClick={() => setPage(number)}>{number}</button>)}<button type="button" disabled={page === totalPages} onClick={() => setPage((value) => value + 1)}>Sau →</button></nav>}
      </div>
    </section>
    <PageCta title="Chưa chắc bé cần dịch vụ nào?" copy="Đặt một buổi tư vấn ngắn, đội ngũ PetCare sẽ giúp bạn chọn dịch vụ phù hợp." />
  </PublicPage>;
}
