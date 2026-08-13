"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const mainLinks = [
  ["/admin", "현황"], ["/admin/complex", "단지·세대"], ["/admin/rosters", "명부"],
  ["/admin/agendas", "안건 제작"], ["/admin/campaigns", "안건 현황 관리"], ["/admin/settings", "설정"],
];

const feeLinks = [
  ["/admin/fees", "관리비 대시보드"], ["/admin/fees/monthly", "월별 관리비"],
  ["/admin/fees/units", "세대별 현황"], ["/admin/fees/categories", "관리비 항목"],
  ["/admin/fees/imports", "데이터 등록"], ["/admin/fees/budget", "예산 대비 현황"],
  ["/admin/fees/reports", "관리비 보고서"], ["/admin/fees/settings", "관리비 설정"],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const navLink = ([href, label]: string[]) => <Link key={href} href={href} aria-current={pathname === href || href !== "/admin" && pathname.startsWith(`${href}/`) ? "page" : undefined}>{label}</Link>;
  return <div className="admin-shell">
    <aside className="admin-nav">
      <Link href="/admin"><strong style={{ fontSize: 24 }}>HION</strong></Link>
      <p style={{ color: "#b9eefa" }}>해오름 아파트</p>
      <nav aria-label="관리자 메뉴">
        {mainLinks.map(navLink)}
        <p className="admin-nav-title">관리비 관리</p>
        {feeLinks.map(navLink)}
      </nav>
    </aside>
    <main className="admin-main">{children}</main>
  </div>;
}
