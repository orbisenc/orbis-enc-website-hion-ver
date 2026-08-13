import { redirect } from "next/navigation";
import { formatPercentFromBasisPoints, formatReferenceMonth, formatWon } from "@/lib/format/ko";
import { FEE_REFERENCE_MONTH, getFeeDashboard, listFeePeriods } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export const dynamic = "force-dynamic";

export default async function FeeDashboardPage({ searchParams }: { searchParams: Promise<{ month?: string }> }) {
  const context = await readFeeAccessContext(); if (!context) redirect("/admin/login"); assertFeeAccess(context, context.tenantId, "VIEW");
  const requested = (await searchParams).month ?? FEE_REFERENCE_MONTH;
  const periods = listFeePeriods(context.tenantId);
  const month = periods.some((period) => period.referenceMonth === requested) ? requested : FEE_REFERENCE_MONTH;
  const data = getFeeDashboard(context.tenantId, month);
  const kpis = [
    ["기준월", formatReferenceMonth(data.period.referenceMonth), "관리비 부과와 수납을 집계하는 연월"],
    ["총 부과액", formatWon(data.period.finalAssessment), "원 부과액에 승인된 조정액을 더한 금액"],
    ["총 수납액", formatWon(data.period.netCollected), "수납액에서 환급액을 차감한 금액"],
    ["총 미납액", formatWon(data.period.outstanding), "최종 부과액에서 순수납액을 차감한 0원 이상의 금액"],
    ["수납률", formatPercentFromBasisPoints(data.period.collectionRateBasisPoints), "최종 부과액 중 실제 적용된 수납액 비율"],
    ["세대당 평균 관리비", formatWon(data.averagePerUnit), "최종 부과액을 부과 대상 세대 수로 나눈 원 단위 평균"],
    ["전월 대비 증감률", formatPercentFromBasisPoints(data.monthOverMonthBasisPoints), "전월 최종 부과액과 비교한 증감률"],
    ["3개월 이상 장기 미납액", formatWon(data.longTermOverdue), "최초 미납 월부터 3개월 이상 경과한 미납액"],
  ];
  const maximumTrend = data.trends.reduce((maximum, item) => item.finalAssessment > maximum ? item.finalAssessment : maximum, 1n);
  const maximumCategory = data.categories.reduce((maximum, item) => item.amount > maximum ? item.amount : maximum, 1n);
  return <>
    <div className="page-heading"><div><p className="pill">관리비 관리</p><h1>관리비 대시보드</h1><p className="muted">부과·수납·미납 현황을 동일한 서버 원장 계산으로 확인합니다.</p></div><form><label className="field-label" htmlFor="fee-month">기준월</label><select className="field" id="fee-month" name="month" defaultValue={month}>{periods.map((period) => <option key={period.id} value={period.referenceMonth}>{formatReferenceMonth(period.referenceMonth)}</option>)}</select><button className="btn" style={{ marginTop: 8 }}>조회</button></form></div>
    <section className="stats" aria-label="관리비 핵심 지표">{kpis.map(([label, value, description]) => <div className="stat" key={label} title={description}><span>{label} <abbr title={description} aria-label={`${label} 계산 설명`}>ⓘ</abbr></span><strong>{value}</strong></div>)}</section>
    <section className="dashboard-grid">
      <article className="card"><h2>최근 12개월 부과 추이</h2><p className="muted">막대 아래 표에서 월별 정확한 금액을 확인할 수 있습니다.</p><div className="bar-chart" aria-label="최근 12개월 부과액 막대 차트">{data.trends.map((item) => <div className="bar-column" key={item.id} title={`${formatReferenceMonth(item.referenceMonth)} ${formatWon(item.finalAssessment)}`}><span className="bar-fill" style={{ height: `${Number(item.finalAssessment * 100n / maximumTrend)}%` }} /><small>{item.referenceMonth.slice(5)}월</small></div>)}</div><div className="table-wrap"><table><thead><tr><th>기준월</th><th>부과액</th><th>수납액</th></tr></thead><tbody>{data.trends.slice(-6).reverse().map((item) => <tr key={item.id}><td>{formatReferenceMonth(item.referenceMonth)}</td><td>{formatWon(item.finalAssessment)}</td><td>{formatWon(item.netCollected)}</td></tr>)}</tbody></table></div></article>
      <article className="card"><h2>관리비 항목 구성</h2><div className="horizontal-bars" aria-label="관리비 항목별 구성">{data.categories.map((item) => <div key={item.id}><div><span>{item.nameKo}</span><strong>{formatWon(item.amount)}</strong></div><span className="bar-track"><span style={{ width: `${Number(item.amount * 100n / maximumCategory)}%` }} /></span></div>)}</div></article>
      <article className="card"><h2>동별 세대당 평균</h2><div className="table-wrap"><table><thead><tr><th>동</th><th>부과 세대</th><th>평균 관리비</th></tr></thead><tbody>{data.buildingBreakdown.map((item) => <tr key={item.building}><td>{item.building}동</td><td>{item.unitCount.toLocaleString("ko-KR")}세대</td><td>{formatWon(item.average)}</td></tr>)}</tbody></table></div></article>
      <article className="card"><h2>미납 기간별 현황</h2><div className="table-wrap"><table><thead><tr><th>미납 기간</th><th>미납액</th></tr></thead><tbody>{data.aging.map((item) => <tr key={item.label}><td>{item.label}</td><td>{formatWon(item.amount)}</td></tr>)}</tbody></table></div><h3>예산 대비</h3><p>계획 {formatWon(data.budget.planned)} · 실제 {formatWon(data.budget.actual)}</p></article>
    </section>
    <section className="card" style={{ marginTop: 22 }}><h2>전월·전년 비교</h2><div className="stats"><div className="stat"><span>전월 대비 부과액 증감</span><strong>{formatPercentFromBasisPoints(data.monthOverMonthBasisPoints)}</strong></div><div className="stat"><span>전년 동월 대비 부과액 증감</span><strong>{formatPercentFromBasisPoints(data.yearOverYearBasisPoints)}</strong></div></div><p className="muted">0원 분모는 임의의 0%로 표시하지 않고 산정 불가로 구분합니다.</p></section>
    <section className="card" style={{ marginTop: 22 }}><h2>관리자 확인 필요 항목</h2><p className="muted">투명한 규칙 기반 안내이며 부정 또는 회계 오류를 단정하지 않습니다.</p>{data.exceptions.length ? <ul>{data.exceptions.map((item) => <li key={item}>{item}</li>)}</ul> : <p>현재 설정된 기준을 넘는 확인 항목이 없습니다.</p>}</section>
  </>;
}
