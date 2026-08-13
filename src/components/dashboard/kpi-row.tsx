import type { FacilityDashboardData } from "@/types/facility";
import { AlertTriangle, BadgeCheck, ClipboardCheck, WalletCards } from "lucide-react";
import Link from "next/link";

export function KpiRow({ data }: { data: FacilityDashboardData }) {
  const urgent = data.assets.filter((asset) => ["urgent", "offline", "inspection"].includes(asset.status)).length;
  const kpis = [
    { label: "긴급 이슈", value: urgent.toLocaleString("ko-KR"), unit: "건", href: "/inspection-required?priority=urgent", icon: AlertTriangle, tone: "danger", note: "2026.07.21 기준" },
    { label: "교체 검토", value: data.replacementReviews.length.toLocaleString("ko-KR"), unit: "건", href: "/replacement", icon: ClipboardCheck, tone: "purple", note: "위험점수 58점 이상" },
    { label: "점검 완료율", value: "91", unit: "%", href: "/inspections?status=완료", icon: BadgeCheck, tone: "cyan", note: "7월 계획 110건 중 100건" },
    { label: "예산 집행률", value: "62", unit: "%", href: "/budget", icon: WalletCards, tone: "cyan", note: "2026년 승인예산 기준" },
  ];
  return <section className="facility-kpi-row" aria-label="시설 핵심 지표">{kpis.map(({ label, value, unit, href, icon: Icon, tone, note }) => <Link key={label} className={`facility-kpi is-${tone}`} href={href} aria-label={`${label} ${value}${unit}`}><Icon size={34} /><span><small>{label}</small><strong>{value}</strong><em>{unit}</em><small className="facility-kpi-note">{note}</small></span></Link>)}</section>;
}
