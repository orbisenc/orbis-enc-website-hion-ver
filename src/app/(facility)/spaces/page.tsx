import { OperationsPage } from "@/components/facility/operations-page";
import { mockDashboardData } from "@/data/mockDashboard";

export default function SpacesPage() { return <OperationsPage title="등록 공간" subtitle="건물의 층별 공간과 연결된 시설 객체를 관리합니다." primaryAction="공간 등록" columns={[{key:"name",label:"공간명"},{key:"floor",label:"층"},{key:"use",label:"용도"},{key:"area",label:"면적"},{key:"assetCount",label:"연결 객체"},{key:"status",label:"상태"}]} rows={mockDashboardData.spaces.map((space) => ({ id: space.id, name: space.name, floor: space.floor, use: space.use, area: `${space.areaSquareMeters.toLocaleString()}㎡`, assetCount: `${space.assetCount}개`, status: "정상" }))} />; }
