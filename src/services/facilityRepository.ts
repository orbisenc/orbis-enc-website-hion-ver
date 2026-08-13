import { mockDashboardData } from "@/data/mockDashboard";
import type { Asset, FacilityDashboardData, SensorSnapshot } from "@/types/facility";

export interface FacilityRepository {
  getDashboard(): Promise<FacilityDashboardData>;
  getAssets(): Promise<Asset[]>;
  getAsset(assetId: string): Promise<Asset | null>;
  getSensorSnapshot(): Promise<SensorSnapshot>;
}

class MockFacilityRepository implements FacilityRepository {
  async getDashboard() { return structuredClone(mockDashboardData); }
  async getAssets() { return structuredClone(mockDashboardData.assets); }
  async getAsset(assetId: string) {
    return structuredClone(mockDashboardData.assets.find((asset) => asset.id === assetId) ?? null);
  }
  async getSensorSnapshot() { return structuredClone(mockDashboardData.sensor); }
}

export const facilityRepository: FacilityRepository = new MockFacilityRepository();
