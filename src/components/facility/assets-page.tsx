"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { statusLabel } from "@/lib/facility";
import type { AssetCategory } from "@/types/facility";
import { ArrowLeft, ArrowUpDown, Download, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const categoryLabels: Record<AssetCategory, string> = { mechanical: "기계·급배수", electrical: "전기·발전", fire: "소방·안전", plumbing: "배관·방수", security: "주차·보안" };
export interface AssetFilters { q?: string; type?: string; category?: string; floor?: string; status?: string; linkStatus?: string }

export function AssetsPage({ initialFilters }: { initialFilters: AssetFilters }) {
  const router = useRouter();
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState<"name" | "floor" | "status" | "riskScore">("riskScore");
  const [page, setPage] = useState(1);
  const update = (key: keyof AssetFilters, value: string) => {
    const next = { ...filters, [key]: value || undefined }; setFilters(next); setPage(1);
    const params = new URLSearchParams(); Object.entries(next).forEach(([filterKey, filterValue]) => { if (filterValue) params.set(filterKey, filterValue); });
    router.replace(`/assets${params.size ? `?${params}` : ""}`, { scroll: false });
  };
  const assets = useMemo(() => mockDashboardData.assets.filter((asset) => {
    const text = `${asset.name} ${asset.assetCode} ${asset.serialNumber} ${asset.locationLabel}`.toLowerCase();
    return (!filters.q || text.includes(filters.q.toLowerCase())) && (!filters.type || asset.subtype === filters.type) && (!filters.category || asset.category === filters.category) && (!filters.floor || asset.floor === filters.floor) && (!filters.status || asset.status === filters.status) && (!filters.linkStatus || (filters.linkStatus === "unlinked" ? !asset.linkedTo3D : asset.linkedTo3D));
  }).sort((a, b) => sort === "riskScore" ? b.riskScore - a.riskScore : String(a[sort]).localeCompare(String(b[sort]), "ko")), [filters, sort]);
  const pageSize = 12;
  const pages = Math.max(1, Math.ceil(assets.length / pageSize));
  const visible = assets.slice((page - 1) * pageSize, page * pageSize);
  const exportCsv = () => {
    const lines = [["자산코드","자산명","분류","위치","상태","건전도","위험점수","다음점검일"], ...assets.map((asset) => [asset.assetCode,asset.name,categoryLabels[asset.category],asset.locationLabel,statusLabel[asset.status],String(asset.healthScore),String(asset.riskScore),asset.nextInspectionAt])];
    const blob = new Blob(["\uFEFF" + lines.map((row) => row.map((value) => `"${value.replaceAll('"','""')}"`).join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "HION_시설자산.csv"; anchor.click(); URL.revokeObjectURL(url);
  };
  return <div className="facility-page"><div className="facility-page-heading"><div><Link href="/dashboard" className="facility-back-link"><ArrowLeft size={15} /> 대시보드</Link><h1>시설자산</h1><p>공용시설의 고유 ID, 위치, 건전도, 위험도와 3D 연결을 통합 조회합니다.</p></div><div className="facility-heading-actions"><span className="facility-page-count">전체 {mockDashboardData.assets.length}개 · 검색 {assets.length}개</span><button className="facility-button" type="button" onClick={exportCsv}><Download size={15} /> CSV 내보내기</button></div></div>
    <section className="facility-page-panel"><div className="facility-asset-filters">
      <label className="wide"><span>자산명·코드·위치</span><div><Search size={15} /><input value={filters.q ?? ""} onChange={(event) => update("q", event.target.value)} placeholder="예: 배수펌프 P-02" /></div></label>
      <Filter label="분류" value={filters.category ?? ""} onChange={(value) => update("category", value)} options={Object.entries(categoryLabels)} />
      <Filter label="층" value={filters.floor ?? ""} onChange={(value) => update("floor", value)} options={["옥상","전 층","지상 1층","지하 1층","지하 2층"].map((value) => [value,value])} />
      <Filter label="상태" value={filters.status ?? ""} onChange={(value) => update("status", value)} options={Object.entries(statusLabel)} />
      <Filter label="3D 연계" value={filters.linkStatus ?? ""} onChange={(value) => update("linkStatus", value)} options={[["linked","연계"],["unlinked","미연계"]]} />
    </div>{filters.type && <div className="facility-active-filter">설비 유형: <strong>{filters.type}</strong><button type="button" onClick={() => update("type", "")}>필터 해제</button></div>}
    <div className="facility-dark-table-wrap"><table><thead><tr><th>자산코드</th><Sortable label="자산명" value="name" current={sort} onSort={setSort} /><th>분류</th><Sortable label="위치" value="floor" current={sort} onSort={setSort} /><Sortable label="상태" value="status" current={sort} onSort={setSort} /><th>건전도</th><Sortable label="위험" value="riskScore" current={sort} onSort={setSort} /><th>다음 점검</th></tr></thead><tbody>{visible.map((asset) => <tr key={asset.id} onClick={() => router.push(`/assets/${encodeURIComponent(asset.id)}`)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/assets/${encodeURIComponent(asset.id)}`); }}><td><strong>{asset.assetCode}</strong><small>{asset.serialNumber}</small></td><td><Link href={`/assets/${encodeURIComponent(asset.id)}`}>{asset.name}</Link><small>{asset.subtype}</small></td><td>{categoryLabels[asset.category]}</td><td>{asset.locationLabel}</td><td><span className={`facility-table-status is-${asset.status === "normal" ? "success" : asset.status === "urgent" ? "danger" : "warning"}`}>{statusLabel[asset.status]}</span></td><td>{asset.healthScore}점</td><td><strong className={asset.riskScore >= 70 ? "facility-risk-danger" : ""}>{asset.riskScore}점</strong></td><td>{asset.nextInspectionAt}</td></tr>)}</tbody></table>{assets.length === 0 && <div className="facility-empty-state"><Search size={24} /><strong>조건에 맞는 자산이 없습니다.</strong><span>필터를 해제하거나 다른 조건을 선택해 주세요.</span></div>}</div>
    {assets.length > 0 && <div className="facility-pagination"><button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>이전</button><span>{page} / {pages}페이지</span><button type="button" disabled={page === pages} onClick={() => setPage((value) => value + 1)}>다음</button></div>}</section>
  </div>;
}

function Filter({ label, value, onChange, options }: { label: string; value: string; onChange(value: string): void; options: string[][] }) { return <label><span>{label}</span><select value={value} onChange={(event) => onChange(event.target.value)}><option value="">전체</option>{options.map(([optionValue, optionLabel]) => <option key={optionValue} value={optionValue}>{optionLabel}</option>)}</select></label>; }
function Sortable({ label, value, current, onSort }: { label: string; value: "name" | "floor" | "status" | "riskScore"; current: string; onSort(value: "name" | "floor" | "status" | "riskScore"): void }) { return <th><button type="button" className={current === value ? "is-active" : ""} onClick={() => onSort(value)}>{label} <ArrowUpDown size={12} /></button></th>; }
