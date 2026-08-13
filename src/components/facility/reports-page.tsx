"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { Download, Printer } from "lucide-react";
import { useState } from "react";

export function ReportsPage() {
  const [report, setReport] = useState("월간 운영보고서");
  const exportCsv = () => {
    const rows = [["자산코드","자산명","상태","건전도","위험점수"], ...mockDashboardData.assets.map((asset) => [asset.assetCode,asset.name,asset.status,String(asset.healthScore),String(asset.riskScore)])];
    const blob = new Blob(["\uFEFF" + rows.map((row) => row.join(",")).join("\r\n")], { type: "text/csv;charset=utf-8" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${report}_2026-07.csv`; link.click(); URL.revokeObjectURL(url);
  };
  return <div className="facility-page facility-report-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">기준일·필터가 포함된 근거 보고서</span><h1>보고서·문서</h1><p>운영 현황을 화면에서 검토하고 인쇄 또는 CSV로 내보냅니다.</p></div><div className="facility-heading-actions"><button className="facility-button" type="button" onClick={() => window.print()}><Printer size={15} /> 인쇄·PDF</button><button className="facility-button primary" type="button" onClick={exportCsv}><Download size={15} /> CSV 내보내기</button></div></div>
    <section className="facility-page-panel facility-report-controls"><label>보고서 종류<select value={report} onChange={(event) => setReport(event.target.value)}>{["월간 운영보고서","점검 현황","고장·작업 현황","민원 현황","예산 집행","교체 검토","장기수선 계획"].map((item) => <option key={item}>{item}</option>)}</select></label><label>기준 기간<input type="month" defaultValue="2026-07" /></label><span>기준일 2026년 7월 21일 · HION 스마트파크 · 전체 동</span></section>
    <article className="facility-report-preview"><header><small>HION Apartment OS</small><h2>{report}</h2><p>HION 스마트파크 · 2026년 7월 · 작성 기준 2026.07.21 15:30</p></header><section className="facility-report-metrics"><div><span>등록 자산</span><strong>{mockDashboardData.assets.length}개</strong></div><div><span>긴급 이슈</span><strong>3건</strong></div><div><span>점검 완료율</span><strong>91%</strong></div><div><span>예산 집행률</span><strong>62%</strong></div></section><h3>주요 운영 요약</h3><p>지하주차장 배수펌프 P-02의 진동 기준 초과 건은 긴급 작업지시로 전환되어 베어링 상태를 점검 중입니다. 정문 주차차단기 통신 중단은 협력업체에 배정했으며, 105동 옥상 방수구역은 장기수선 반영 검토가 필요합니다.</p><h3>필터 요약</h3><p>전체 8개 동 · 공용시설 전체 분류 · 정상/주의/경고/정지 상태 포함</p></article>
  </div>;
}
