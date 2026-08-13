"use client";

import { StatusBadge } from "@/components/common/status-badge";
import { Modal } from "@/components/common/modal";
import { InspectionDetailDialog } from "@/components/facility/inspection-detail-dialog";
import { mockDashboardData } from "@/data/mockDashboard";
import { calculateBudgetExecutionRate, formatWon } from "@/lib/facility";
import { useHydrateInspectionStore, useInspectionStore } from "@/store/inspectionStore";
import type { MaintenanceRecord } from "@/types/facility";
import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function PanelHeader({ title, href }: { title: string; href: string }) {
  return <header className="facility-panel-header"><h2>{title}</h2><Link href={href}>더보기 <ChevronRight size={14} /></Link></header>;
}

export function ActivityPanels() {
  useHydrateInspectionStore();
  const router = useRouter();
  const inspections = useInspectionStore((state) => state.inspections);
  const transitionInspection = useInspectionStore((state) => state.transitionInspection);
  const deleteInspection = useInspectionStore((state) => state.deleteInspection);
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord | null>(null);
  const inspection = inspections.find((item) => item.id === inspectionId);
  const budget = mockDashboardData.budget;
  const rate = calculateBudgetExecutionRate(budget);
  return <div className="facility-right-stack">
    <section className="facility-panel facility-list-panel"><PanelHeader title="정기점검 일정" href="/inspections" /><div className="facility-compact-list">
      {inspections.slice().sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)).slice(0, 5).map((item) => <button type="button" key={item.id} onClick={() => setInspectionId(item.id)}><time>{item.scheduledAt}</time><span>{item.type}</span><StatusBadge tone={item.status === "완료" ? "success" : item.status === "진행" ? "warning" : item.status === "지연" ? "danger" : "info"}>{item.status}</StatusBadge></button>)}
    </div></section>
    <section className="facility-panel facility-list-panel"><PanelHeader title="최근 유지보수 이력" href="/maintenance" /><div className="facility-compact-list">
      {mockDashboardData.maintenance.map((item) => <button type="button" key={item.id} onClick={() => setMaintenance(item)}><time>{item.completedAt}</time><span>{item.title}</span><StatusBadge tone="success">완료</StatusBadge></button>)}
    </div></section>
    <section className="facility-panel facility-budget-panel"><PanelHeader title="연간 유지관리 예산" href="/budget" /><div className="facility-budget-content">
      <div className="facility-budget-chart" role="img" aria-label={`유지관리 예산 집행률 ${rate}%`}><svg className="facility-svg-donut" viewBox="0 0 42 42" aria-hidden="true"><circle cx="21" cy="21" r="15.9155" fill="none" stroke="#1689ff" strokeWidth="7" strokeDasharray={`${rate} ${100-rate}`} /><circle cx="21" cy="21" r="15.9155" fill="none" stroke="#22c7d6" strokeWidth="7" strokeDasharray={`${100-rate} ${rate}`} strokeDashoffset={-rate} /></svg><span><small>계획 대비 집행률</small><strong>{rate}%</strong></span></div>
      <dl><div><dt><i className="planned" />계획</dt><dd>{budget.plannedMillionWon.toLocaleString()} 백만원</dd></div><div><dt><i className="spent" />집행</dt><dd>{budget.spentMillionWon.toLocaleString()} 백만원</dd></div><div><dt><i className="remaining" />잔액</dt><dd>{budget.remainingMillionWon.toLocaleString()} 백만원</dd></div><small>단위: 백만원</small></dl>
    </div></section>
    {inspection && <InspectionDetailDialog inspection={inspection} asset={mockDashboardData.assets.find((asset) => asset.id === inspection.assetId)} onClose={() => setInspectionId(null)} onEdit={() => router.push(`/inspections?action=edit&inspectionId=${inspection.id}`)} onDuplicate={() => router.push(`/inspections?action=duplicate&inspectionId=${inspection.id}`)} onDelete={() => { deleteInspection(inspection.id); setInspectionId(null); }} onTransition={(status, result) => transitionInspection(inspection.id, status, result)} />}
    {maintenance && <Modal title="유지보수 상세" onClose={() => setMaintenance(null)}><div className="facility-modal-body"><FileText size={34} /><dl className="facility-definition-list"><div><dt>작업명</dt><dd>{maintenance.title}</dd></div><div><dt>업체</dt><dd>{maintenance.contractor}</dd></div><div><dt>비용</dt><dd>{formatWon(maintenance.costWon)}</dd></div><div><dt>작업 내용</dt><dd>{maintenance.description}</dd></div><div><dt>첨부</dt><dd>{maintenance.attachmentName}</dd></div></dl><Link className="facility-button primary" href="/maintenance">유지보수 이력 보기</Link></div></Modal>}
  </div>;
}
