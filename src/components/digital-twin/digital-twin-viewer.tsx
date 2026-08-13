"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { facilityModels } from "@/data/facilityModels";
import { filterDashboardAssets } from "@/lib/facility";
import { useDashboardStore } from "@/store/dashboardStore";
import type { AssetCategory, FacilityViewMode } from "@/types/facility";
import { Building2, Check, Layers3, LoaderCircle, SlidersHorizontal } from "lucide-react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { AssetDetailDrawer } from "./asset-detail-drawer";

const FacilityModelCanvas = dynamic(() => import("./facility-model-canvas"), { ssr: false, loading: () => <div className="facility-viewer-loading"><LoaderCircle /> 3D 모델 불러오는 중</div> });
const FacilityImage3D = dynamic(() => import("./facility-image-3d"), { ssr: false, loading: () => <div className="facility-viewer-loading"><LoaderCircle /> 3D 이미지 불러오는 중</div> });
const floors = ["옥상", "전 층", "지상 1층", "지하 1층", "지하 2층"];
const systems: { value: AssetCategory; label: string }[] = [
  { value: "mechanical", label: "기계" }, { value: "electrical", label: "전기" }, { value: "fire", label: "소방" }, { value: "plumbing", label: "급배수" }, { value: "security", label: "통신·보안" },
];
export function DigitalTwinViewer() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [displayMode, setDisplayMode] = useState<"2d" | "3d">("2d");
  const modelPath = facilityModels[0] ?? null;
  const selectedCategory = useDashboardStore((state) => state.selectedCategory);
  const viewMode = useDashboardStore((state) => state.viewMode);
  const selectedFloor = useDashboardStore((state) => state.selectedFloor);
  const selectedSystem = useDashboardStore((state) => state.selectedSystem);
  const showHotspots = useDashboardStore((state) => state.showHotspots);
  const selectedAssetId = useDashboardStore((state) => state.selectedAssetId);
  const setViewMode = useDashboardStore((state) => state.setViewMode);
  const setFloor = useDashboardStore((state) => state.setSelectedFloor);
  const setSystem = useDashboardStore((state) => state.setSelectedSystem);
  const toggleHotspots = useDashboardStore((state) => state.toggleHotspots);
  const selectAsset = useDashboardStore((state) => state.selectAsset);
  const didHydrateLinkedAsset = useRef(false);

  useEffect(() => {
    if (didHydrateLinkedAsset.current) return;
    didHydrateLinkedAsset.current = true;
    const linkedAssetId = searchParams.get("assetId");
    if (linkedAssetId && mockDashboardData.assets.some((asset) => asset.id === linkedAssetId) && linkedAssetId !== selectedAssetId) selectAsset(linkedAssetId);
  }, [searchParams, selectAsset, selectedAssetId]);

  const selectAssetWithUrl = (assetId: string | null) => {
    selectAsset(assetId);
    const params = new URLSearchParams(searchParams.toString());
    if (assetId) params.set("assetId", assetId); else params.delete("assetId");
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false });
  };

  const visibleAssets = useMemo(() => filterDashboardAssets(mockDashboardData.assets, selectedCategory, viewMode, selectedFloor, selectedSystem), [selectedCategory, viewMode, selectedFloor, selectedSystem]);
  const selectedAsset = mockDashboardData.assets.find((asset) => asset.id === selectedAssetId) ?? null;

  return <section className="facility-digital-twin" aria-label="HION 스마트파크 디지털 트윈 뷰어">
    <div className="facility-viewer-scene" onClick={(event) => { if (event.currentTarget === event.target) selectAssetWithUrl(null); }}>
      {displayMode === "3d"
        ? modelPath
          ? <FacilityModelCanvas modelPath={modelPath} />
          : <FacilityImage3D assets={showHotspots ? visibleAssets : []} selectedAssetId={selectedAssetId} onSelect={selectAssetWithUrl} />
        : <FacilityBuildingFallback />}
      {displayMode === "2d" && showHotspots && visibleAssets.map((asset, index) => <button key={asset.id} type="button" className={`facility-hotspot ${selectedAssetId === asset.id ? "is-selected" : ""}`} style={{ left: `${asset.position2D.left}%`, top: `${asset.position2D.top}%` }} onClick={(event) => { event.stopPropagation(); selectAssetWithUrl(asset.id); }} aria-label={`${asset.name} 상세 열기`}>
        <span>{index + 1}</span><strong>{asset.name}</strong><em>{asset.locationLabel}</em>
      </button>)}
      {selectedAsset && <AssetDetailDrawer asset={selectedAsset} onClose={() => selectAssetWithUrl(null)} />}
    </div>
    <div className="facility-view-controls">
      <span><Layers3 size={15} /> 뷰 모드</span>
      <button type="button" aria-label="2D 이미지 보기" aria-pressed={displayMode === "2d"} onClick={() => setDisplayMode("2d")}>2D</button>
      <button type="button" aria-label="3D 입체 보기" aria-pressed={displayMode === "3d"} onClick={() => setDisplayMode("3d")}>3D</button>
      <i aria-hidden="true" />
      {(["all", "floor", "system"] as FacilityViewMode[]).map((mode) => <button key={mode} type="button" aria-pressed={viewMode === mode} onClick={() => setViewMode(mode)}>{mode === "all" ? "전체" : mode === "floor" ? "층별" : "계통별"}</button>)}
      {viewMode === "floor" && <select aria-label="표시할 층" value={selectedFloor} onChange={(event) => setFloor(event.target.value)}>{floors.map((floor) => <option key={floor}>{floor}</option>)}</select>}
      {viewMode === "system" && <select aria-label="표시할 설비 계통" value={selectedSystem} onChange={(event) => setSystem(event.target.value as AssetCategory)}>{systems.map((system) => <option key={system.value} value={system.value}>{system.label}</option>)}</select>}
    </div>
    <button type="button" className="facility-hotspot-toggle" aria-pressed={showHotspots} onClick={toggleHotspots}><SlidersHorizontal size={15} /> 객체 필터 <span>{showHotspots && <Check size={14} />}</span></button>
  </section>;
}

function FacilityBuildingFallback() {
  return <div className="facility-building-fallback" role="img" aria-label="HION 스마트파크 시설 배치 대체 이미지">
    <div className="facility-apartment-fallback" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <div key={index}><span>{101 + index}동</span>{Array.from({ length: 8 }, (_, floor) => <i key={floor} />)}</div>)}</div>
    <div className="facility-scene-label"><Building2 size={14} /> 3D 미지원 환경용 시설 배치 대체 경로</div>
  </div>;
}
