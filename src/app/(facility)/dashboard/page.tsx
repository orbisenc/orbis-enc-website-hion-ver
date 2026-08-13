import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { facilityRepository } from "@/services/facilityRepository";

export default async function DashboardPage() {
  const data = await facilityRepository.getDashboard();
  return <DashboardClient data={data} />;
}
