import { notFound, redirect } from "next/navigation";

import { CampaignManager } from "@/components/admin/campaign-manager";
import { readAdminSession } from "@/server/auth/session";
import { getDemoCampaignRecord, listAgendaCampaignAudits } from "@/server/demo/agenda-campaign-store";
import { demoStore, getDashboard } from "@/server/demo/store";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  let campaign;
  try { campaign = getDemoCampaignRecord(session.tenantId, id); } catch { notFound(); }
  return <CampaignManager initialCampaign={campaign} dashboard={getDashboard()} initialAudits={listAgendaCampaignAudits(session.tenantId, id)} notifications={demoStore.notifications} />;
}
