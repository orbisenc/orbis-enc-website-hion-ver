import type { Building, SensorSnapshot } from "@/types/facility";
import { LiveDateTime } from "@/components/common/live-date-time";
import { Building2, CalendarDays, CloudSun, Droplets, Leaf, MonitorUp } from "lucide-react";
import Link from "next/link";

export function DashboardTitle({ building, sensor }: { building: Building; sensor: SensorSnapshot }) {
  return <section className="facility-dashboard-title">
    <div className="facility-title-copy"><Building2 size={48} aria-hidden="true" /><div><h1>{building.name} 시설운영 대시보드</h1><p>{building.buildingCount}개 동 · {building.unitCount?.toLocaleString("ko-KR")}세대 · 공용시설 자산 수명주기 통합관리</p></div></div>
    <div className="facility-sensor-wrap">
      <div className="facility-sensors" aria-label="현장 센서 요약">
        <span><CloudSun size={17} /> {sensor.temperatureCelsius}℃</span>
        <span><Droplets size={17} /> {sensor.humidityPercent}%</span>
        <span><Leaf size={17} /> {sensor.environmentStatus}</span>
        <span><CalendarDays size={17} /> <LiveDateTime /></span>
      </div>
      <Link className="facility-monitor-button" href="/monitoring"><MonitorUp size={17} /> 현장 모니터링</Link>
    </div>
  </section>;
}
