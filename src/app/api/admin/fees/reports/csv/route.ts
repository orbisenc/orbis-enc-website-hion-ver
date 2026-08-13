import { formatReferenceMonth, formatSeoulDateTime } from "@/lib/format/ko";
import { feeAdjustmentStateKo, feeImportStatusKo, feeImportTypeKo, feePeriodStateKo, feeReportTypeKo } from "@/lib/fees/presentation";
import { FEE_DEMO_COMPLEX_NAME, FEE_REFERENCE_MONTH, getApprovedAgendaCostImpact, getFeeDashboard, listFeeAdjustments, listFeeImports, listFeeUnits, recordFeeAudit } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

function safeCell(value: string | number | bigint) {
  const text = String(value);
  const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${protectedText.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return new Response("로그인이 필요합니다.", { status: 401 });
  try { assertFeeAccess(context, context.tenantId, "REPORT"); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "권한이 없습니다." }, { status: 403 }); }
  const url = new URL(request.url);
  const referenceMonth = url.searchParams.get("referenceMonth") ?? FEE_REFERENCE_MONTH;
  const type = url.searchParams.get("type") ?? "summary";
  const dashboard = getFeeDashboard(context.tenantId, referenceMonth);
  const common = [
    ["단지명", FEE_DEMO_COMPLEX_NAME], ["기준월", formatReferenceMonth(referenceMonth)], ["데이터 상태", feePeriodStateKo(dashboard.period.state)],
    ["생성 시각", formatSeoulDateTime(new Date())], ["생성자", "개발용 회계 관리자"], ["적용 필터", `보고서 유형=${feeReportTypeKo(type)}`],
    ["원본 기준월 식별자", dashboard.period.id], ["안내", dashboard.period.state === "CLOSED" ? "마감 스냅샷 기준 확정 자료입니다." : "확정 전 변경될 수 있는 잠정 자료입니다."],
  ];
  let rows: Array<Array<string | number | bigint>> = [];
  if (type === "categories") rows = [["관리비 항목", "금액"], ...dashboard.categories.map((item) => [item.nameKo, item.amount])];
  else if (type === "buildings") rows = [["동", "부과 세대", "총 부과액", "세대당 평균"], ...dashboard.buildingBreakdown.map((item) => [`${item.building}동`, item.unitCount, item.total, item.average])];
  else if (type === "units") rows = [["동", "호", "최종 부과액", "수납액", "미납액", "과납액", "수납 상태"], ...listFeeUnits(context.tenantId, { referenceMonth, pageSize: 100 }).rows.map((item) => [item.building, item.unit, item.finalAssessment, item.collected, item.outstanding, item.overpayment, item.collectionState])];
  else if (type === "aging") rows = [["미납 기간", "미납액"], ...dashboard.aging.map((item) => [item.label, item.amount])];
  else if (type === "adjustments") rows = [["세대", "조정액", "사유", "상태", "등록 시각"], ...listFeeAdjustments(context.tenantId, dashboard.period.id).map((item) => [item.unitKey, item.amount, item.reasonKo, feeAdjustmentStateKo(item.state), item.createdAt])];
  else if (type === "imports") rows = [["파일명", "유형", "행 수", "상태", "등록 시각"], ...listFeeImports(context.tenantId).map((item) => [item.filename, feeImportTypeKo(item.type), item.rowCount, feeImportStatusKo(item.status), item.uploadedAt])];
  else if (type === "agenda-cost") { const impact=getApprovedAgendaCostImpact(context.tenantId); rows=impact?[["안건 비용 영향 항목","내용"],["총 예상 사업비",impact.estimatedProjectCost],["비용 마련 방식",impact.fundingSourceKo],["세대당 예상 부담액",impact.estimatedAmountPerUnit],["예상 부과 시작월",impact.expectedBillingStartMonth],["분할 부과 횟수",impact.installmentCount],["주민 안내",impact.residentExplanationKo]]:[["안내","승인된 안건 비용 영향이 없습니다."]]; }
  else rows = [["항목", "금액 또는 비율"], ["총 부과액", dashboard.period.finalAssessment], ["총 수납액", dashboard.period.netCollected], ["총 미납액", dashboard.period.outstanding], ["수납률", dashboard.period.collectionRateBasisPoints === null ? "산정 불가" : `${dashboard.period.collectionRateBasisPoints / 100}%`]];
  const csv = [...common.map((row) => row.map(safeCell).join(",")), [], ...rows.map((row) => row.map(safeCell).join(","))].join("\r\n");
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 CSV 보고서 생성", objectTypeKo: "관리비 보고서", objectId: `${referenceMonth}-${type}`, actorKo: "회계 담당자", reasonKo: url.searchParams.get("reason") ?? null, metadata: { 보고서유형: type, 행수: rows.length, 기준월: referenceMonth } });
  return new Response(`\uFEFF${csv}`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`HION-${referenceMonth}-관리비-${feeReportTypeKo(type)}.csv`)}` } });
}
