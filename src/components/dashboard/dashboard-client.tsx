import { ActivityPanels } from "@/components/dashboard/activity-panels";
import { CategoryPanel } from "@/components/dashboard/category-panel";
import { DashboardTitle } from "@/components/dashboard/dashboard-title";
import { EquipmentPanel } from "@/components/dashboard/equipment-panel";
import { KpiRow } from "@/components/dashboard/kpi-row";
import { DigitalTwinViewer } from "@/components/digital-twin/digital-twin-viewer";
import type { FacilityDashboardData } from "@/types/facility";

export function DashboardClient({ data }: { data: FacilityDashboardData }) {
  return <div className="facility-dashboard"><DashboardTitle building={data.building} sensor={data.sensor} /><KpiRow data={data} /><div className="facility-dashboard-grid"><div className="facility-left-stack"><CategoryPanel /><EquipmentPanel /></div><DigitalTwinViewer /><ActivityPanels /></div></div>;
}
