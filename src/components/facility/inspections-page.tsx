"use client";

import { InspectionDetailDialog } from "@/components/facility/inspection-detail-dialog";
import { InspectionFormDialog } from "@/components/facility/inspection-form-dialog";
import { mockDashboardData } from "@/data/mockDashboard";
import type { InspectionDraft } from "@/lib/validation/inspection";
import { useHydrateInspectionStore, useInspectionStore } from "@/store/inspectionStore";
import type { InspectionKind, InspectionStatus } from "@/types/facility";
import { ArrowDownAZ, ArrowLeft, CalendarCheck2, CalendarPlus, CheckCircle2, ChevronRight, ClipboardList, Clock3, Search, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface InspectionsPageProps {
  initialAction?: string;
  initialAssetId?: string;
  initialInspectionId?: string;
  initialPeriod?: string;
}

type FormMode = "create" | "edit" | "duplicate" | null;
type SortKey = "date-asc" | "date-desc" | "name";

export function InspectionsPage({ initialAction, initialAssetId, initialInspectionId, initialPeriod }: InspectionsPageProps) {
  const hydrated = useHydrateInspectionStore();
  const inspections = useInspectionStore((state) => state.inspections);
  const createInspection = useInspectionStore((state) => state.createInspection);
  const updateInspection = useInspectionStore((state) => state.updateInspection);
  const transitionInspection = useInspectionStore((state) => state.transitionInspection);
  const deleteInspection = useInspectionStore((state) => state.deleteInspection);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<InspectionStatus | "전체">("전체");
  const [kind, setKind] = useState<InspectionKind | "전체">("전체");
  const [assetFilter, setAssetFilter] = useState(initialAssetId ?? "전체");
  const [sort, setSort] = useState<SortKey>("date-asc");
  const [formMode, setFormMode] = useState<FormMode>(initialAction === "new" ? "create" : initialAction === "edit" ? "edit" : initialAction === "duplicate" ? "duplicate" : null);
  const [selectedId, setSelectedId] = useState<string | null>(initialInspectionId ?? null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3200);
    return () => window.clearTimeout(timer);
  }, [message]);

  const assetsById = useMemo(() => new Map(mockDashboardData.assets.map((asset) => [asset.id, asset])), []);
  const selected = inspections.find((item) => item.id === selectedId);
  const formInitial = formMode === "edit" ? selected : formMode === "duplicate" && selected ? { ...selected, id: `${selected.id}-copy`, status: "예정" as const, result: undefined, completedAt: undefined } : undefined;
  const requestedInspectionMissing = hydrated && Boolean(formMode) && formMode !== "create" && !selected;
  const counts = useMemo(() => ({
    all: inspections.length,
    upcoming: inspections.filter((item) => item.status === "예정").length,
    active: inspections.filter((item) => item.status === "진행").length,
    completed: inspections.filter((item) => item.status === "완료").length,
    delayed: inspections.filter((item) => item.status === "지연").length,
  }), [inspections]);

  const filtered = useMemo(() => {
    const currentMonth = new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit" }).format(new Date()).replace(/\. /g, ".").replace(/\.$/, "");
    return inspections.filter((item) => {
      const asset = assetsById.get(item.assetId);
      const text = `${item.type} ${item.assignee} ${asset?.name ?? ""} ${asset?.locationLabel ?? ""}`.toLowerCase();
      return (!query || text.includes(query.toLowerCase()))
        && (status === "전체" || item.status === status)
        && (kind === "전체" || item.kind === kind)
        && (assetFilter === "전체" || item.assetId === assetFilter)
        && (initialPeriod !== "month" || item.scheduledAt.startsWith(currentMonth));
    }).sort((a, b) => sort === "date-desc" ? b.scheduledAt.localeCompare(a.scheduledAt) : sort === "name" ? a.type.localeCompare(b.type, "ko") : a.scheduledAt.localeCompare(b.scheduledAt));
  }, [assetFilter, assetsById, initialPeriod, inspections, kind, query, sort, status]);

  const save = (draft: InspectionDraft) => {
    if (formMode === "edit" && selected) {
      updateInspection(selected.id, draft);
      setMessage("점검 일정이 수정되었습니다.");
    } else {
      const id = createInspection(draft);
      setSelectedId(id);
      setMessage(formMode === "duplicate" ? "점검 일정이 복제되었습니다." : "새 점검이 등록되었습니다.");
    }
    setFormMode(null);
  };

  const remove = () => {
    if (!selected) return;
    deleteInspection(selected.id);
    setSelectedId(null);
    setMessage("점검 일정이 삭제되었습니다.");
  };

  const openCreate = () => {
    setSelectedId(null);
    setFormMode("create");
  };

  return <div className="facility-page facility-inspections-page">
    <div className="facility-page-heading"><div><Link href="/dashboard" className="facility-back-link"><ArrowLeft size={15} /> 대시보드</Link><h1>점검 관리</h1><p>정기·수시 점검 일정을 등록하고 담당 배정부터 완료 결과까지 관리합니다.</p></div><button type="button" className="facility-button primary facility-primary-action" onClick={openCreate}><CalendarPlus size={17} /> 새 점검 등록</button></div>
    {message && <div className="facility-toast" role="status"><CheckCircle2 size={16} /> {message}</div>}
    {requestedInspectionMissing && <div className="facility-toast is-error" role="alert"><TriangleAlert size={16} /> 요청한 점검 일정을 찾지 못했습니다.</div>}

    <section className="facility-inspection-summary" aria-label="점검 현황 요약">
      <button type="button" className={status === "전체" ? "is-active" : ""} onClick={() => setStatus("전체")}><ClipboardList /><span>전체 점검</span><strong>{counts.all}</strong><small>등록된 일정</small></button>
      <button type="button" className={status === "예정" ? "is-active" : ""} onClick={() => setStatus("예정")}><CalendarCheck2 /><span>예정</span><strong>{counts.upcoming}</strong><small>대기 일정</small></button>
      <button type="button" className={status === "진행" ? "is-active" : ""} onClick={() => setStatus("진행")}><Clock3 /><span>진행 중</span><strong>{counts.active}</strong><small>현장 수행</small></button>
      <button type="button" className={status === "완료" ? "is-active" : ""} onClick={() => setStatus("완료")}><CheckCircle2 /><span>완료</span><strong>{counts.completed}</strong><small>결과 등록</small></button>
      <button type="button" className={status === "지연" ? "is-active" : ""} onClick={() => setStatus("지연")}><TriangleAlert /><span>지연</span><strong>{counts.delayed}</strong><small>조치 필요</small></button>
    </section>

    <section className="facility-page-panel facility-inspection-list-panel">
      <div className="facility-inspection-toolbar">
        <label className="wide"><span>점검 검색</span><div><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="점검명, 객체, 위치, 담당자 검색" /></div></label>
        <label><span>상태</span><select value={status} onChange={(event) => setStatus(event.target.value as InspectionStatus | "전체")}><option>전체</option><option>예정</option><option>진행</option><option>완료</option><option>지연</option></select></label>
        <label><span>구분</span><select value={kind} onChange={(event) => setKind(event.target.value as InspectionKind | "전체")}><option>전체</option><option>정기</option><option>수시</option></select></label>
        <label><span>대상 객체</span><select value={assetFilter} onChange={(event) => setAssetFilter(event.target.value)}><option value="전체">전체 객체</option>{mockDashboardData.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
        <label><span>정렬</span><div className="facility-sort-select"><ArrowDownAZ size={15} /><select value={sort} onChange={(event) => setSort(event.target.value as SortKey)}><option value="date-asc">예정일 빠른 순</option><option value="date-desc">예정일 늦은 순</option><option value="name">점검명 순</option></select></div></label>
      </div>
      <div className="facility-list-result"><p><strong>{filtered.length}</strong>건 표시{initialPeriod === "month" && <span> · 이번 달 일정</span>}</p>{(query || status !== "전체" || kind !== "전체" || assetFilter !== "전체") && <button type="button" onClick={() => { setQuery(""); setStatus("전체"); setKind("전체"); setAssetFilter("전체"); }}>필터 초기화</button>}</div>
      <div className="facility-dark-table-wrap facility-inspection-table"><table><thead><tr><th>예정일</th><th>구분</th><th>점검명</th><th>대상 객체·위치</th><th>담당자</th><th>결과</th><th>상태</th><th><span className="sr-only">상세</span></th></tr></thead><tbody>{filtered.map((item) => {
        const asset = assetsById.get(item.assetId);
        return <tr key={item.id} onClick={() => setSelectedId(item.id)} tabIndex={0} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedId(item.id); }}>
          <td data-label="예정일"><time>{item.scheduledAt}</time></td><td data-label="구분"><span className="facility-kind-badge">{item.kind}</span></td><td data-label="점검명"><strong>{item.type}</strong><small>{item.checklist.length}개 점검 항목</small></td><td data-label="대상 객체"><strong>{asset?.name ?? "공용 설비"}</strong><small>{asset?.locationLabel ?? "시설 공용 구역"}</small></td><td data-label="담당자">{item.assignee}</td><td data-label="결과">{item.result ?? "점검 전"}</td><td data-label="상태"><span className={`facility-table-status is-${item.status === "완료" ? "success" : item.status === "지연" ? "danger" : item.status === "진행" ? "warning" : "info"}`}>{item.status}</span></td><td><button type="button" className="facility-detail-button" onClick={(event) => { event.stopPropagation(); setSelectedId(item.id); }} aria-label={`${item.type} 상세 보기`}>상세 <ChevronRight size={14} /></button></td>
        </tr>;
      })}</tbody></table>{filtered.length === 0 && <div className="facility-empty-state"><Search size={26} /><strong>조건에 맞는 점검 일정이 없습니다.</strong><span>필터를 초기화하거나 새 점검을 등록해 주세요.</span><button type="button" className="facility-button primary" onClick={openCreate}>새 점검 등록</button></div>}</div>
    </section>

    {selected && !formMode && <InspectionDetailDialog inspection={selected} asset={assetsById.get(selected.assetId)} onClose={() => setSelectedId(null)} onEdit={() => setFormMode("edit")} onDuplicate={() => setFormMode("duplicate")} onDelete={remove} onTransition={(nextStatus, result) => { transitionInspection(selected.id, nextStatus, result); setMessage(nextStatus === "완료" ? "점검 결과가 완료 처리되었습니다." : "점검이 진행 상태로 변경되었습니다."); }} />}
    {formMode && (formMode === "create" || selected) && <InspectionFormDialog assets={mockDashboardData.assets} initial={formInitial} mode={formMode} presetAssetId={initialAssetId} onClose={() => setFormMode(null)} onSubmit={save} />}
  </div>;
}
