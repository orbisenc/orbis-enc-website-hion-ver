import { describe, expect, it } from "vitest";
import { apartmentAssets } from "@/data/mockDashboard";
import { initialWorkOrders } from "@/data/apartmentOperations";
import { calculateExecutionRate } from "@/server/services/facility-budget-service";
import { calculateNextInspectionDate, isInspectionOverdue } from "@/server/services/facility-inspection-service";
import { generateFacilityInsights } from "@/server/services/facility-insight-service";
import { canFacilityAction, scopeWorkOrdersForActor } from "@/server/services/facility-permission-service";
import { calculateReplacementRisk, createSuccessorAsset } from "@/server/services/facility-risk-service";
import { canTransitionWorkOrder, transitionWorkOrder } from "@/server/services/facility-work-order-service";

describe("HION Apartment OS 핵심 업무 규칙", () => {
  it("교체 위험점수를 25·20·20·15·10·10 가중치로 산출한다", () => {
    const score = calculateReplacementRisk(apartmentAssets[0]!);
    expect(score.condition).toBeGreaterThan(0);
    expect(score.repeatedFailures).toBe(20);
    expect(score.criticality).toBe(20);
    expect(score.total).toBe(Math.round(score.condition + score.repeatedFailures + score.criticality + score.maintenanceCost + score.residentImpact + score.overdue));
  });

  it("승인예산이 0원이면 집행률을 0으로 안전하게 처리한다", () => {
    expect(calculateExecutionRate(1000n, 0n)).toBe(0);
    expect(calculateExecutionRate(620n, 1000n)).toBe(62);
  });

  it("점검 주기와 기준일로 다음 점검일과 지연 여부를 계산한다", () => {
    const next = calculateNextInspectionDate(new Date("2026-07-01T00:00:00Z"), 30);
    expect(next.toISOString().slice(0, 10)).toBe("2026-07-31");
    expect(isInspectionOverdue(next, new Date("2026-08-01T00:00:00Z"))).toBe(true);
  });

  it("작업지시는 정의된 상태 전이만 허용하고 완료 증빙을 요구한다", () => {
    expect(canTransitionWorkOrder("진행", "검수요청")).toBe(true);
    expect(canTransitionWorkOrder("접수", "완료")).toBe(false);
    expect(() => transitionWorkOrder({ ...initialWorkOrders[2]!, evidence: [], completionSummary: "완료" }, "완료")).toThrow("작업 후 증빙");
    expect(transitionWorkOrder(initialWorkOrders[2]!, "완료").status).toBe("완료");
  });

  it("자산 교체 시 새 ID를 발급하고 선행 자산 관계를 보존한다", () => {
    const predecessor = apartmentAssets[0]!;
    const successor = { ...apartmentAssets[1]!, id: `${apartmentAssets[1]!.id}-NEW`, assetCode: "P-02-N" };
    expect(createSuccessorAsset(predecessor, successor).replacedAssetId).toBe(predecessor.id);
    expect(() => createSuccessorAsset(predecessor, { ...successor, id: predecessor.id })).toThrow("새로운 고유 ID");
  });

  it("역할별 권한과 협력업체 배정 범위를 서버 규칙으로 제한한다", () => {
    expect(canFacilityAction("입주자대표회의", "자산편집")).toBe(false);
    expect(canFacilityAction("관리사무소 책임자", "예산승인")).toBe(true);
    const vendorOrders = scopeWorkOrdersForActor(initialWorkOrders, { tenantId: "hion-demo", role: "협력업체", name: "한빛시설관리" });
    expect(vendorOrders.length).toBeGreaterThan(0);
    expect(vendorOrders.every((order) => order.tenantId === "hion-demo" && order.vendor === "한빛시설관리")).toBe(true);
  });

  it("반복 고장 3회 이상 자산의 근거와 규칙 버전을 생성한다", () => {
    const insight = generateFacilityInsights(apartmentAssets).find((item) => item.id === "insight-repeated-failure");
    expect(insight?.evidence.some((item) => item.includes("4회"))).toBe(true);
    expect(insight?.ruleVersion).toMatch(/^FAC-RULE-/);
  });
});
