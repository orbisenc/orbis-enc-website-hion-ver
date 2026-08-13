"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import type { AssetCategory, FacilityViewMode, Notification } from "@/types/facility";
import { create } from "zustand";

interface DashboardState {
  selectedCategory: AssetCategory | null;
  viewMode: FacilityViewMode;
  selectedFloor: string;
  selectedSystem: AssetCategory;
  showHotspots: boolean;
  selectedAssetId: string | null;
  notifications: Notification[];
  setSelectedCategory(category: AssetCategory | null): void;
  setViewMode(mode: FacilityViewMode): void;
  setSelectedFloor(floor: string): void;
  setSelectedSystem(system: AssetCategory): void;
  toggleHotspots(): void;
  selectAsset(assetId: string | null): void;
  markNotificationRead(id: string): void;
  markAllNotificationsRead(): void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCategory: null,
  viewMode: "all",
  selectedFloor: "3층",
  selectedSystem: "mechanical",
  showHotspots: true,
  selectedAssetId: null,
  notifications: mockDashboardData.notifications,
  setSelectedCategory: (category) => set((state) => ({ selectedCategory: state.selectedCategory === category ? null : category })),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedFloor: (selectedFloor) => set({ selectedFloor }),
  setSelectedSystem: (selectedSystem) => set({ selectedSystem }),
  toggleHotspots: () => set((state) => ({ showHotspots: !state.showHotspots })),
  selectAsset: (selectedAssetId) => set({ selectedAssetId }),
  markNotificationRead: (id) => set((state) => ({ notifications: state.notifications.map((item) => item.id === id ? { ...item, read: true } : item) })),
  markAllNotificationsRead: () => set((state) => ({ notifications: state.notifications.map((item) => ({ ...item, read: true })) })),
}));
