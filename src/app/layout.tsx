import type { Metadata } from "next";
import "./globals.css";
import "../styles/facility.css";
import "../styles/marketing.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.orbisdnc.com"),
  title: "ORBIS D&C",
  description: "건물의 공간, 시설자산과 운영 데이터를 연결하는 ORBIS D&C 공식 웹사이트",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
