import Link from "next/link";
import { PageCta, PublicPage } from "@/components/public-page";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function money(value: { toString(): string }) { return `${new Intl.NumberFormat("vi-VN").format(Number(value.toString()))}đ`; }

export default async function PricingPage() {
  const services = await prisma.service.findMany({ where: { active: true }, orderBy: { basePrice: "asc" } }).catch(() => []);
  return <PublicPage eyebrow="Bảng giá minh bạch" title="Chọn gói phù hợp cho từng buổi hẹn" copy="Mức giá hiển thị là giá khởi điểm. PetCare sẽ báo chính xác trước khi bắt đầu dịch vụ, dựa trên cân nặng và nhu cầu của bé.">
    <section className="content-section pricing-section">
      {services.length ? <div className="pricing-grid">{services.map((service, index) => <article className={index === 1 ? "price-card featured" : "price-card"} key={service.id}>{index === 1 && <span className="popular-label">Được yêu thích</span>}<p>{service.category ?? "Dịch vụ PetCare"}</p><h2>{service.name}</h2><strong>{money(service.basePrice)}<small>/ lần</small></strong>{service.description && <p>{service.description}</p>}<span>{service.durationMinutes} phút</span><Link href={`/booking?service=${encodeURIComponent(service.name)}`} className={index === 1 ? "primary-button" : "outline-button"}>Chọn gói này</Link></article>)}</div> : <div className="admin-empty admin-panel"><strong>Chưa có dịch vụ nào đang mở.</strong></div>}
      <p className="pricing-note">Phụ thu cân nặng: dưới 5kg miễn phí · 5–15kg +50.000đ · từ 15kg +100.000đ.</p>
    </section>
    <PageCta title="Bạn muốn đặt dịch vụ riêng lẻ?" copy="Xem toàn bộ dịch vụ và chọn đúng điều bé đang cần hôm nay." href="/services" />
  </PublicPage>;
}
