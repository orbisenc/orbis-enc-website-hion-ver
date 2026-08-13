"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { formatWon } from "@/lib/facility";
import { workOrderTransitions } from "@/server/services/facility-work-order-service";
import { scopeWorkOrdersForActor } from "@/server/services/facility-permission-service";
import { useApartmentOperationsStore } from "@/store/apartmentOperationsStore";
import type { FacilityRole, WorkOrder, WorkOrderStatus } from "@/types/facility";
import { AlertTriangle, CheckCircle2, ClipboardList, Columns3, FileImage, List, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const kanbanGroups: Array<{ label: string; statuses: WorkOrderStatus[] }> = [
  { label: "접수·분류", statuses: ["접수","분류","승인대기"] }, { label: "배정", statuses: ["배정"] }, { label: "작업 중", statuses: ["진행"] }, { label: "검수", statuses: ["검수요청"] }, { label: "완료", statuses: ["완료","종료"] },
];

export function WorkOrdersPage({ initialAssetId, initialOrderId }: { initialAssetId?: string; initialOrderId?: string }) {
  const workOrders = useApartmentOperationsStore((state) => state.workOrders);
  const transition = useApartmentOperationsStore((state) => state.transitionOrder);
  const updateExecution = useApartmentOperationsStore((state) => state.updateOrderExecution);
  const addEvidence = useApartmentOperationsStore((state) => state.addEvidence);
  const [hydrated, setHydrated] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialOrderId ?? null);
  const [message, setMessage] = useState("");
  const [actor, setActor] = useState<{ tenantId: string; role: FacilityRole; name: string }>({ tenantId: "hion-demo", role: "관리사무소 책임자", name: "김관리" });
  useEffect(() => { const storage = useApartmentOperationsStore.persist.rehydrate(); const session = fetch("/api/facility/session").then((response) => response.json()).then((data: { session?: { tenantId: string; role: FacilityRole; name: string } | null }) => { if (data.session) setActor(data.session); }).catch(() => undefined); Promise.all([Promise.resolve(storage), session]).finally(() => setHydrated(true)); }, []);
  const scopedOrders = useMemo(() => scopeWorkOrdersForActor(workOrders, actor), [actor, workOrders]);
  const filtered = useMemo(() => scopedOrders.filter((order) => {
    const asset = mockDashboardData.assets.find((item) => item.id === order.assetId);
    return (!initialAssetId || order.assetId === initialAssetId) && (!query || `${order.id} ${order.title} ${asset?.name} ${order.assignee} ${order.vendor}`.toLowerCase().includes(query.toLowerCase()));
  }), [initialAssetId, query, scopedOrders]);
  const selected = scopedOrders.find((order) => order.id === selectedId) ?? null;
  const readOnly = actor.role === "입주자대표회의" || actor.role === "입주민";
  if (!hydrated) return <div className="facility-loading-state">작업지시를 불러오는 중입니다.</div>;
  return <div className="facility-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">점검·민원·알림 연결</span><h1>작업지시</h1><p>접수부터 현장 증빙, 검수와 완료까지 유효한 상태 전이로 관리합니다.</p></div><div className="facility-view-switch"><button type="button" aria-pressed={view === "kanban"} onClick={() => setView("kanban")}><Columns3 size={15} /> 칸반</button><button type="button" aria-pressed={view === "list"} onClick={() => setView("list")}><List size={15} /> 목록</button></div></div>
    <section className="facility-page-panel facility-work-toolbar"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="작업번호, 자산, 담당자 검색" /></label><span>{filtered.length}건</span>{initialAssetId && <Link href="/work-orders">자산 필터 해제</Link>}</section>
    {view === "kanban" ? <div className="facility-kanban">{kanbanGroups.map((group) => <section key={group.label}><header><strong>{group.label}</strong><span>{filtered.filter((order) => group.statuses.includes(order.status)).length}</span></header><div>{filtered.filter((order) => group.statuses.includes(order.status)).map((order) => <WorkOrderCard key={order.id} order={order} onSelect={() => { setSelectedId(order.id); setMessage(""); }} />)}{filtered.every((order) => !group.statuses.includes(order.status)) && <p>해당 작업이 없습니다.</p>}</div></section>)}</div> : <section className="facility-page-panel"><div className="facility-dark-table-wrap"><table><thead><tr><th>작업번호</th><th>작업명</th><th>자산</th><th>심각도</th><th>담당</th><th>기한</th><th>상태</th></tr></thead><tbody>{filtered.map((order) => <tr key={order.id} tabIndex={0} onClick={() => setSelectedId(order.id)}><td>{order.id}</td><td>{order.title}</td><td>{mockDashboardData.assets.find((item) => item.id === order.assetId)?.name}</td><td>{order.severity}</td><td>{order.assignee || order.vendor}</td><td>{order.targetDate}</td><td><span className={`facility-table-status is-${order.status === "완료" || order.status === "종료" ? "success" : order.severity === "긴급" ? "danger" : "warning"}`}>{order.status}</span></td></tr>)}</tbody></table></div></section>}
    {selected && <WorkOrderDrawer key={selected.id} order={selected} readOnly={readOnly} message={message} setMessage={setMessage} onClose={() => setSelectedId(null)} onSave={(input) => { updateExecution(selected.id, input); setMessage("실행 정보가 저장되었습니다."); }} onAddEvidence={(filename) => { addEvidence(selected.id, { phase: "작업 후", filename }); setMessage("작업 후 증빙이 추가되었습니다."); }} onTransition={(next) => { try { transition(selected.id, next, next === "진행" && selected.status === "검수요청" ? "검수 반려 후 보완 작업" : "작업 단계 진행"); setMessage(`${next} 상태로 변경했습니다.`); } catch (error) { setMessage(error instanceof Error ? error.message : "상태를 변경하지 못했습니다."); } }} />}
  </div>;
}

