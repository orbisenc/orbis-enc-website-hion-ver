import { OperationsPage } from "@/components/facility/operations-page";
import { mockDashboardData } from "@/data/mockDashboard";
import { formatWon } from "@/lib/facility";

export default function MaintenancePage() { return <OperationsPage title="유지보수 이력" subtitle="시설별 작업 내용, 계약업체, 비용과 증빙을 조회합니다." primaryAction="유지보수 등록" columns={[{key:"date",label:"완료일"},{key:"name",label:"작업명"},{key:"asset",label:"객체"},{key:"contractor",label:"업체"},{key:"cost",label:"비용"},{key:"attachment",label:"첨부"},{key:"status",label:"상태"}]} rows={mockDashboardData.maintenance.map((item) => ({ id: item.id, date: item.completedAt, name: item.title, asset: mockDashboardData.assets.find((asset) => asset.id === item.assetId)?.name ?? "공용 설비", contractor: item.contractor, cost: formatWon(item.costWon), attachment: item.attachmentName, status: item.status }))} />; }
