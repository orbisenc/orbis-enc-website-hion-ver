"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { calculateBudgetExecutionRate } from "@/lib/facility";
import { ArrowLeft, Download, WalletCards } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const categories = [
  { name: "기계설비 유지보수", planned: 420, spent: 282 },
  { name: "전기·통신 설비", planned: 260, spent: 190 },
  { name: "소방·안전 설비", planned: 220, spent: 143 },
  { name: "급배수·환경", planned: 180, spent: 84 },
  { name: "예비비", planned: 120, spent: 46 },
];

export function BudgetPage() {
  const [year, setYear] = useState("2026");
  const budget = mockDashboardData.budget;
  const rate = calculateBudgetExecutionRate(budget);
  return <div className="facility-page"><div className="facility-page-heading"><div><Link className="facility-back-link" href="/dashboard"><ArrowLeft size={15} /> 대시보드</Link><h1>연간 유지관리 예산</h1><p>시설 운영 예산의 계획, 집행, 잔액을 항목별로 확인합니다.</p></div><div className="facility-heading-actions"><select aria-label="예산 연도" value={year} onChange={(event) => setYear(event.target.value)}><option>2026</option><option>2025</option></select><button type="button" className="facility-button" onClick={() => window.alert("예산 보고서 다운로드를 준비했습니다.")}><Download size={15} /> 보고서 내보내기</button></div></div>
    <section className="facility-budget-summary"><article><span>연간 계획</span><strong>1,200</strong><small>백만원</small></article><article><span>누적 집행</span><strong>745</strong><small>백만원</small></article><article><span>집행 가능 잔액</span><strong>455</strong><small>백만원</small></article><article className="accent"><WalletCards /><span>계획 대비 집행률</span><strong>{rate}%</strong></article></section>
    <section className="facility-page-panel"><div className="facility-section-heading"><div><h2>{year}년 항목별 집행 현황</h2><p>계획 금액에는 집행액과 잔액만 포함됩니다.</p></div></div><div className="facility-budget-bars">{categories.map((item) => { const itemRate = Math.round(item.spent / item.planned * 100); return <article key={item.name}><div><strong>{item.name}</strong><span>{item.spent} / {item.planned} 백만원</span></div><div className="facility-progress"><i style={{ width: `${itemRate}%` }} /></div><small>{itemRate}% 집행 · 잔액 {item.planned - item.spent}백만원</small></article>; })}</div></section>
  </div>;
}
