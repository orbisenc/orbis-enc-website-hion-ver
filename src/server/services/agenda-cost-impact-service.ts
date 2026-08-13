import { recordFeeAudit, saveAgendaCostImpact } from "@/server/demo/fee-store";
import { allocateByUnitArea, allocateEqualAmount } from "./management-fee-ledger";
import { assertFeeAccess, type FeeAccessContext } from "./management-fee-auth";

export interface AgendaCostImpactInput {
  estimatedProjectCost: bigint;
  actualProjectCost: bigint | null;
  fundingSourceKo: string;
  usesLongTermRepairReserve: boolean;
  requiresAdditionalFee: boolean;
  additionalFeeTotal: bigint;
  allocationType: "EQUAL" | "AREA" | "VOTING_RIGHT" | "NONE";
  eligibleUnitCount: number;
  expectedBillingStartMonth: string;
  installmentCount: number;
  residentExplanationKo: string;
  approved: boolean;
}

export function calculateAndSaveAgendaCostImpact(context: FeeAccessContext, input: AgendaCostImpactInput) {
  assertFeeAccess(context, context.tenantId, "AGENDA_COST");
  if (input.estimatedProjectCost < 0n || input.actualProjectCost !== null && input.actualProjectCost < 0n) throw new Error("사업비는 0원 이상이어야 합니다.");
  const chargeTotal = input.requiresAdditionalFee ? input.additionalFeeTotal : 0n;
  if (chargeTotal > input.estimatedProjectCost) throw new Error("관리비 추가 부과 총액은 총 예상 사업비보다 클 수 없습니다.");
  let estimatedAmountPerUnit = 0n;
  if (input.allocationType === "EQUAL" || input.allocationType === "VOTING_RIGHT") estimatedAmountPerUnit = allocateEqualAmount(chargeTotal, input.eligibleUnitCount)[0] ?? 0n;
  if (input.allocationType === "AREA") {
    const sampleAreas = Array.from({ length: input.eligibleUnitCount }, (_, index) => [59, 74, 84, 101][index % 4]!);
    const allocations = allocateByUnitArea(chargeTotal, sampleAreas);
    estimatedAmountPerUnit = allocations.reduce((sum, amount) => sum + amount, 0n) / BigInt(input.eligibleUnitCount);
  }
  const impact = saveAgendaCostImpact(context.tenantId, {
    estimatedProjectCost: input.estimatedProjectCost,
    actualProjectCost: input.actualProjectCost,
    fundingSourceKo: input.fundingSourceKo,
    usesLongTermRepairReserve: input.usesLongTermRepairReserve,
    requiresAdditionalFee: input.requiresAdditionalFee,
    allocationType: input.allocationType,
    estimatedAmountPerUnit,
    expectedBillingStartMonth: input.expectedBillingStartMonth,
    installmentCount: input.installmentCount,
    residentExplanationKo: input.residentExplanationKo,
    approved: input.approved,
  });
  recordFeeAudit({ tenantId: context.tenantId, actionKo: input.approved ? "안건 비용 영향 승인" : "안건 비용 영향 저장", objectTypeKo: "안건 비용 영향", objectId: `demo-agenda-v${impact.version}`, actorKo: "콘텐츠 담당자", reasonKo: null, metadata: { 예상사업비: input.estimatedProjectCost.toString(), 세대당예상부담액: estimatedAmountPerUnit.toString() } });
  return impact;
}
