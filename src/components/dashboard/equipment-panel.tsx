import { mockDashboardData } from "@/data/mockDashboard";
import { BatteryCharging, Cctv, ChevronRight, Fan, Gauge, Waves } from "lucide-react";
import Link from "next/link";

const equipment = [
  { label: "배수·급수펌프", types: ["배수펌프", "급수펌프", "오수펌프"], icon: Waves },
  { label: "환기팬", types: ["환기팬"], icon: Fan },
  { label: "승강기", types: ["승강기"], icon: Gauge },
  { label: "전기차 충전기", types: ["전기차 충전기"], icon: BatteryCharging },
  { label: "CCTV·출입통제", types: ["CCTV", "출입통제기"], icon: Cctv },
];

export function EquipmentPanel() {
  return <section className="facility-panel facility-equipment-panel"><h2>주요 설비 현황</h2><div className="facility-equipment-list">{equipment.map(({ label, types, icon: Icon }) => {
    const count = mockDashboardData.assets.filter((asset) => types.includes(asset.subtype)).length;
    return <Link key={label} href={`/assets?type=${encodeURIComponent(types[0]!)}`}><Icon size={19} /><span>{label}</span><strong>{count}<small>대</small></strong></Link>;
  })}</div><Link className="facility-more-link" href="/assets">전체 자산 보기 <ChevronRight size={15} /></Link></section>;
}
