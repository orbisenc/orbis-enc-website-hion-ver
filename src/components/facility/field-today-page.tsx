import { initialWorkOrders } from "@/data/apartmentOperations";
import { mockDashboardData } from "@/data/mockDashboard";
import { CalendarCheck2, HardHat, MapPin } from "lucide-react";
import Link from "next/link";

export function FieldTodayPage() {
  const inspections = mockDashboardData.inspections.filter((item) => item.assignee === "박기술" || item.status === "진행").slice(0,5);
  const orders = initialWorkOrders.filter((item) => item.assignee === "박기술" && !["완료","종료","취소"].includes(item.status));
  return <div className="facility-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">모바일 현장 업무</span><h1>오늘의 점검·작업</h1><p>박기술 담당 · 2026년 7월 21일</p></div></div><div className="facility-field-grid"><section className="facility-page-panel"><h2><CalendarCheck2 size={18} /> 점검 {inspections.length}건</h2><ul className="facility-record-list">{inspections.map((item) => { const asset = mockDashboardData.assets.find((assetItem) => assetItem.id === item.assetId); return <li key={item.id}><Link href={`/field/inspections/${item.id}`}><strong>{item.type}</strong></Link><span><MapPin size={12} /> {asset?.locationLabel}</span><em>{item.status}</em></li>; })}</ul></section><section className="facility-page-panel"><h2><HardHat size={18} /> 작업지시 {orders.length}건</h2><ul className="facility-record-list">{orders.map((item) => <li key={item.id}><Link href={`/field/work-orders/${item.id}`}><strong>{item.title}</strong></Link><span>{item.targetDate} · SLA {item.slaHours}시간</span><em>{item.status}</em></li>)}</ul></section></div></div>;
}
