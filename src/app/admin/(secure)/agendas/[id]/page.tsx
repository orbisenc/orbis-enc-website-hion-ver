import { notFound, redirect } from "next/navigation";

import { AgendaAttachmentManager } from "@/components/admin/agenda-attachment-manager";
import { AgendaCostImpactForm } from "@/components/admin/agenda-cost-impact-form";
import { AgendaEditor } from "@/components/admin/agenda-editor";
import { readAdminSession } from "@/server/auth/session";
import { getDemoAgendaRecord, listAgendaCampaignAudits } from "@/server/demo/agenda-campaign-store";
import { getApprovedAgendaCostImpact } from "@/server/demo/fee-store";
import { listAgendaAttachments } from "@/server/services/agenda-attachment-service";
import { formatSeoulDateTime } from "@/lib/format/ko";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  let agenda;
  try { agenda = getDemoAgendaRecord(session.tenantId, id); } catch { notFound(); }
  const attachments = listAgendaAttachments(session.tenantId, id);
  const costImpact = getApprovedAgendaCostImpact(session.tenantId)!;
  const audits = listAgendaCampaignAudits(session.tenantId, id);
  return <>
    <AgendaEditor initialAgenda={agenda} attachmentCount={attachments.length} costImpactApproved={Boolean(costImpact)} />
    <AgendaAttachmentManager agendaId={id} initialAttachments={attachments} />
    <AgendaCostImpactForm agendaId={id} initialValue={{ estimatedProjectCost: costImpact.estimatedProjectCost.toString(), actualProjectCost: costImpact.actualProjectCost?.toString() ?? "", fundingSourceKo: costImpact.fundingSourceKo, usesLongTermRepairReserve: costImpact.usesLongTermRepairReserve, requiresAdditionalFee: costImpact.requiresAdditionalFee, additionalFeeTotal: "18000000", allocationType: costImpact.allocationType, eligibleUnitCount: 2000, expectedBillingStartMonth: costImpact.expectedBillingStartMonth, installmentCount: costImpact.installmentCount, residentExplanationKo: costImpact.residentExplanationKo, approved: costImpact.approved, estimatedAmountPerUnit: costImpact.estimatedAmountPerUnit.toString() }} />
    <section className="card" style={{ marginTop: 22 }}><h2>최근 제작 이력</h2>{audits.length === 0 ? <p className="muted">이 세션에서 변경한 이력이 없습니다.</p> : <div className="table-wrap"><table><thead><tr><th>처리</th><th>담당</th><th>내용</th><th>시각</th></tr></thead><tbody>{audits.slice(0, 10).map((event) => <tr key={event.id}><td>{event.actionKo}</td><td>{event.actorKo}</td><td>{event.detailKo}</td><td>{formatSeoulDateTime(event.occurredAt)}</td></tr>)}</tbody></table></div>}</section>
  </>;
}
