"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { formatWon, statusLabel } from "@/lib/facility";
import type { Asset } from "@/types/facility";
import { ArrowLeft, Box, CalendarCheck, ClipboardPlus, Cuboid, History, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const tabs = ["기본정보", "이력", "점검", "작업지시", "문서", "연관자산", "비용"] as const;

export function AssetDetailPage({ asset }: { asset: Asset }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("기본정보");
  const maintenance = mockDashboardData.maintenance.filter((item) => item.assetId === asset.id);
  const inspections = mockDashboardData.inspections.filter((item) => item.assetId === asset.id);
  return <div className="facility-page"><div className="facility-page-heading"><div><Link className="facility-back-link" href="/assets"><ArrowLeft size={15} /> 시설자산</Link><span className="facility-eyebrow">{asset.assetCode} · {asset.importance} 중요도</span><h1>{asset.name}</h1><p>{asset.id}</p></div><div className="facility-asset-score"><span className={`facility-table-status is-${asset.status === "normal" ? "success" : asset.status === "urgent" ? "danger" : "warning"}`}>{statusLabel[asset.status]}</span><strong>건전도 {asset.healthScore}</strong><strong>위험 {asset.riskScore}</strong></div></div>
    <nav className="facility-tabs" aria-label="자산 상세 구분">{tabs.map((item) => <button key={item} type="button" aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</button>)}</nav>
    {tab === "기본정보" && <div className="facility-detail-grid"><section className="facility-page-panel facility-asset-visual"><div className="facility-object-visual"><Box size={70} /><span>{asset.modelObjectName}</span></div><h2>3D 객체 연결</h2><p>디지털 트윈 객체와 고유 자산 ID로 연결되어 있습니다.</p><Link className="facility-button" href={`/asset-map?assetId=${encodeURIComponent(asset.id)}`}><Cuboid size={15} /> 3D 위치 열기</Link></section><section className="facility-page-panel"><h2>자산 기본 정보</h2><dl className="facility-page-definitions">{[["자산코드",asset.assetCode],["제조사·모델",`${asset.manufacturer} · ${asset.modelName}`],["제조번호",asset.serialNumber],["설치 위치",asset.locationLabel],["설치일",asset.installedAt],["보증 종료일",asset.warrantyEndAt],["점검 주기",asset.inspectionCycle],["권장 교체일",asset.expectedReplacementAt],["다음 점검일",asset.nextInspectionAt],["최근 점검",asset.lastInspectionResult]].map(([key,value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl></section></div>}
    {tab === "이력" && <section className="facility-page-panel"><h2>수명주기 이력</h2><ol className="facility-timeline"><li><time>{asset.installedAt}</time><strong>설치·자산 ID 발급</strong><span>{asset.manufacturer} {asset.modelName}</span></li>{maintenance.map((item) => <li key={item.id}><time>{item.completedAt}</time><strong>{item.title}</strong><span>{item.description}</span></li>)}</ol></section>}
    {tab === "점검" && <section className="facility-page-panel"><h2>연결 점검</h2>{inspections.length ? <ul className="facility-record-list">{inspections.map((item) => <li key={item.id}><strong>{item.type}</strong><span>{item.scheduledAt} · {item.assignee}</span><em>{item.status}</em></li>)}</ul> : <div className="facility-empty-state"><CalendarCheck /><strong>등록된 점검이 없습니다.</strong><Link className="facility-button primary" href={`/inspections?action=new&assetId=${encodeURIComponent(asset.id)}`}>점검 등록</Link></div>}</section>}
    {tab === "작업지시" && <section className="facility-page-panel"><h2>연결 작업지시</h2><p>점검 이상·민원·알림에서 생성된 작업지시가 원본 연결을 유지합니다.</p><Link className="facility-button primary" href={`/work-orders?assetId=${encodeURIComponent(asset.id)}`}>작업지시 보기</Link></section>}
    {tab === "문서" && <section className="facility-page-panel"><h2>관련 문서</h2><ul className="facility-record-list"><li><strong>{asset.assetCode} 정기점검표</strong><span>v3 · 2026.07.21</span><em>관리사무소</em></li><li><strong>제조사 유지관리 지침</strong><span>{asset.manufacturer} · 설치 시 등록</span><em>내부</em></li></ul></section>}
    {tab === "연관자산" && <section className="facility-page-panel"><h2>연관 자산</h2><ul className="facility-record-list">{mockDashboardData.assets.filter((item) => item.id !== asset.id && (item.buildingId === asset.buildingId || item.category === asset.category)).slice(0,5).map((item) => <li key={item.id}><Link href={`/assets/${encodeURIComponent(item.id)}`}><strong>{item.name}</strong></Link><span>{item.locationLabel}</span><em>{statusLabel[item.status]}</em></li>)}</ul></section>}
    {tab === "비용" && <section className="facility-page-panel"><h2>비용 현황</h2><dl className="facility-page-definitions"><div><dt>누적 유지보수비</dt><dd>{formatWon(asset.cumulativeMaintenanceCost)}</dd></div><div><dt>계획 교체비</dt><dd>{formatWon(asset.plannedReplacementCost)}</dd></div><div><dt>교체비 대비 유지비</dt><dd>{Math.round(asset.cumulativeMaintenanceCost / asset.plannedReplacementCost * 100)}%</dd></div></dl></section>}
    <section className="facility-action-grid"><Link href={`/inspections?action=new&assetId=${encodeURIComponent(asset.id)}`}><ClipboardPlus />점검 등록</Link><Link href={`/inspections?assetId=${encodeURIComponent(asset.id)}`}><CalendarCheck />점검 일정</Link><Link href={`/work-orders?assetId=${encodeURIComponent(asset.id)}`}><History />작업지시</Link><Link href={`/replacement?assetId=${encodeURIComponent(asset.id)}`}><RefreshCw />교체 검토</Link></section>
  </div>;
}
