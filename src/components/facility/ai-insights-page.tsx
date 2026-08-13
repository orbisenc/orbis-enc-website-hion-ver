"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { useApartmentOperationsStore } from "@/store/apartmentOperationsStore";
import type { AIInsight } from "@/types/facility";
import { AlertTriangle, BrainCircuit, CheckCircle2, Clock3, FileSearch, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function AIInsightsPage() {
  const insights = useApartmentOperationsStore((state) => state.insights);
  const setStatus = useApartmentOperationsStore((state) => state.setInsightStatus);
  const [ready, setReady] = useState(false);
  useEffect(() => { Promise.resolve(useApartmentOperationsStore.persist.rehydrate()).finally(() => setReady(true)); }, []);
  if (!ready) return <div className="facility-loading-state">인사이트 근거를 불러오는 중입니다.</div>;
  return <div className="facility-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">외부 AI 키가 필요 없는 규칙 기반 분석</span><h1>AI 인사이트</h1><p>모든 제안은 탐지 규칙·근거·영향과 버전을 공개하며 자동 승인하지 않습니다.</p></div><span className="facility-demo-badge"><ShieldCheck size={15} /> 의사결정 보조 전용</span></div>
    <div className="facility-insight-summary"><article><BrainCircuit /><span><strong>{insights.length}</strong>개 인사이트</span></article><article><AlertTriangle /><span><strong>{insights.filter((item) => item.severity === "경고").length}</strong>개 경고</span></article><article><Clock3 /><span><strong>2026.07.21 15:30</strong> 생성 기준</span></article></div>
    <div className="facility-insight-grid">{insights.map((insight) => <InsightCard key={insight.id} insight={insight} onStatus={(status) => setStatus(insight.id, status)} />)}</div>
  </div>;
}

function InsightCard({ insight, onStatus }: { insight: AIInsight; onStatus(status: AIInsight["status"]): void }) {
  const assets = insight.assetIds.map((id) => mockDashboardData.assets.find((asset) => asset.id === id)).filter(Boolean);
  return <article className={`facility-insight-card is-${insight.severity}`}><header><span>{insight.severity}</span><em>신뢰도 {insight.confidence}</em><strong>{insight.title}</strong><small>{insight.generatedAt} · {insight.ruleVersion}</small></header><section><h3><FileSearch size={15} /> 탐지 근거</h3><ul>{insight.evidence.map((evidence) => <li key={evidence}>{evidence}</li>)}</ul><p><strong>규칙</strong>{insight.rule}</p></section><section className="facility-insight-impact"><div><strong>예상 영향</strong><span>{insight.expectedImpact}</span></div><div><strong>권장 조치</strong><span>{insight.recommendedAction}</span></div></section><section className="facility-insight-assets"><strong>영향 자산 {assets.length}개</strong>{assets.slice(0,4).map((asset) => asset && <Link key={asset.id} href={`/assets/${encodeURIComponent(asset.id)}`}>{asset.assetCode} {asset.name}</Link>)}</section><footer><span><CheckCircle2 size={14} /> 현재 상태: {insight.status}</span><button type="button" onClick={() => onStatus("확인")}>확인</button><Link href={`/inspections?action=new&assetId=${encodeURIComponent(insight.assetIds[0] ?? "")}`}>점검 생성</Link><Link href={`/work-orders?assetId=${encodeURIComponent(insight.assetIds[0] ?? "")}`}>작업지시</Link><button type="button" onClick={() => onStatus("보류")}>보류</button><button type="button" onClick={() => onStatus("조치 완료")}>조치 완료</button></footer></article>;
}
