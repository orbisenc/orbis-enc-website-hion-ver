export type Won = bigint;

export interface FeeLedgerInput {
  originalAssessments: Won[];
  adjustments: Won[];
  payments: Won[];
  refunds: Won[];
  assessedActiveUnitCount: number;
}

export interface FeeLedgerSummary {
  originalAssessment: Won;
  adjustmentAmount: Won;
  finalAssessment: Won;
  payments: Won;
  refunds: Won;
  netCollected: Won;
  appliedCollection: Won;
  outstanding: Won;
  overpayment: Won;
  collectionRateBasisPoints: number | null;
  averagePerUnit: Won;
}

export function sumWon(values: readonly Won[]) {
  return values.reduce((total, value) => total + value, 0n);
}

export function calculateFeeLedger(input: FeeLedgerInput): FeeLedgerSummary {
  if (!Number.isInteger(input.assessedActiveUnitCount) || input.assessedActiveUnitCount < 0) throw new Error("부과 세대 수는 0 이상의 정수여야 합니다.");
  const originalAssessment = sumWon(input.originalAssessments);
  const adjustmentAmount = sumWon(input.adjustments);
  const finalAssessment = originalAssessment + adjustmentAmount;
  const payments = sumWon(input.payments);
  const refunds = sumWon(input.refunds);
  const netCollected = payments - refunds;
  const appliedCollection = finalAssessment <= 0n ? 0n : netCollected < 0n ? 0n : netCollected > finalAssessment ? finalAssessment : netCollected;
  const outstanding = finalAssessment > netCollected ? finalAssessment - netCollected : 0n;
  const overpayment = netCollected > finalAssessment ? netCollected - finalAssessment : 0n;
  const collectionRateBasisPoints = finalAssessment > 0n ? Number(appliedCollection * 10_000n / finalAssessment) : null;
  const averagePerUnit = input.assessedActiveUnitCount > 0 ? finalAssessment / BigInt(input.assessedActiveUnitCount) : 0n;
  return { originalAssessment, adjustmentAmount, finalAssessment, payments, refunds, netCollected, appliedCollection, outstanding, overpayment, collectionRateBasisPoints, averagePerUnit };
}

export function changeRateBasisPoints(current: Won, previous: Won): number | null {
  if (previous === 0n) return null;
  return Number((current - previous) * 10_000n / previous);
}

export type OverdueAging = "해당 없음" | "1개월" | "2개월" | "3개월 이상";

export function classifyOverdueAging(unpaidMonthCount: number): OverdueAging {
  if (!Number.isInteger(unpaidMonthCount) || unpaidMonthCount < 0) throw new Error("미납 개월 수는 0 이상의 정수여야 합니다.");
  if (unpaidMonthCount === 0) return "해당 없음";
  if (unpaidMonthCount === 1) return "1개월";
  if (unpaidMonthCount === 2) return "2개월";
  return "3개월 이상";
}

function assertAllocationInput(total: Won, count: number) {
  if (total < 0n) throw new Error("배분 금액은 0원 이상이어야 합니다.");
  if (!Number.isInteger(count) || count <= 0) throw new Error("배분 대상은 1세대 이상이어야 합니다.");
}

export function allocateEqualAmount(total: Won, unitCount: number): Won[] {
  assertAllocationInput(total, unitCount);
  const base = total / BigInt(unitCount);
  const remainder = Number(total % BigInt(unitCount));
  return Array.from({ length: unitCount }, (_, index) => base + (index < remainder ? 1n : 0n));
}

export function allocateByUnitArea(total: Won, areas: readonly number[]): Won[] {
  assertAllocationInput(total, areas.length);
  if (areas.some((area) => !Number.isInteger(area) || area <= 0)) throw new Error("세대 면적은 0보다 큰 정수 제곱미터 단위여야 합니다.");
  const totalArea = areas.reduce((sum, area) => sum + BigInt(area), 0n);
  const allocated = areas.map((area) => total * BigInt(area) / totalArea);
  let remainder = total - sumWon(allocated);
  for (let index = 0; remainder > 0n; index = (index + 1) % allocated.length) {
    allocated[index] += 1n;
    remainder -= 1n;
  }
  return allocated;
}

export interface FeeExceptionInput {
  categoryNameKo: string;
  currentAmount: Won;
  previousAmount: Won;
  thresholdBasisPoints: number;
}

export function detectCategoryIncrease(input: FeeExceptionInput): string | null {
  const rate = changeRateBasisPoints(input.currentAmount, input.previousAmount);
  if (rate === null || rate <= input.thresholdBasisPoints) return null;
  return `전월 대비 ${input.categoryNameKo}가 ${(rate / 100).toLocaleString("ko-KR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% 증가했습니다. 사용량 또는 단가 변동을 확인해 주세요.`;
}
