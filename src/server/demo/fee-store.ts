import { randomUUID } from "node:crypto";
import { sha256 } from "@/lib/security/hash";
import { calculateFeeLedger, changeRateBasisPoints, classifyOverdueAging, detectCategoryIncrease, type OverdueAging, type Won } from "@/server/services/management-fee-ledger";

export const FEE_DEMO_TENANT_ID = "hion-demo";
export const FEE_DEMO_COMPLEX_ID = "demo-complex";
export const FEE_DEMO_COMPLEX_CODE = "HAEOREUM";
export const FEE_DEMO_COMPLEX_NAME = "해오름 아파트";
export const FEE_REFERENCE_MONTH = "2026-07";

export type FeePeriodState = "DRAFT" | "IMPORTED" | "CONFIRMED" | "CLOSED" | "REOPENED";
export type FeeCollectionState = "완납" | "부분납" | "미납" | "면제" | "과납";
export type FeeImportType = "ASSESSMENT" | "COLLECTION";
export type FeeImportStatus = "UPLOADED" | "VALIDATED" | "CONFIRMED" | "REJECTED";

export interface FeeCategoryView {
  id: string;
  code: string;
  nameKo: string;
  typeKo: string;
  allocationKo: string;
  active: boolean;
  displayOrder: number;
  descriptionKo: string;
  includeInDashboard: boolean;
}

export const feeCategories: FeeCategoryView[] = [
  ["GENERAL", "일반관리비", "공용", "공통 배분", "관리사무소 운영과 일반 행정 비용"],
  ["CLEANING", "청소비", "공용", "공통 배분", "공용부 청소 비용"],
  ["SECURITY", "경비비", "공용", "공통 배분", "단지 경비 운영 비용"],
  ["ELEVATOR", "승강기 유지비", "공용", "동별 배분", "승강기 점검과 유지 비용"],
  ["COMMON_ELECTRIC", "공동전기료", "공용", "공통 배분", "공용부 전기 사용 비용"],
  ["COMMON_WATER", "공동수도료", "공용", "공통 배분", "공용부 수도 사용 비용"],
  ["HEATING", "난방비", "개별", "개별 사용량", "세대별 난방 사용 비용"],
  ["HOT_WATER", "급탕비", "개별", "개별 사용량", "세대별 급탕 사용 비용"],
  ["LONG_TERM_RESERVE", "장기수선충당금", "충당금", "면적 배분", "공동주택 장기수선 계획 적립금"],
  ["INSURANCE", "보험료", "공용", "공통 배분", "공동주택 보험 비용"],
  ["MAINTENANCE", "시설 유지보수비", "공용", "공통 배분", "공용시설 점검과 보수 비용"],
  ["OTHER", "기타 관리비", "기타", "공통 배분", "분류되지 않은 기타 비용"],
].map(([code, nameKo, typeKo, allocationKo, descriptionKo], index) => ({ id: `fee-category-${code}`, code, nameKo, typeKo, allocationKo, active: true, displayOrder: index + 1, descriptionKo, includeInDashboard: true }));

export interface FeeUnitView {
  id: string;
  building: string;
  unit: string;
  referenceMonth: string;
  originalAssessment: Won;
  adjustmentAmount: Won;
  finalAssessment: Won;
  collected: Won;
  outstanding: Won;
  overpayment: Won;
  collectionState: FeeCollectionState;
  overdueMonths: number;
  overdueAging: OverdueAging;
  lastPaymentDate: string | null;
  adjusted: boolean;
  validationStateKo: string;
}

export interface FeePeriodView {
  id: string;
  referenceMonth: string;
  state: FeePeriodState;
  assessedUnitCount: number;
  originalAssessment: Won;
  adjustmentAmount: Won;
  finalAssessment: Won;
  netCollected: Won;
  outstanding: Won;
  refundAmount: Won;
  overpayment: Won;
  collectionRateBasisPoints: number | null;
  registeredBy: string;
  registeredAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  closedBy: string | null;
  closedAt: string | null;
  warningCount: number;
  closingSnapshotHash: string | null;
  closingSnapshot: Record<string, string> | null;
}

