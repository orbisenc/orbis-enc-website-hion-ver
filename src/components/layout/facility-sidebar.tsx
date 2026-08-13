"use client";

import { BarChart3, Boxes, BrainCircuit, Building2, ClipboardCheck, FileBarChart, FileText, HardHat, Home, Landmark, Megaphone, Settings, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "운영 대시보드", icon: Home },
  { href: "/asset-map", label: "3D 자산맵", icon: Boxes },
  { href: "/assets", label: "시설자산", icon: Building2 },
  { href: "/inspections", label: "점검·작업", icon: ClipboardCheck },
  { href: "/work-orders", label: "작업지시", icon: HardHat },
  { href: "/replacement", label: "교체·장기수선", icon: Wrench },
  { href: "/budget", label: "공사·예산", icon: Landmark },
  { href: "/complaints", label: "입주민 소통", icon: Megaphone },
  { href: "/ai-insights", label: "AI 인사이트", icon: BrainCircuit },
  { href: "/reports", label: "보고서·문서", icon: FileBarChart },
  { href: "/settings/users", label: "설정", icon: Settings },
];

export function FacilitySidebar() {
  const pathname = usePathname();
  return <aside className="facility-sidebar" aria-label="시설 운영 메뉴">
    <div className="facility-sidebar-brand"><strong>HION</strong><span>Apartment OS</span></div>
    <nav>{items.map(({ href, label, icon: Icon }) => {
      const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}><Icon size={18} /><span>{label}</span></Link>;
    })}</nav>
    <div className="facility-sidebar-foot"><BarChart3 size={17} /><span>데모 데이터</span><strong>48개 자산</strong><FileText size={15} /></div>
  </aside>;
}
