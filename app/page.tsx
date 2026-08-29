"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

type IconName = "bell" | "calendar" | "chevron" | "clipboard" | "heart" | "menu" | "paw" | "scissors" | "shield" | "sparkle" | "stethoscope" | "tooth" | "x";

function Icon({ name, size = 20, stroke = 1.8 }: { name: IconName; size?: number; stroke?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18M8 15h.01M12 15h.01M16 15h.01" /></>,
    chevron: <path d="m6 9 6 6 6-6" />,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 12h6M9 16h4" /></>,
    heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    paw: <><path d="M12 14.5c-2.8 0-5 2.1-5 4.5 0 1.5 1.2 2 2.5 1.5.9-.4 1.7-.4 2.5 0 1.3.5 2.5 0 2.5-1.5 0-2.4-2.2-4.5-5-4.5Z" /><ellipse cx="6.5" cy="10" rx="2" ry="2.7" /><ellipse cx="17.5" cy="10" rx="2" ry="2.7" /><ellipse cx="10" cy="6" rx="2" ry="2.7" /><ellipse cx="14" cy="6" rx="2" ry="2.7" /></>,
    scissors: <><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="m8.6 7.6 10.9 8.8M8.6 16.4l10.9-8.8" /></>,
    shield: <><path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" /><path d="m8.5 12 2.3 2.3 4.8-5" /></>,
    sparkle: <path d="m12 3-1.7 5.3L5 10l5.3 1.7L12 17l1.7-5.3L19 10l-5.3-1.7L12 3ZM19 16l-.8 2.2L16 19l2.2.8L19 22l.8-2.2L22 19l-2.2-.8L19 16Z" />,
    stethoscope: <><path d="M6 3v5a6 6 0 0 0 12 0V3M6 6H3M18 6h3M12 14v3a4 4 0 0 0 8 0v-1" /><circle cx="20" cy="14" r="1" /></>,
    tooth: <path d="M12 3c-3.2-1.7-7.4-.3-8.5 3.2-1 3.4 1.2 6.2 2.4 8.8.8 1.8 1 5 2.6 5s1.7-3.2 3.5-3.2 1.9 3.2 3.5 3.2 1.8-3.2 2.6-5c1.2-2.6 3.4-5.4 2.4-8.8C19.4 2.7 15.2 1.3 12 3Z" />,
    x: <path d="m6 6 12 12M18 6 6 18" />,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const services = [
  { title: "Khám bệnh", copy: "Khám sức khoẻ định kỳ và điều trị bệnh", icon: "stethoscope" as const, tone: "blue" },
  { title: "Tắm & Grooming", copy: "Tắm, sấy tạo kiểu và vệ sinh thú cưng", icon: "scissors" as const, tone: "violet" },
  { title: "Vệ sinh răng miệng", copy: "Vệ sinh răng miệng và chăm sóc nha khoa", icon: "tooth" as const, tone: "green" },
  { title: "Tiêm phòng", copy: "Tiêm vaccine và phòng ngừa bệnh", icon: "sparkle" as const, tone: "peach" },
];

const promises = [
  { title: "An toàn & Uy tín", copy: "Quy trình chuẩn y khoa", icon: "shield" as const, tone: "blue" },
  { title: "Tiết kiệm thời gian", copy: "Đặt lịch online, không cần chờ đợi lâu", icon: "calendar" as const, tone: "violet" },
  { title: "Yêu thương tận tâm", copy: "Chăm sóc thú cưng như người thân", icon: "heart" as const, tone: "coral" },
  { title: "Hỗ trợ 24/7", copy: "Luôn sẵn sàng giải đáp mọi thắc mắc", icon: "bell" as const, tone: "green" },
];

export default function Home() {
  const [activeService, setActiveService] = useState("Tắm & Grooming");
  const earliestBookingDate = new Date().toISOString().slice(0, 10);
  return <main id="top">
    <SiteHeader />

    <section className="hero"><div className="hero-shell"><div className="hero-copy"><p className="love-note"><Icon name="heart" size={15} />Chăm sóc với tình yêu thương</p><h1>Đặt lịch dễ dàng <span>Chăm sóc toàn diện</span></h1><p className="hero-description">Đặt lịch nhanh chóng cho các dịch vụ chăm sóc thú cưng với đội ngũ bác sĩ và nhân viên chuyên nghiệp.</p></div><div className="hero-visual" aria-label="Chú chó Golden Retriever và mèo con"><span className="shape shape-one" /><span className="shape shape-two" /><span className="paw-stamp"><Icon name="paw" size={42} /></span><span className="love-bubble"><Icon name="heart" size={29} /></span><Image src="/petcare-hero.png" alt="Chú chó Golden Retriever và mèo con của PetCare" width={1024} height={1536} priority className="hero-pets" /></div>
      <section className="quick-booking" aria-labelledby="quick-booking-title"><h2 id="quick-booking-title" className="sr-only">Tìm lịch trống</h2><div className="field"><label htmlFor="service">Dịch vụ</label><div className="select-wrap"><Icon name="clipboard" size={19} /><select id="service" value={activeService} onChange={(event) => setActiveService(event.target.value)}><option>Khám bệnh</option><option>Tắm & Grooming</option><option>Vệ sinh răng miệng</option><option>Tiêm phòng</option></select><Icon name="chevron" size={17} /></div></div><div className="field"><label htmlFor="date">Ngày hẹn</label><div className="select-wrap"><Icon name="calendar" size={19} /><input id="date" type="date" min={earliestBookingDate} /><Icon name="calendar" size={17} /></div></div><div className="field"><label htmlFor="pet">Thú cưng</label><div className="select-wrap"><Icon name="paw" size={19} /><select id="pet" defaultValue=""><option value="" disabled>Chọn thú cưng</option><option>Milo — Poodle</option><option>Luna — Mèo Anh lông ngắn</option></select><Icon name="chevron" size={17} /></div></div><Link className="search-button" href={`/booking?service=${encodeURIComponent(activeService)}`}><Icon name="calendar" size={19} />Tìm lịch trống</Link><div className="booking-benefits"><span><i className="benefit-icon"><Icon name="calendar" size={19} /></i><b>Đặt lịch dễ dàng</b><small>Chỉ với vài bước đơn giản</small></span><span><i className="benefit-icon"><Icon name="clipboard" size={19} /></i><b>Xác nhận nhanh chóng</b><small>Phản hồi trong 5 phút</small></span><span><i className="benefit-icon"><Icon name="heart" size={19} /></i><b>Đội ngũ chuyên nghiệp</b><small>Bác sĩ thú y giàu kinh nghiệm</small></span></div></section></div></section>

    <section className="services-section" id="services"><div className="section-heading"><p className="eyebrow">Dành cho bé yêu của bạn</p><h2>Dịch vụ phổ biến</h2><p>Đa dạng dịch vụ chăm sóc thú cưng cho bạn lựa chọn</p></div><div className="services-grid">{services.map((service, index) => <article className={`service-card ${service.tone}`} key={service.title}><div className="card-content"><span className="service-icon"><Icon name={service.icon} size={29} /></span><h3>{service.title}</h3><p>{service.copy}</p><Link href={`/booking?service=${encodeURIComponent(service.title)}`}>Đặt lịch <span>→</span></Link></div><div className={`card-pet pet-${index}`} aria-hidden="true"><Icon name="paw" size={index === 0 ? 82 : 74} stroke={1.1} /></div></article>)}</div></section>

    <section className="promise-strip" id="about">{promises.map((promise) => <article key={promise.title}><span className={`promise-icon ${promise.tone}`}><Icon name={promise.icon} size={26} /></span><div><h3>{promise.title}</h3><p>{promise.copy}</p></div></article>)}</section>
    <section className="appointment-banner" id="pricing"><div><p className="eyebrow">Sẵn sàng cho buổi hẹn tiếp theo?</p><h2>Mỗi bé cưng đều xứng đáng được yêu thương trọn vẹn.</h2></div><Link className="primary-button" href="/booking"><Icon name="calendar" size={18} />Đặt lịch ngay</Link></section>
    <SiteFooter />
  </main>;
}
