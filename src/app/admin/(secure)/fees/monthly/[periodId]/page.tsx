import { notFound, redirect } from "next/navigation";
import { FeePeriodControls } from "@/components/admin/fee-period-controls";
import { feeAdjustmentStateKo, feeImportStatusKo, feeImportTypeKo, feePeriodStateKo } from "@/lib/fees/presentation";
import { formatPercentFromBasisPoints, formatReferenceMonth, formatSeoulDateTime, formatWon } from "@/lib/format/ko";
import { getFeeDashboard, getFeePeriod, listFeeAdjustments, listFeeAudits, listFeeImports, listFeeUnits } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export default async function Page({ params }: { params: Promise<{ periodId: string }> }) {
  const context=await readFeeAccessContext(); if(!context) redirect("/admin/login"); assertFeeAccess(context,context.tenantId,"VIEW");
  const {periodId}=await params; let period; try{period=getFeePeriod(context.tenantId,periodId)}catch{notFound()}
  const dashboard=getFeeDashboard(context.tenantId,period.referenceMonth);
  const units=listFeeUnits(context.tenantId,{referenceMonth:period.referenceMonth,pageSize:20});
  const imports=listFeeImports(context.tenantId).filter((item)=>item.periodId===periodId);
  const adjustments=listFeeAdjustments(context.tenantId,periodId);
  const audits=listFeeAudits(context.tenantId).filter((item)=>item.objectId===periodId||adjustments.some((adjustment)=>adjustment.id===item.objectId));
  const totals=[["부과 세대",`${period.assessedUnitCount.toLocaleString("ko-KR")}세대`],["원 부과액",formatWon(period.originalAssessment)],["면제·조정액",formatWon(period.adjustmentAmount)],["최종 부과액",formatWon(period.finalAssessment)],["순수납액",formatWon(period.netCollected)],["미납액",formatWon(period.outstanding)],["환급액",formatWon(period.refundAmount)],["과납액",formatWon(period.overpayment)],["수납률",formatPercentFromBasisPoints(period.collectionRateBasisPoints)],["전월 대비",formatPercentFromBasisPoints(dashboard.monthOverMonthBasisPoints)],["전년 동월 대비",formatPercentFromBasisPoints(dashboard.yearOverYearBasisPoints)]];
  return <>
    <p className="pill">{feePeriodStateKo(period.state)}</p><h1>{formatReferenceMonth(period.referenceMonth)} 관리비 상세</h1>
    <section className="stats">{totals.map(([label,value])=><div className="stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</section>
    <section className="dashboard-grid">
      <article className="card"><h2>항목별 부과</h2><div className="table-wrap"><table><thead><tr><th>항목</th><th>금액</th></tr></thead><tbody>{dashboard.categories.map((item)=><tr key={item.id}><td>{item.nameKo}</td><td>{formatWon(item.amount)}</td></tr>)}</tbody></table></div></article>
      <article className="card"><h2>동별 부과</h2><div className="table-wrap"><table><thead><tr><th>동</th><th>세대 수</th><th>총액</th><th>평균</th></tr></thead><tbody>{dashboard.buildingBreakdown.map((item)=><tr key={item.building}><td>{item.building}동</td><td>{item.unitCount}</td><td>{formatWon(item.total)}</td><td>{formatWon(item.average)}</td></tr>)}</tbody></table></div></article>
    </section>
    <h2>세대 상태 구성 내역</h2><div className="table-wrap"><table><thead><tr><th>동·호수</th><th>최종 부과액</th><th>수납액</th><th>미납액</th><th>상태</th></tr></thead><tbody>{units.rows.map((item)=><tr key={item.id}><td>{item.building}동 {item.unit}호</td><td>{formatWon(item.finalAssessment)}</td><td>{formatWon(item.collected)}</td><td>{formatWon(item.outstanding)}</td><td>{item.collectionState}</td></tr>)}</tbody></table></div>
    <section className="card" style={{marginTop:20}}><h2>가져오기 이력</h2>{imports.length===0?<p className="empty-state">이 기준월의 새 CSV 등록 이력이 없습니다.</p>:<div className="table-wrap"><table><thead><tr><th>파일</th><th>유형</th><th>상태</th><th>행</th><th>경고</th><th>등록 시각</th></tr></thead><tbody>{imports.map((item)=><tr key={item.id}><td>{item.filename}</td><td>{feeImportTypeKo(item.type)}</td><td>{feeImportStatusKo(item.status)}</td><td>{item.rowCount}</td><td>{item.warningCount}</td><td>{formatSeoulDateTime(item.uploadedAt)}</td></tr>)}</tbody></table></div>}</section>
    <section className="card" style={{marginTop:20}}><h2>조정 이력</h2>{adjustments.length===0?<p className="empty-state">등록된 조정이 없습니다.</p>:<ul>{adjustments.map((item)=><li key={item.id}>{item.unitKey} · {formatWon(item.amount)} · {item.reasonKo} · {feeAdjustmentStateKo(item.state)}</li>)}</ul>}</section>
    <section className="card" style={{marginTop:20}}><h2>마감·감사 이력</h2>{audits.length===0?<p className="empty-state">이번 시연 세션에서 발생한 이력이 없습니다.</p>:<ul>{audits.map((item)=><li key={item.id}>{formatSeoulDateTime(item.occurredAt)} · {item.actionKo} · {item.actorKo}</li>)}</ul>}<p className="muted">마감 스냅샷 해시: {period.closingSnapshotHash??"마감 전"}</p></section>
    <FeePeriodControls periodId={period.id} initialState={period.state}/>
  </>;
}
