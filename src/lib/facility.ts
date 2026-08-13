import type { Asset, AssetCategory, BudgetSummary, FacilityViewMode } from "@/types/facility";

export function calculateBudgetExecutionRate(budget: BudgetSummary): number {
  if (budget.plannedMillionWon <= 0) return 0;
  return Math.round((budget.spentMillionWon / budget.plannedMillionWon) * 100);
}

export function filterDashboardAssets(
  assets: Asset[],
  category: AssetCategory | null,
  mode: FacilityViewMode,
  floor: string,
  system: AssetCategory,
): Asset[] {
  return assets.filter((asset) => {
    if (category && asset.category !== category) return false;
    if (mode === "floor" && asset.floor !== floor) return false;
    if (mode === "system" && asset.category !== system) return false;
    return true;
  });
}

export const statusLabel = {
  normal: "정상",
  attention: "주의",
  urgent: "긴급",
  inspection: "점검 중",
  offline: "연결 끊김",
} as const;

export function formatWon(value: number): string {
  return `${new Intl.NumberFormat("ko-KR").format(value)}원`;
}
