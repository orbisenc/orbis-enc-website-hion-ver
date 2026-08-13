import type { Asset, RiskScoreBreakdown } from "@/types/facility";

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function calculateReplacementRisk(asset: Asset, referenceDate = new Date("2026-07-21T00:00:00+09:00")): RiskScoreBreakdown {
  const replacementDate = new Date(asset.expectedReplacementAt.replaceAll(".", "-") + "T00:00:00+09:00");
  const nextInspection = new Date(asset.nextInspectionAt.replaceAll(".", "-") + "T00:00:00+09:00");
  const overdueDays = Math.max(0, Math.floor((referenceDate.getTime() - Math.min(replacementDate.getTime(), nextInspection.getTime())) / 86_400_000));
  const condition = clamp(100 - asset.healthScore) * 0.25;
  const repeatedFailures = clamp(asset.repeatedFailureCount * 25) * 0.20;
  const criticality = ({ "낮음": 20, "보통": 45, "높음": 75, "핵심": 100 } as const)[asset.importance] * 0.20;
  const maintenanceRatio = asset.plannedReplacementCost > 0 ? asset.cumulativeMaintenanceCost / asset.plannedReplacementCost : 0;
  const maintenanceCost = clamp(maintenanceRatio * 200) * 0.15;
  const residentImpact = clamp(asset.residentImpact * 10) * 0.10;
  const overdue = clamp(overdueDays / 3) * 0.10;
  const total = Math.round(condition + repeatedFailures + criticality + maintenanceCost + residentImpact + overdue);
  return { condition, repeatedFailures, criticality, maintenanceCost, residentImpact, overdue, total };
}

export function replacementRecommendation(score: number) {
  if (score >= 70) return "전면교체" as const;
  if (score >= 45) return "부분보수" as const;
  return "유지" as const;
}

export function createSuccessorAsset(predecessor: Asset, successor: Asset): Asset {
  if (predecessor.id === successor.id) throw new Error("후계 자산은 새로운 고유 ID를 사용해야 합니다.");
  if (successor.replacedAssetId && successor.replacedAssetId !== predecessor.id) throw new Error("이미 다른 선행 자산에 연결된 후계 자산입니다.");
  return { ...successor, replacedAssetId: predecessor.id };
}