export interface FeeImportIssue {
  rowNumber: number;
  column: string | null;
  severity: "WARNING" | "BLOCKING";
  codeKo: string;
  messageKo: string;
  maskedSummary: string;
}

export interface FeeImportBatchView {
  id: string;
  tenantId: string;
  periodId: string;
  referenceMonth: string;
  type: FeeImportType;
  filename: string;
  fileHash: string;
  encoding: string;
  rowCount: number;
  validRowCount: number;
  warningCount: number;
  blockingErrorCount: number;
  sourceTotal: Won;
  calculatedTotal: Won;
  status: FeeImportStatus;
  uploadedBy: string;
  uploadedAt: string;
  confirmedBy: string | null;
  confirmedAt: string | null;
  issues: FeeImportIssue[];
  records: Array<Record<string, string>>;
  idempotencyKey?: string;
}

export interface FeeAdjustmentView {
  id: string;
  periodId: string;
  unitKey: string;
  amount: Won;
  reasonKo: string;
  createdBy: string;
  createdAt: string;
  approvedBy: string | null;
  approvedAt: string | null;
  state: "PENDING" | "APPROVED" | "REJECTED";
  idempotencyKey: string;
}

export interface FeeAuditView {
  id: string;
  tenantId: string;
  actionKo: string;
  objectTypeKo: string;
  objectId: string;
  actorKo: string;
  reasonKo: string | null;
  occurredAt: string;
  metadata: Record<string, string | number>;
}

export interface AgendaCostImpactView {
  version: number;
  estimatedProjectCost: Won;
  actualProjectCost: Won | null;
  fundingSourceKo: string;
  usesLongTermRepairReserve: boolean;
  requiresAdditionalFee: boolean;
  allocationType: "EQUAL" | "AREA" | "VOTING_RIGHT" | "NONE";
  estimatedAmountPerUnit: Won;
  expectedBillingStartMonth: string;
  installmentCount: number;
  residentExplanationKo: string;
  versionHash: string;
  approved: boolean;
  approvedAt: string | null;
}

interface FeeDemoState {
  periodOverrides: Map<string, Partial<FeePeriodView>>;
  imports: FeeImportBatchView[];
  adjustments: FeeAdjustmentView[];
  audits: FeeAuditView[];
  costImpact: AgendaCostImpactView;
}

const globalFeeStore = globalThis as typeof globalThis & { __hionFeeDemo?: FeeDemoState };
const defaultCostImpact: AgendaCostImpactView = {
  version: 1,
  estimatedProjectCost: 48_000_000n,
  actualProjectCost: null,
  fundingSourceKo: "장기수선충당금 3,000만원과 관리비 추가 부과 1,800만원",
  usesLongTermRepairReserve: true,
  requiresAdditionalFee: true,
  allocationType: "EQUAL",
  estimatedAmountPerUnit: 9_000n,
  expectedBillingStartMonth: "2026-09",
  installmentCount: 2,
  residentExplanationKo: "총사업비는 약 4,800만원이며 장기수선충당금 3,000만원을 사용하고, 나머지 1,800만원은 2,000세대에 균등 배분할 예정입니다. 세대당 예상 부담액은 총 9,000원이며 2개월에 걸쳐 부과하는 가정입니다.",
  versionHash: sha256("demo-agenda-cost-impact-v1"),
  approved: true,
  approvedAt: "2026-07-15T01:30:00.000Z",
};

export const feeDemoStore: FeeDemoState = (globalFeeStore.__hionFeeDemo ??= {
  periodOverrides: new Map(),
  imports: [],
  adjustments: [],
  audits: [],
  costImpact: defaultCostImpact,
});

function assertScope(tenantId: string, complexId = FEE_DEMO_COMPLEX_ID) {
  if (tenantId !== FEE_DEMO_TENANT_ID || complexId !== FEE_DEMO_COMPLEX_ID) throw new Error("다른 단지의 관리비 정보에 접근할 수 없습니다.");
}

