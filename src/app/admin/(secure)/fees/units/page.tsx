import { redirect } from "next/navigation";
import { formatReferenceMonth, formatWon } from "@/lib/format/ko";
import { FEE_REFERENCE_MONTH, listFeeUnits, recordFeeAudit } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const context = await readFeeAccessContext();
  if (!context) redirect("/admin/login");
  assertFeeAccess(context, context.tenantId, "VIEW");
  const query = await searchParams;
  const result = listFeeUnits(context.tenantId, {
    referenceMonth: query.month ?? FEE_REFERENCE_MONTH,
    building: query.building,
    collectionState: query.state,
    overdueAging: query.aging,
    minimumAmount: query.min ? Number(query.min) : undefined,
    maximumAmount: query.max ? Number(query.max) : undefined,
    adjusted: query.adjusted === "yes" ? true : undefined,
    validationState: query.validation,
    query: query.query,
    page: query.page ? Number(query.page) : 1,
    sort: query.sort as "unit" | "assessment" | "outstanding" | undefined,
  });
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "세대별 관리비 조회", objectTypeKo: "세대별 관리비", objectId: query.month ?? FEE_REFERENCE_MONTH, actorKo: "단지 관리자", reasonKo: null, metadata: { 조회행수: result.rows.length, 전체결과: result.total, 동: query.building ?? "전체", 수납상태: query.state ?? "전체" } });
  const pageQuery = Object.fromEntries(Object.entries(query).filter((entry): entry is [string, string] => Boolean(entry[1])));
  return <>
    <h1>세대별 현황</h1><p className="muted">이름과 연락처 없이 동·호수 기준의 최소 정보만 표시합니다.</p>
    <form className="filter-grid">
      <label htmlFor="unit-month">기준월</label><input id="unit-month" className="field" type="month" name="month" defaultValue={query.month ?? FEE_REFERENCE_MONTH}/>
      <label htmlFor="unit-building">동</label><select id="unit-building" className="field" name="building" defaultValue={query.building ?? ""}><option value="">전체</option>{[101,102,103,104,105].map((value)=><option key={value}>{value}</option>)}</select>
      <label htmlFor="unit-state">수납 상태</label><select id="unit-state" className="field" name="state" defaultValue={query.state ?? ""}><option value="">전체</option>{["완납","부분납","미납","면제","과납"].map((value)=><option key={value}>{value}</option>)}</select>
      <label htmlFor="unit-aging">미납 기간</label><select id="unit-aging" className="field" name="aging" defaultValue={query.aging ?? ""}><option value="">전체</option>{["1개월","2개월","3개월 이상"].map((value)=><option key={value}>{value}</option>)}</select>
      <label htmlFor="unit-min">최소 금액</label><input id="unit-min" className="field" name="min" inputMode="numeric" defaultValue={query.min ?? ""}/>
      <label htmlFor="unit-max">최대 금액</label><input id="unit-max" className="field" name="max" inputMode="numeric" defaultValue={query.max ?? ""}/>
      <label htmlFor="unit-adjusted">조정 여부</label><select id="unit-adjusted" className="field" name="adjusted" defaultValue={query.adjusted ?? ""}><option value="">전체</option><option value="yes">조정 있음</option></select>
      <label htmlFor="unit-validation">검증 상태</label><select id="unit-validation" className="field" name="validation" defaultValue={query.validation ?? ""}><option value="">전체</option><option>정상</option><option>확인 필요</option></select>
      <label htmlFor="unit-query">동·호수 검색</label><input id="unit-query" className="field" name="query" placeholder="예: 101-1203" defaultValue={query.query ?? ""}/>
      <label htmlFor="unit-sort">정렬</label><select id="unit-sort" className="field" name="sort" defaultValue={query.sort ?? "unit"}><option value="unit">동·호수</option><option value="assessment">부과액 높은 순</option><option value="outstanding">미납액 높은 순</option></select>
      <button className="btn">조회</button>
    </form>
    <p><strong>{formatReferenceMonth(query.month ?? FEE_REFERENCE_MONTH)}</strong> · 총 {result.total.toLocaleString("ko-KR")}세대</p>
    <div className="table-wrap"><table><thead><tr><th>동·호수</th><th>최종 부과액</th><th>수납액</th><th>미납액</th><th>과납액</th><th>수납 상태</th><th>미납 기간</th><th>최근 수납일</th><th>조정</th><th>검증</th></tr></thead><tbody>{result.rows.map((item)=><tr key={item.id}><td>{item.building}동 {item.unit}호</td><td>{formatWon(item.finalAssessment)}</td><td>{formatWon(item.collected)}</td><td>{formatWon(item.outstanding)}</td><td>{formatWon(item.overpayment)}</td><td><span className="pill">{item.collectionState}</span></td><td>{item.overdueAging}</td><td>{item.lastPaymentDate ?? "수납 없음"}</td><td>{item.adjusted ? "있음" : "없음"}</td><td>{item.validationStateKo}</td></tr>)}</tbody></table></div>
    <nav className="pagination" aria-label="세대별 현황 페이지"><span>{result.page} / {result.totalPages}쪽</span>{result.page > 1 && <a className="btn" href={`?${new URLSearchParams({...pageQuery,page:String(result.page-1)})}`}>이전</a>}{result.page < result.totalPages && <a className="btn" href={`?${new URLSearchParams({...pageQuery,page:String(result.page+1)})}`}>다음</a>}</nav>
  </>;
}
