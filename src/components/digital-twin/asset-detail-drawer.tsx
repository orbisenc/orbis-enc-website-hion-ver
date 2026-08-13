"use client";

import { statusLabel } from "@/lib/facility";
import type { Asset } from "@/types/facility";
import { ClipboardPlus, ExternalLink, History, RefreshCw, X } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export function AssetDetailDrawer({ asset, onClose }: { asset: Asset; onClose(): void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const details = [
    ["객체명", asset.name], ["시리얼번호", asset.serialNumber], ["설비 분류", asset.subtype], ["설치 위치", asset.locationLabel], ["현재 상태", statusLabel[asset.status]], ["설치일", asset.installedAt], ["사용 연수", `${asset.serviceYears}년`], ["교체주기", `${asset.replacementCycleYears}년`], ["예상 교체일", asset.expectedReplacementAt], ["다음 점검일", asset.nextInspectionAt], ["최근 점검 결과", asset.lastInspectionResult], ["최근 유지보수 내용", asset.latestMaintenanceSummary],
  ];
  return <aside className="facility-asset-drawer" aria-label={`${asset.name} 상세 정보`}>
    <header><div><small>{asset.serialNumber}</small><h3>{asset.name}</h3></div><button type="button" aria-label="객체 상세 닫기" onClick={onClose}><X size={18} /></button></header>
    <dl>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className="facility-drawer-actions"><Link href={`/inspections?action=new&assetId=${asset.id}`}><ClipboardPlus size={15} /> 점검 등록</Link><Link href="/maintenance"><History size={15} /> 유지보수 이력</Link><Link href="/replacement-review"><RefreshCw size={15} /> 교체 검토</Link><Link className="primary" href={`/assets/${asset.id}`}><ExternalLink size={15} /> 상세 페이지 보기</Link></div>
  </aside>;
}
