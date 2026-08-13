"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { formatWon } from "@/lib/facility";
import { calculateReplacementRisk, replacementRecommendation } from "@/server/services/facility-risk-service";
import type { Asset } from "@/types/facility";
import { CalendarClock, ChevronRight, CircleDollarSign, HeartPulse, ShieldAlert, Wrench } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const labels = { condition: "건전도 저하 25%", repeatedFailures: "반복 고장 20%", criticality: "자산 중요도 20%", maintenanceCost: "유지비 추세 15%", residentImpact: "입주민 영향 10%", overdue: "점검·교체 지연 10%" } as const;

export function ReplacementDecisionPage({ initialAssetId }: { initialAssetId?: string }) {
  const candidates = mockDashboardData.assets.filter((asset) => asset.riskScore >= 58).sort((a, b) => b.riskScore - a.riskScore);
  const [selectedId, setSelectedId] = useState(initialAssetId && candidates.some((asset) => asset.id === initialAssetId) ? initialAssetId : candidates[0]?.id ?? "");
  const selected = candidates.find((asset) => asset.id === selectedId) ?? candidates[0];
  const breakdown = selected ? calculateReplacementRisk(selected) : null;
  if (!selected || !breakdown) return <div className="facility-empty-state"><Wrench /><strong>교체 검토 대상이 없습니다.</strong></div>;
  const recommendation = replacementRecommendation(breakdown.total);
  return <div className="facility-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">설명 가능한 교체 의사결정</span><h1>교체·장기수선 검토</h1><p>건전도, 반복 고장, 중요도, 비용, 입주민 영향과 기한을 가중치로 비교합니다.</p></div><Link className="facility-button" href="/long-term-plan">장기수선계획 열기 <ChevronRight size={15} /></Link></div>
    <div className="facility-replacement-layout"><aside className="facility-candidate-list"><header><strong>검토 대상</strong><span>{candidates.length}건</span></header>{candidates.map((asset) => <button key={asset.id} type="button" aria-pressed={selected.id === asset.id} onClick={() => setSelectedId(asset.id)}><span><strong>{asset.assetCode}</strong>{asset.name}</span><em>{asset.riskScore}점</em><small>건전도 {asset.healthScore} · 고장 {asset.repeatedFailureCount}회</small></button>)}</aside>
      <div className="facility-replacement-detail"><section className="facility-page-panel facility-risk-hero"><div><span className="facility-eyebrow">{selected.assetCode} · {selected.locationLabel}</span><h2>{selected.name}</h2><p>권장 교체일 {selected.expectedReplacementAt} · 누적 유지비 {formatWon(selected.cumulativeMaintenanceCost)}</p></div><div className="facility-risk-score"><strong>{breakdown.total}</strong><span>/ 100점</span><em>권고: {recommendation}</em></div></section>
      <section className="facility-page-panel"><div className="facility-section-heading"><div><h2>위험점수 산출 근거</h2><p>각 항목은 0~100 정규화 후 명시된 가중치를 적용합니다.</p></div></div><div className="facility-risk-breakdown">{(Object.keys(labels) as Array<keyof typeof labels>).map((key) => { const value = breakdown[key]; const max = key === "condition" ? 25 : key === "repeatedFailures" || key === "criticality" ? 20 : key === "maintenanceCost" ? 15 : 10; return <article key={key}><div><strong>{labels[key]}</strong><span>{value.toFixed(1)} / {max}점</span></div><div><i style={{ width: `${value / max * 100}%` }} /></div></article>; })}</div></section>
      <section className="facility-scenario-grid">{scenarioData(selected).map((scenario) => <article key={scenario.name} className={scenario.name === recommendation ? "is-recommended" : ""}>{scenario.name === recommendation && <span className="facility-recommend-label">현재 권고</span>}<h3>{scenario.name}</h3><dl><div><dt>초기 비용</dt><dd>{formatWon(scenario.initial)}</dd></div><div><dt>1년 예상비용</dt><dd>{formatWon(scenario.oneYear)}</dd></div><div><dt>5년 예상비용</dt><dd>{formatWon(scenario.fiveYear)}</dd></div><div><dt>운영 위험</dt><dd>{scenario.risk}</dd></div><div><dt>예상 중단</dt><dd>{scenario.downtime}</dd></div></dl><p>{scenario.reason}</p></article>)}</section>
      <section className="facility-decision-actions"><div><HeartPulse /><span><strong>건전도 {selected.healthScore}점</strong><small>반복 고장 {selected.repeatedFailureCount}회</small></span></div><div><CircleDollarSign /><span><strong>{formatWon(selected.plannedReplacementCost)}</strong><small>계획 교체비</small></span></div><div><ShieldAlert /><span><strong>입주민 영향 {selected.residentImpact}/10</strong><small>{selected.importance} 중요도</small></span></div><div><CalendarClock /><span><strong>{selected.expectedReplacementAt}</strong><small>권장 교체일</small></span></div><Link href={`/long-term-plan?assetId=${encodeURIComponent(selected.id)}`}>장기수선 반영</Link><Link href={`/meetings?assetId=${encodeURIComponent(selected.id)}`}>회의 안건 생성</Link><Link href={`/projects?assetId=${encodeURIComponent(selected.id)}`}>공사 제안 생성</Link></section>
      </div>
    </div>
  </div>;
}

function scenarioData(asset: Asset) {
  const base = asset.plannedReplacementCost;
  return [
    { name: "유지", initial: Math.round(base * .04), oneYear: Math.round(base * .12), fiveYear: Math.round(base * .72), risk: "높음", downtime: "고장 시 2~5일", reason: "초기 비용은 낮지만 반복 고장과 긴급출동 비용이 누적됩니다." },
    { name: "부분보수", initial: Math.round(base * .32), oneYear: Math.round(base * .38), fiveYear: Math.round(base * .66), risk: "보통", downtime: "1~2일", reason: "핵심 소모부품을 교체해 단기 위험을 낮추지만 잔존 노후부 위험은 남습니다." },
    { name: "전면교체", initial: base, oneYear: Math.round(base * 1.02), fiveYear: Math.round(base * 1.12), risk: "낮음", downtime: "계획 정지 2일", reason: "초기 비용은 높지만 예측 가능한 계획 정지와 장기 유지비 절감이 가능합니다." },
  ];
}