function WorkOrderCard({ order, onSelect }: { order: WorkOrder; onSelect(): void }) {
  const asset = mockDashboardData.assets.find((item) => item.id === order.assetId);
  return <button type="button" className="facility-work-card" onClick={onSelect}><span className={`severity is-${order.severity}`}>{order.severity}</span><small>{order.id}</small><strong>{order.title}</strong><span>{asset?.assetCode} · {asset?.locationLabel}</span><footer><span>{order.assignee || order.vendor || "미배정"}</span><time>{order.targetDate}</time></footer></button>;
}

function WorkOrderDrawer({ order, readOnly, message, setMessage, onClose, onSave, onAddEvidence, onTransition }: { order: WorkOrder; readOnly: boolean; message: string; setMessage(value: string): void; onClose(): void; onSave(input: { assignee?: string; vendor?: string; actualCostWon?: number; completionSummary?: string }): void; onAddEvidence(filename: string): void; onTransition(next: WorkOrderStatus): void }) {
  const asset = mockDashboardData.assets.find((item) => item.id === order.assetId)!;
  const [assignee, setAssignee] = useState(order.assignee);
  const [vendor, setVendor] = useState(order.vendor ?? "");
  const [actualCost, setActualCost] = useState(String(order.actualCostWon));
  const [summary, setSummary] = useState(order.completionSummary ?? "");
  const [filename, setFilename] = useState("");
  return <aside className="facility-work-drawer" aria-label={`${order.title} 상세`}><header><div><small>{order.id} · {order.sourceType} {order.sourceId}</small><h2>{order.title}</h2></div><button type="button" onClick={onClose} aria-label="작업지시 상세 닫기"><X /></button></header><div className="facility-work-drawer-body">
    <section className="facility-work-summary"><span className={`facility-table-status is-${order.severity === "긴급" ? "danger" : "warning"}`}>{order.severity}</span><strong>{order.status}</strong><p>{order.description}</p><Link href={`/assets/${encodeURIComponent(asset.id)}`}>{asset.assetCode} · {asset.name}</Link></section>
    <section><h3>담당과 비용</h3>{readOnly && <p className="facility-readonly-notice">현재 역할은 승인된 운영 근거만 조회할 수 있으며 작업 내용을 변경할 수 없습니다.</p>}<div className="facility-form-grid compact"><label><span>담당자</span><select disabled={readOnly} value={assignee} onChange={(event) => setAssignee(event.target.value)}><option value="">미배정</option><option>김시설</option><option>박기술</option></select></label><label><span>협력업체</span><input disabled={readOnly} value={vendor} onChange={(event) => setVendor(event.target.value)} /></label><label><span>실제 비용(원)</span><input disabled={readOnly} inputMode="numeric" value={actualCost} onChange={(event) => setActualCost(event.target.value.replace(/\D/g, ""))} /></label><label><span>예상 비용</span><input value={formatWon(order.estimatedCostWon)} disabled /></label><label className="wide"><span>완료 요약</span><textarea disabled={readOnly} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="수리 내용과 시운전 결과를 입력해 주세요." /></label></div>{!readOnly && <button className="facility-button" type="button" onClick={() => onSave({ assignee, vendor, actualCostWon: Number(actualCost || 0), completionSummary: summary })}>실행 정보 저장</button>}</section>
    <section><h3>작업 증빙</h3><ul className="facility-evidence-list">{order.evidence.map((item) => <li key={item.id}><FileImage size={16} /><span><strong>{item.phase}</strong>{item.filename}</span><time>{item.recordedAt}</time></li>)}</ul>{!readOnly && <div className="facility-inline-form"><input value={filename} onChange={(event) => setFilename(event.target.value)} placeholder="예: P-02_작업후.jpg" /><button type="button" disabled={!filename.trim()} onClick={() => { onAddEvidence(filename.trim()); setFilename(""); }}>작업 후 증빙 추가</button></div>}</section>
    {message && <p className={`facility-action-message ${message.includes("없") || message.includes("필요") || message.includes("못") ? "is-error" : ""}`} role="status">{message.includes("없") || message.includes("필요") ? <AlertTriangle size={15} /> : <CheckCircle2 size={15} />}{message}</p>}
    <section><h3>다음 단계</h3><div className="facility-transition-actions">{!readOnly && workOrderTransitions[order.status].map((next) => <button key={next} className={`facility-button ${next === "완료" || next === "종료" ? "primary" : ""}`} type="button" onClick={() => { setMessage(""); onTransition(next); }}>{order.status === "검수요청" && next === "진행" ? "반려·보완 요청" : next}</button>)}{(readOnly || workOrderTransitions[order.status].length === 0) && <span><ClipboardList size={16} /> {readOnly ? "읽기 전용 역할입니다." : "최종 상태입니다."}</span>}</div></section>
  </div></aside>;
}
