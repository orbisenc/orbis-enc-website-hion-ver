"use client";

import { ArrowLeft, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export interface OperationsColumn { key: string; label: string }
export type OperationsRow = Record<string, string> & { id: string };

export function OperationsPage({ title, subtitle, columns, rows, primaryAction, primaryActionHref }: { title: string; subtitle: string; columns: OperationsColumn[]; rows: OperationsRow[]; primaryAction?: string; primaryActionHref?: string }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("전체");
  const [selected, setSelected] = useState<OperationsRow | null>(null);
  const statuses = ["전체", ...Array.from(new Set(rows.map((row) => row.status).filter(Boolean)))];
  const filtered = useMemo(() => rows.filter((row) => {
    const matchesQuery = !query || Object.values(row).some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (status === "전체" || row.status === status);
  }), [query, rows, status]);

  return <div className="facility-page">
    <div className="facility-page-heading"><div><Link href="/dashboard" className="facility-back-link"><ArrowLeft size={15} /> 대시보드</Link><h1>{title}</h1><p>{subtitle}</p></div>{primaryAction && (primaryActionHref ? <Link className="facility-button primary" href={primaryActionHref}>{primaryAction}</Link> : <button type="button" className="facility-button primary" onClick={() => window.alert(`${primaryAction} 기능은 데모 화면에서 정상적으로 요청되었습니다.`)}>{primaryAction}</button>)}</div>
    <section className="facility-page-panel">
      <div className="facility-page-filters"><label><span>검색</span><div><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="명칭, 위치, 담당자 검색" /></div></label><label><span>상태</span><select value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></label><p>{filtered.length}건 표시</p></div>
      <div className="facility-dark-table-wrap"><table><thead><tr>{columns.map((column) => <th key={column.key}>{column.label}</th>)}<th><span className="sr-only">상세</span></th></tr></thead><tbody>{filtered.map((row) => <tr key={row.id} onClick={() => setSelected(row)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelected(row); }}>{columns.map((column) => <td key={column.key}>{column.key === "status" ? <span className={`facility-table-status is-${statusTone(row[column.key])}`}>{row[column.key]}</span> : row[column.key]}</td>)}<td><ChevronRight size={15} /></td></tr>)}</tbody></table>{filtered.length === 0 && <div className="facility-empty-state"><Search size={24} /><strong>조건에 맞는 항목이 없습니다.</strong><span>필터를 변경해 다시 확인해 주세요.</span></div>}</div>
    </section>
    {selected && <aside className="facility-inline-detail"><div><small>선택 항목</small><h2>{selected.name ?? selected.title ?? title}</h2></div><dl>{columns.map((column) => <div key={column.key}><dt>{column.label}</dt><dd>{selected[column.key]}</dd></div>)}</dl><button type="button" className="facility-icon-button" onClick={() => setSelected(null)} aria-label="선택 항목 닫기">×</button></aside>}
  </div>;
}

function statusTone(status: string) {
  if (["완료", "정상", "승인"].includes(status)) return "success";
  if (["긴급", "지연", "초과"].includes(status)) return "danger";
  if (["주의", "검토 중", "진행"].includes(status)) return "warning";
  return "info";
}
