import { DigitalTwinViewer } from "@/components/digital-twin/digital-twin-viewer";
import { Cuboid, Info } from "lucide-react";

export function AssetMapPage() {
  return <div className="facility-page facility-asset-map-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">공간 기반 자산 탐색</span><h1>3D 자산맵</h1><p>8개 주거동과 지하 공용부의 설비를 상태·계통·층으로 탐색합니다.</p></div><div className="facility-map-legend" aria-label="자산 상태 범례"><span><i className="normal" />정상</span><span><i className="attention" />주의</span><span><i className="urgent" />경고</span><span><i className="offline" />정지</span></div></div>
    <div className="facility-map-guidance"><Cuboid size={18} /><strong>자산과 3D 객체가 같은 고유 ID로 연결됩니다.</strong><span>마커를 선택하면 상세·점검·작업지시·교체 검토로 이어집니다.</span><Info size={16} /></div>
    <div className="facility-map-viewer"><DigitalTwinViewer /></div>
  </div>;
}
