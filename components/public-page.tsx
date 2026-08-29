import Link from "next/link";
import { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export function PublicPage({ eyebrow, title, copy, children }: { eyebrow: string; title: string; copy: string; children: ReactNode }) {
  return <main className="inner-page"><SiteHeader /><section className="page-intro"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></div><span className="intro-paw" aria-hidden="true" /></section>{children}<SiteFooter /></main>;
}

export function PageCta({ title, copy, href = "/booking" }: { title: string; copy: string; href?: string }) {
  return <section className="page-cta"><div><p className="eyebrow">PetCare đồng hành cùng bạn</p><h2>{title}</h2><p>{copy}</p></div><Link href={href} className="primary-button">Đặt lịch ngay <span>→</span></Link></section>;
}
