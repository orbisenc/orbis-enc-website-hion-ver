import { beforeEach, describe, expect, it } from "vitest";
import { mockDashboardData } from "@/data/mockDashboard";
import { calculateBudgetExecutionRate, filterDashboardAssets } from "@/lib/facility";
import { useDashboardStore } from "@/store/dashboardStore";

describe("시설운영 대시보드", () => {
  beforeEach(() => {
    useDashboardStore.setState({
      selectedCategory: null,
      viewMode: "all",
      selectedFloor: "지하 2층",
      selectedSystem: "mechanical",
      showHotspots: true,
      selectedAssetId: null,
      notifications: structuredClone(mockDashboardData.notifications),
    });
  });

  it("예산 집행률을 계획 금액 대비 집행 금액으로 계산한다", () => {
    expect(calculateBudgetExecutionRate(mockDashboardData.budget)).toBe(62);
  });

  it("전기·발전 자산을 분류 필터로 조회한다", () => {
    const assets = filterDashboardAssets(mockDashboardData.assets, "electrical", "all", "3층", "mechanical");
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((asset) => asset.category === "electrical")).toBe(true);
  });

  it("아파트 핵심 자산과 고유 ID 규칙을 반영한다", () => {
    expect(mockDashboardData.assets).toHaveLength(48);
    expect(mockDashboardData.assets.some((asset) => asset.name === "지하주차장 배수펌프 P-02")).toBe(true);
    expect(mockDashboardData.assets.some((asset) => asset.name === "비상발전기 GEN-01")).toBe(true);
    expect(mockDashboardData.assets.every((asset) => asset.id.startsWith("HION-HSP01-"))).toBe(true);
  });

  it("층별 뷰 모드에서 선택한 층의 객체만 반환한다", () => {
    const assets = filterDashboardAssets(mockDashboardData.assets, null, "floor", "지하 2층", "mechanical");
    expect(assets.length).toBeGreaterThan(0);
    expect(assets.every((asset) => asset.floor === "지하 2층")).toBe(true);
  });

  it("객체 필터 스위치가 핫스폿 표시 상태를 변경한다", () => {
    useDashboardStore.getState().toggleHotspots();
    expect(useDashboardStore.getState().showHotspots).toBe(false);
  });

  it("객체 선택과 해제로 상세 드로어 상태를 관리한다", () => {
    useDashboardStore.getState().selectAsset("asset-ehp-001");
    expect(useDashboardStore.getState().selectedAssetId).toBe("asset-ehp-001");
    useDashboardStore.getState().selectAsset(null);
    expect(useDashboardStore.getState().selectedAssetId).toBeNull();
  });

  it("개별 알림 읽음 처리 후 미확인 수가 즉시 줄어든다", () => {
    useDashboardStore.getState().markNotificationRead("notification-1");
    expect(useDashboardStore.getState().notifications.filter((item) => !item.read)).toHaveLength(2);
  });

  it("모든 알림을 한 번에 읽음 처리한다", () => {
    useDashboardStore.getState().markAllNotificationsRead();
    expect(useDashboardStore.getState().notifications.every((item) => item.read)).toBe(true);
  });
});
