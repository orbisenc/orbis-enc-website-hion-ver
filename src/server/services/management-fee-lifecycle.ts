import { sha256 } from "@/lib/security/hash";
import { addFeeAdjustment, approveFeeAdjustment, findFeeImportBatch, getFeePeriod, recordFeeAudit, updateFeePeriodState, type FeePeriodView } from "@/server/demo/fee-store";
import { assertFeeAccess, type FeeAccessContext } from "./management-fee-auth";

function actorKo(context: FeeAccessContext) {
  if (context.roles.includes("APPROVER")) return "승인 관리자";
  if (context.roles.includes("ACCOUNTING_MANAGER")) return "회계 담당자";
  return "단지 관리자";
}

export function confirmImportBatch(context: FeeAccessContext, batchId: string, idempotencyKey: string, warningReasonKo?: string) {
  assertFeeAccess(context, context.tenantId, "IMPORT");
  const batch = findFeeImportBatch(context.tenantId, batchId);
  if (batch.status === "CONFIRMED") return batch;
  const period = getFeePeriod(context.tenantId, batch.periodId);
  if (period.state === "CLOSED") throw new Error("마감된 기준월에는 데이터를 등록할 수 없습니다.");
  if (batch.blockingErrorCount > 0) throw new Error("차단 오류가 있는 등록 건은 확정할 수 없습니다.");
  if (batch.warningCount > 0 && (!warningReasonKo || warningReasonKo.trim().length < 5)) throw new Error("경고를 확인한 한국어 사유를 5자 이상 입력해 주세요.");
  if (batch.idempotencyKey && batch.idempotencyKey !== idempotencyKey) return batch;
  batch.idempotencyKey = idempotencyKey;
  batch.status = "CONFIRMED";
  batch.confirmedBy = actorKo(context);
  batch.confirmedAt = new Date().toISOString();
  updateFeePeriodState(context.tenantId, batch.periodId, { state: "IMPORTED" });
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 CSV 등록 확정", objectTypeKo: "관리비 등록", objectId: batch.id, actorKo: actorKo(context), reasonKo: warningReasonKo ?? null, metadata: { 유형: batch.type === "ASSESSMENT" ? "부과" : "수납·환급", 행수: batch.validRowCount } });
  return batch;
}

export function confirmFeePeriod(context: FeeAccessContext, periodId: string) {
  assertFeeAccess(context, context.tenantId, "CONFIRM");
  const period = getFeePeriod(context.tenantId, periodId);
  if (period.state === "CONFIRMED" || period.state === "CLOSED") return period;
  if (period.warningCount > 0) throw new Error("확인이 필요한 대사 경고를 먼저 처리해 주세요.");
  const now = new Date().toISOString();
  const updated = updateFeePeriodState(context.tenantId, periodId, { state: "CONFIRMED", confirmedBy: actorKo(context), confirmedAt: now });
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 기준월 확정", objectTypeKo: "관리비 기준월", objectId: periodId, actorKo: actorKo(context), reasonKo: null, metadata: { 기준월: period.referenceMonth } });
  return updated;
}

export function closeFeePeriod(context: FeeAccessContext, periodId: string, reasonKo: string) {
  assertFeeAccess(context, context.tenantId, "CLOSE");
  if (reasonKo.trim().length < 5) throw new Error("마감 사유를 한국어로 5자 이상 입력해 주세요.");
  const period = getFeePeriod(context.tenantId, periodId);
  if (period.state === "CLOSED") return period;
  if (period.state !== "CONFIRMED" && period.state !== "REOPENED") throw new Error("확정되었거나 재개된 기준월만 마감할 수 있습니다.");
  const snapshot = {
    periodId,
    referenceMonth: period.referenceMonth,
    originalAssessment: period.originalAssessment.toString(),
    adjustmentAmount: period.adjustmentAmount.toString(),
    finalAssessment: period.finalAssessment.toString(),
    netCollected: period.netCollected.toString(),
    outstanding: period.outstanding.toString(),
    overpayment: period.overpayment.toString(),
  };
  const now = new Date().toISOString();
  const updated = updateFeePeriodState(context.tenantId, periodId, { state: "CLOSED", closedBy: actorKo(context), closedAt: now, closingSnapshot: snapshot, closingSnapshotHash: sha256(snapshot) });
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 기준월 마감", objectTypeKo: "관리비 기준월", objectId: periodId, actorKo: actorKo(context), reasonKo, metadata: { 기준월: period.referenceMonth, 스냅샷해시: updated.closingSnapshotHash ?? "" } });
  return updated;
}

export function reopenFeePeriod(context: FeeAccessContext, periodId: string, reasonKo: string) {
  assertFeeAccess(context, context.tenantId, "REOPEN");
  if (reasonKo.trim().length < 5) throw new Error("재개 사유를 한국어로 5자 이상 입력해 주세요.");
  const period = getFeePeriod(context.tenantId, periodId);
  if (period.state === "REOPENED") return period;
  if (period.state !== "CLOSED") throw new Error("마감된 기준월만 재개할 수 있습니다.");
  const updated = updateFeePeriodState(context.tenantId, periodId, { state: "REOPENED", closedBy: period.closedBy, closedAt: period.closedAt });
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 기준월 재개", objectTypeKo: "관리비 기준월", objectId: periodId, actorKo: actorKo(context), reasonKo, metadata: { 기준월: period.referenceMonth, 이전스냅샷해시: period.closingSnapshotHash ?? "" } });
  return updated;
}

export function createFeeAdjustment(context: FeeAccessContext, input: { periodId: string; unitKey: string; amount: bigint; reasonKo: string; idempotencyKey: string }) {
  assertFeeAccess(context, context.tenantId, "ADJUST");
  const period = getFeePeriod(context.tenantId, input.periodId);
  if (period.state === "CLOSED") throw new Error("마감된 기준월은 직접 조정할 수 없습니다. 승인된 재개 절차를 진행해 주세요.");
  if (input.amount === 0n) throw new Error("조정 금액은 0원일 수 없습니다.");
  if (input.reasonKo.trim().length < 5) throw new Error("조정 사유를 한국어로 5자 이상 입력해 주세요.");
  const adjustment = addFeeAdjustment({ periodId: input.periodId, unitKey: input.unitKey, amount: input.amount, reasonKo: input.reasonKo, createdBy: actorKo(context), idempotencyKey: input.idempotencyKey });
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 조정 등록", objectTypeKo: "관리비 조정", objectId: adjustment.id, actorKo: actorKo(context), reasonKo: input.reasonKo, metadata: { 세대: input.unitKey, 조정액: input.amount.toString() } });
  return adjustment;
}

export function approveAdjustment(context: FeeAccessContext, adjustmentId: string) {
  assertFeeAccess(context, context.tenantId, "CONFIRM");
  const adjustment = approveFeeAdjustment(context.tenantId, adjustmentId, actorKo(context));
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 조정 승인", objectTypeKo: "관리비 조정", objectId: adjustment.id, actorKo: actorKo(context), reasonKo: adjustment.reasonKo, metadata: { 세대: adjustment.unitKey, 조정액: adjustment.amount.toString() } });
  return adjustment;
}

export function periodForClient(period: FeePeriodView) {
  return {
    ...period,
    originalAssessment: period.originalAssessment.toString(), adjustmentAmount: period.adjustmentAmount.toString(), finalAssessment: period.finalAssessment.toString(),
    netCollected: period.netCollected.toString(), outstanding: period.outstanding.toString(), refundAmount: period.refundAmount.toString(), overpayment: period.overpayment.toString(),
  };
}
