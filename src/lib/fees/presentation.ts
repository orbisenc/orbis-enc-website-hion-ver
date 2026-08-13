import type { FeePeriodState } from "@/server/demo/fee-store";

export function feePeriodStateKo(state: FeePeriodState) {
  return { DRAFT: "작성 중", IMPORTED: "등록 완료", CONFIRMED: "확정", CLOSED: "마감", REOPENED: "재개" }[state];
}

export function feeImportTypeKo(type: "ASSESSMENT" | "COLLECTION") {
  return type === "ASSESSMENT" ? "관리비 부과" : "수납·환급";
}

export function feeImportStatusKo(status: "UPLOADED" | "VALIDATED" | "CONFIRMED" | "REJECTED") {
  return { UPLOADED: "업로드", VALIDATED: "검증 완료", CONFIRMED: "등록 확정", REJECTED: "오류로 중단" }[status];
}

export function feeAdjustmentStateKo(state: "PENDING" | "APPROVED" | "REJECTED") {
  return { PENDING: "승인 대기", APPROVED: "승인", REJECTED: "반려" }[state];
}

export function feeReportTypeKo(type: string) {
  return { summary: "월별-요약", categories: "항목별-내역", buildings: "동별-요약", units: "세대-상태", aging: "미납-기간", adjustments: "조정-이력", imports: "등록-대사-이력", "agenda-cost": "안건-비용-영향" }[type] ?? "관리비-보고서";
}