function monthOffset(referenceMonth: string, offset: number) {
  const [year, month] = referenceMonth.split("-").map(Number);
  const value = new Date(Date.UTC(year!, month! - 1 + offset, 1));
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, "0")}`;
}

function seasonalWon(referenceMonth: string) {
  const month = Number(referenceMonth.slice(5));
  return [0, 28_000, 25_000, 12_000, 4_000, 0, 9_000, 18_000, 16_000, 5_000, 2_000, 10_000, 24_000][month] ?? 0;
}

export function generateFeeUnits(referenceMonth: string): FeeUnitView[] {
  const seasonal = seasonalWon(referenceMonth);
  return Array.from({ length: 2_000 }, (_, index) => {
    const buildingNumber = 101 + Math.floor(index / 400);
    const localIndex = index % 400;
    const floor = Math.floor(localIndex / 10) + 1;
    const line = localIndex % 10 + 1;
    const unit = `${floor}${String(line).padStart(2, "0")}`;
    const original = BigInt(168_000 + seasonal + (buildingNumber - 101) * 1_100 + (index % 19) * 730);
    const exempt = index % 211 === 0;
    const adjustment = exempt ? -original : index % 127 === 0 ? -8_000n : index % 173 === 0 ? 5_000n : 0n;
    const finalAssessment = original + adjustment;
    const overdueMonths = exempt ? 0 : index % 89 === 0 ? 4 : index % 47 === 0 ? 2 : index % 23 === 0 ? 1 : 0;
    let collected = finalAssessment;
    if (overdueMonths >= 3) collected = 0n;
    else if (overdueMonths === 2) collected = finalAssessment / 3n;
    else if (overdueMonths === 1) collected = finalAssessment * 2n / 3n;
    if (!exempt && index % 137 === 0) collected = finalAssessment + 12_000n;
    const ledger = calculateFeeLedger({ originalAssessments: [original], adjustments: [adjustment], payments: [collected], refunds: [], assessedActiveUnitCount: exempt ? 0 : 1 });
    const collectionState: FeeCollectionState = exempt ? "면제" : ledger.overpayment > 0n ? "과납" : ledger.outstanding === 0n ? "완납" : ledger.netCollected > 0n ? "부분납" : "미납";
    return {
      id: `fee-unit-${buildingNumber}-${unit}`,
      building: String(buildingNumber), unit, referenceMonth,
      originalAssessment: original, adjustmentAmount: adjustment, finalAssessment,
      collected: ledger.netCollected, outstanding: ledger.outstanding, overpayment: ledger.overpayment,
      collectionState, overdueMonths, overdueAging: classifyOverdueAging(overdueMonths),
      lastPaymentDate: collected > 0n ? `${referenceMonth}-${String(8 + index % 12).padStart(2, "0")}` : null,
      adjusted: adjustment !== 0n,
      validationStateKo: index % 503 === 0 ? "확인 필요" : "정상",
    };
  });
}

function basePeriod(referenceMonth: string): FeePeriodView {
  const units = generateFeeUnits(referenceMonth);
  const originalAssessment = units.reduce((sum, unit) => sum + unit.originalAssessment, 0n);
  const adjustmentAmount = units.reduce((sum, unit) => sum + unit.adjustmentAmount, 0n);
  const finalAssessment = units.reduce((sum, unit) => sum + unit.finalAssessment, 0n);
  const netCollected = units.reduce((sum, unit) => sum + unit.collected, 0n);
  const outstanding = units.reduce((sum, unit) => sum + unit.outstanding, 0n);
  const overpayment = units.reduce((sum, unit) => sum + unit.overpayment, 0n);
  const state: FeePeriodState = referenceMonth === FEE_REFERENCE_MONTH ? "IMPORTED" : "CLOSED";
  const id = `fee-period-${referenceMonth}`;
  const snapshotHash = state === "CLOSED" ? sha256({ id, referenceMonth, finalAssessment: finalAssessment.toString(), netCollected: netCollected.toString() }) : null;
  return {
    id, referenceMonth, state, assessedUnitCount: units.filter((unit) => unit.collectionState !== "면제").length,
    originalAssessment, adjustmentAmount, finalAssessment, netCollected, outstanding, refundAmount: 420_000n, overpayment,
    collectionRateBasisPoints: finalAssessment > 0n ? Number((finalAssessment - outstanding) * 10_000n / finalAssessment) : null,
    registeredBy: "회계 담당자", registeredAt: `${referenceMonth}-03T00:10:00.000Z`,
    confirmedBy: state === "CLOSED" ? "승인 관리자" : null, confirmedAt: state === "CLOSED" ? `${referenceMonth}-05T01:00:00.000Z` : null,
    closedBy: state === "CLOSED" ? "승인 관리자" : null, closedAt: state === "CLOSED" ? `${referenceMonth}-28T01:30:00.000Z` : null,
    warningCount: referenceMonth === "2026-04" ? 1 : 0, closingSnapshotHash: snapshotHash, closingSnapshot: state === "CLOSED" ? { 기준월: referenceMonth, 최종부과액: finalAssessment.toString(), 순수납액: netCollected.toString(), 미납액: outstanding.toString() } : null,
  };
}

export function listFeePeriods(tenantId: string, complexId = FEE_DEMO_COMPLEX_ID) {
  assertScope(tenantId, complexId);
  return Array.from({ length: 12 }, (_, index) => monthOffset(FEE_REFERENCE_MONTH, -index)).map((month) => ({ ...basePeriod(month), ...feeDemoStore.periodOverrides.get(`fee-period-${month}`) }));
}

export function getFeePeriod(tenantId: string, periodId: string) {
  const period = listFeePeriods(tenantId).find((item) => item.id === periodId);
  if (!period) throw new Error("관리비 기준월을 찾을 수 없습니다.");
  return period;
}

function categoryBreakdown(total: Won, referenceMonth: string) {
  const weights = [1700, 700, 1200, 500, referenceMonth.endsWith("07") ? 1250 : 950, 250, 1600, 700, 900, 150, 800, 250];
  const weightTotal = weights.reduce((sum, value) => sum + value, 0);
  let allocated = 0n;
  return feeCategories.map((category, index) => {
    const amount = index === feeCategories.length - 1 ? total - allocated : total * BigInt(weights[index]!) / BigInt(weightTotal);
    allocated += amount;
    return { ...category, amount };
  });
}

export function getFeeDashboard(tenantId: string, referenceMonth = FEE_REFERENCE_MONTH) {
  assertScope(tenantId);
  const periods = listFeePeriods(tenantId);
  const period = periods.find((item) => item.referenceMonth === referenceMonth) ?? periods[0]!;
  const previous = periods.find((item) => item.referenceMonth === monthOffset(period.referenceMonth, -1));
  const lastYear = basePeriod(monthOffset(period.referenceMonth, -12));
  const units = generateFeeUnits(period.referenceMonth);
  const categories = categoryBreakdown(period.finalAssessment, period.referenceMonth);
  const previousCategories = categoryBreakdown(previous?.finalAssessment ?? period.finalAssessment, previous?.referenceMonth ?? period.referenceMonth);
  const buildingBreakdown = ["101", "102", "103", "104", "105"].map((building) => {
    const rows = units.filter((unit) => unit.building === building);
    const total = rows.reduce((sum, unit) => sum + unit.finalAssessment, 0n);
    return { building, unitCount: rows.length, total, average: total / BigInt(rows.length) };
  });
  const aging = (["1개월", "2개월", "3개월 이상"] as OverdueAging[]).map((label) => ({ label, amount: units.filter((unit) => unit.overdueAging === label).reduce((sum, unit) => sum + unit.outstanding, 0n) }));
  const categoryException = detectCategoryIncrease({ categoryNameKo: "공동전기료", currentAmount: categories[4]!.amount, previousAmount: previousCategories[4]!.amount, thresholdBasisPoints: 1_500 });
  const exceptions = [
    categoryException,
    "101동 평균 관리비가 단지 평균보다 7.2% 높습니다. 세대 구성과 공용 사용량을 확인해 주세요.",
    period.warningCount > 0 ? "가져온 원본 합계와 계산 합계에 확인이 필요한 차이가 있습니다." : null,
    units.some((unit) => unit.overpayment > 0n) ? "과납 세대가 있습니다. 다음 달 충당 또는 환급 여부를 확인해 주세요." : null,
  ].filter(Boolean) as string[];
  return {
    period,
    previous,
    trends: periods.slice().reverse(),
    categories,
    buildingBreakdown,
    aging,
    monthOverMonthBasisPoints: previous ? changeRateBasisPoints(period.finalAssessment, previous.finalAssessment) : null,
    yearOverYearBasisPoints: changeRateBasisPoints(period.finalAssessment, lastYear.finalAssessment),
    longTermOverdue: aging.find((item) => item.label === "3개월 이상")?.amount ?? 0n,
    averagePerUnit: period.assessedUnitCount > 0 ? period.finalAssessment / BigInt(period.assessedUnitCount) : 0n,
    budget: { planned: 405_000_000n, actual: period.finalAssessment },
    exceptions,
  };
}

export interface FeeUnitFilters {
  referenceMonth?: string;
  building?: string;
  collectionState?: string;
  overdueAging?: string;
  minimumAmount?: number;
  maximumAmount?: number;
  adjusted?: boolean;
  validationState?: string;
  query?: string;
  page?: number;
  pageSize?: number;
  sort?: "unit" | "assessment" | "outstanding";
}

export function listFeeUnits(tenantId: string, filters: FeeUnitFilters = {}) {
  assertScope(tenantId);
  let rows = generateFeeUnits(filters.referenceMonth ?? FEE_REFERENCE_MONTH);
  if (filters.building) rows = rows.filter((row) => row.building === filters.building);
  if (filters.collectionState) rows = rows.filter((row) => row.collectionState === filters.collectionState);
  if (filters.overdueAging) rows = rows.filter((row) => row.overdueAging === filters.overdueAging);
  if (filters.minimumAmount !== undefined) rows = rows.filter((row) => row.finalAssessment >= BigInt(filters.minimumAmount!));
  if (filters.maximumAmount !== undefined) rows = rows.filter((row) => row.finalAssessment <= BigInt(filters.maximumAmount!));
  if (filters.adjusted !== undefined) rows = rows.filter((row) => row.adjusted === filters.adjusted);
  if (filters.validationState) rows = rows.filter((row) => row.validationStateKo === filters.validationState);
  if (filters.query) rows = rows.filter((row) => `${row.building}-${row.unit}`.includes(filters.query!));
  rows.sort((left, right) => filters.sort === "assessment" ? Number(right.finalAssessment - left.finalAssessment) : filters.sort === "outstanding" ? Number(right.outstanding - left.outstanding) : `${left.building}-${left.unit}`.localeCompare(`${right.building}-${right.unit}`));
  const total = rows.length;
  const pageSize = Math.min(Math.max(filters.pageSize ?? 50, 10), 100);
  const page = Math.max(filters.page ?? 1, 1);
  return { rows: rows.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, totalPages: Math.max(Math.ceil(total / pageSize), 1) };
}

export function listFeeImports(tenantId: string) {
  assertScope(tenantId);
  return feeDemoStore.imports.filter((item) => item.tenantId === tenantId).map((item) => Object.fromEntries(Object.entries(item).filter(([key]) => key !== "records")) as Omit<FeeImportBatchView, "records">);
}

export function findFeeImportByHash(tenantId: string, fileHash: string) {
  assertScope(tenantId);
  return feeDemoStore.imports.find((item) => item.tenantId === tenantId && item.fileHash === fileHash) ?? null;
}

export function addFeeImportBatch(batch: FeeImportBatchView) {
  assertScope(batch.tenantId);
  feeDemoStore.imports.push(batch);
  return batch;
}

export function findFeeImportBatch(tenantId: string, batchId: string) {
  assertScope(tenantId);
  const batch = feeDemoStore.imports.find((item) => item.id === batchId && item.tenantId === tenantId);
  if (!batch) throw new Error("관리비 등록 내역을 찾을 수 없습니다.");
  return batch;
}

export function recordFeeAudit(input: Omit<FeeAuditView, "id" | "occurredAt">) {
  const event: FeeAuditView = { ...input, id: randomUUID(), occurredAt: new Date().toISOString() };
  feeDemoStore.audits.push(event);
  return event;
}

export function listFeeAudits(tenantId: string) {
  assertScope(tenantId);
  return feeDemoStore.audits.filter((item) => item.tenantId === tenantId).slice().reverse();
}

export function listFeeAdjustments(tenantId: string, periodId: string) {
  assertScope(tenantId);
  return feeDemoStore.adjustments.filter((item) => item.periodId === periodId).slice().reverse();
}

export function addFeeAdjustment(input: Omit<FeeAdjustmentView, "id" | "createdAt" | "approvedBy" | "approvedAt" | "state">) {
  const repeated = feeDemoStore.adjustments.find((item) => item.idempotencyKey === input.idempotencyKey);
  if (repeated) return repeated;
  const adjustment: FeeAdjustmentView = { ...input, id: randomUUID(), createdAt: new Date().toISOString(), approvedBy: null, approvedAt: null, state: "PENDING" };
  feeDemoStore.adjustments.push(adjustment);
  return adjustment;
}

export function approveFeeAdjustment(tenantId: string, adjustmentId: string, approverKo: string) {
  assertScope(tenantId);
  const adjustment = feeDemoStore.adjustments.find((item) => item.id === adjustmentId);
  if (!adjustment) throw new Error("조정 내역을 찾을 수 없습니다.");
  if (adjustment.state === "APPROVED") return adjustment;
  adjustment.state = "APPROVED";
  adjustment.approvedBy = approverKo;
  adjustment.approvedAt = new Date().toISOString();
  return adjustment;
}

export function updateFeePeriodState(tenantId: string, periodId: string, update: Partial<FeePeriodView>) {
  getFeePeriod(tenantId, periodId);
  feeDemoStore.periodOverrides.set(periodId, { ...(feeDemoStore.periodOverrides.get(periodId) ?? {}), ...update });
  return getFeePeriod(tenantId, periodId);
}

export function getApprovedAgendaCostImpact(tenantId: string) {
  assertScope(tenantId);
  return feeDemoStore.costImpact.approved ? feeDemoStore.costImpact : null;
}

export function updateFeeCategory(tenantId: string, categoryId: string, update: Pick<FeeCategoryView, "nameKo" | "descriptionKo" | "active" | "displayOrder" | "includeInDashboard">) {
  assertScope(tenantId);
  const category = feeCategories.find((item) => item.id === categoryId);
  if (!category) throw new Error("관리비 항목을 찾을 수 없습니다.");
  Object.assign(category, update);
  return category;
}

export function saveAgendaCostImpact(tenantId: string, impact: Omit<AgendaCostImpactView, "version" | "versionHash" | "approvedAt">) {
  assertScope(tenantId);
  const version = feeDemoStore.costImpact.version + 1;
  const versionHash = sha256({ ...impact, estimatedProjectCost: impact.estimatedProjectCost.toString(), actualProjectCost: impact.actualProjectCost?.toString() ?? null, estimatedAmountPerUnit: impact.estimatedAmountPerUnit.toString(), version });
  feeDemoStore.costImpact = { ...impact, version, versionHash, approvedAt: impact.approved ? new Date().toISOString() : null };
  return feeDemoStore.costImpact;
}

export function resetFeeDemoStore() {
  feeDemoStore.periodOverrides.clear();
  feeDemoStore.imports.splice(0);
  feeDemoStore.adjustments.splice(0);
  feeDemoStore.audits.splice(0);
  feeDemoStore.costImpact = defaultCostImpact;
}
