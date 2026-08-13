"use client";

import { useApartmentOperationsStore } from "@/store/apartmentOperationsStore";
import { FileClock, Search } from "lucide-react";
import { useEffect, useState } from "react";

const seedAudit = [
  { id: "audit-seed-1", actor: "박기술", action: "점검 결과 제출", entityType: "Inspection", entityId: "inspection-abnormal-001", previousValue: "진행", newValue: "제출", reason: "배수펌프 진동 기준 초과", occurredAt: "2026.07.21 10:20" },
  { id: "audit-seed-2", actor: "김관리", action: "작업지시 승인", entityType: "WorkOrder", entityId: "WO-2026-0721-001", previousValue: "승인대기", newValue: "배정", reason: "긴급 배수설비 조치", occurredAt: "2026.07.21 10:35" },
  { id: "audit-seed-3", actor: "김관리", action: "문서 공개범위 변경", entityType: "Document", entityId: "document-3", previousValue: "관리사무소", newValue: "입주자대표회의", reason: "7월 정기회의 검토자료", occurredAt: "2026.07.20 16:00" },
];

export function AuditLogPage() {
  const live = useApartmentOperationsStore((state) => state.auditLog);
  const [ready, setReady] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => { Promise.resolve(useApartmentOperationsStore.persist.rehydrate()).finally(() => setReady(true)); }, []);
  const rows = [...live, ...seedAudit].filter((item) => !query || Object.values(item).some((value) => value.includes(query)));
  if (!ready) return <div className="facility-loading-state">감사 이력을 불러오는 중입니다.</div>;
  return <div className="facility-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">덮어쓰지 않는 변경 증거</span><h1>감사 기록</h1><p>핵심 상태 변경의 행위자, 시각, 이전값, 새값과 사유를 보존합니다.</p></div><span className="facility-demo-badge"><FileClock size={15} /> append-only 데모 원장</span></div><section className="facility-page-panel"><div className="facility-work-toolbar"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="행위자, 대상, 사유 검색" /></label><span>{rows.length}건</span></div><div className="facility-dark-table-wrap"><table><thead><tr><th>시각</th><th>행위자</th><th>행위</th><th>대상</th><th>이전값</th><th>새값</th><th>사유</th></tr></thead><tbody>{rows.map((item) => <tr key={item.id}><td>{item.occurredAt}</td><td>{item.actor}</td><td>{item.action}</td><td>{item.entityType} · {item.entityId}</td><td>{item.previousValue || "-"}</td><td>{item.newValue}</td><td>{item.reason}</td></tr>)}</tbody></table></div></section></div>;
}
