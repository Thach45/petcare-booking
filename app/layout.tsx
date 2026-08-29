import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PetCare — Yêu thương thú cưng",
  description: "Đặt lịch chăm sóc thú cưng nhanh chóng và tận tâm.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
