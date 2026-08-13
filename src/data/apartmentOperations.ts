import { apartmentAssets } from "@/data/mockDashboard";
import { generateFacilityInsights } from "@/server/services/facility-insight-service";
import type { AIInsight, WorkOrder } from "@/types/facility";

const asset = (index: number) => apartmentAssets[index]!;

export const initialWorkOrders: WorkOrder[] = [
  {
    id: "WO-2026-0721-001", tenantId: "hion-demo", assetId: asset(0).id, sourceType: "점검", sourceId: "inspection-abnormal-001",
    title: "배수펌프 P-02 진동 기준 초과 조치", description: "정기점검에서 베어링 진동 9.2mm/s가 확인되어 허용 기준 7.1mm/s를 초과했습니다.",
    severity: "긴급", status: "진행", assignee: "박기술", vendor: "한빛시설관리", targetDate: "2026.07.22", slaHours: 4,
    estimatedCostWon: 1_800_000, actualCostWon: 0, evidence: [{ id: "evidence-1", phase: "작업 전", filename: "P-02_진동측정.jpg", recordedAt: "2026.07.21 10:20" }], createdAt: "2026.07.21 10:25", updatedAt: "2026.07.21 13:40",
  },
  {
    id: "WO-2026-0719-004", tenantId: "hion-demo", assetId: asset(11).id, sourceType: "알림", sourceId: "alert-pg-01",
    title: "정문 주차차단기 통신 복구", description: "관제 서버와 차단기 제어기 사이 통신이 간헐적으로 중단됩니다.",
    severity: "높음", status: "배정", assignee: "김시설", vendor: "스마트원", targetDate: "2026.07.23", slaHours: 24,
    estimatedCostWon: 650_000, actualCostWon: 0, evidence: [], createdAt: "2026.07.19 17:05", updatedAt: "2026.07.20 09:10",
  },
  {
    id: "WO-2026-0717-008", tenantId: "hion-demo", assetId: asset(4).id, sourceType: "민원", sourceId: "complaint-2026-118",
    title: "오수펌프 악취 및 소음 확인", description: "105동 입주민 민원과 연계하여 오수펌프 운전 소음을 점검합니다.",
    severity: "보통", status: "검수요청", assignee: "박기술", vendor: "우리종합설비", targetDate: "2026.07.21", slaHours: 48,
    estimatedCostWon: 920_000, actualCostWon: 870_000, completionSummary: "역류방지밸브와 방진고무를 교체하고 시운전 결과 정상 범위를 확인했습니다.",
    evidence: [{ id: "evidence-2", phase: "작업 전", filename: "SP-03_작업전.jpg", recordedAt: "2026.07.18 10:00" }, { id: "evidence-3", phase: "작업 후", filename: "SP-03_작업후.jpg", recordedAt: "2026.07.20 16:40" }], createdAt: "2026.07.17 11:30", updatedAt: "2026.07.20 16:45",
  },
  {
    id: "WO-2026-0715-012", tenantId: "hion-demo", assetId: asset(5).id, sourceType: "점검", sourceId: "inspection-6",
    title: "환기팬 VF-04 벨트 장력 조정", description: "팬 벨트 미끄러짐 소음과 풍량 저하를 보수합니다.", severity: "보통", status: "완료", assignee: "김시설", vendor: "한빛시설관리", targetDate: "2026.07.18", slaHours: 72,
    estimatedCostWon: 480_000, actualCostWon: 420_000, completionSummary: "벨트 교체와 풀리 정렬 후 풍량을 재측정했습니다.",
    evidence: [{ id: "evidence-4", phase: "작업 후", filename: "VF-04_완료.jpg", recordedAt: "2026.07.18 15:20" }], createdAt: "2026.07.15 09:05", updatedAt: "2026.07.18 17:00",
  },
  {
    id: "WO-2026-0712-016", tenantId: "hion-demo", assetId: asset(14).id, sourceType: "민원", sourceId: "complaint-2026-104",
    title: "105동 옥상 누수 흔적 조사", description: "최상층 계단실 천장 얼룩 발생 구간의 방수층 상태를 조사합니다.", severity: "높음", status: "승인대기", assignee: "김시설", targetDate: "2026.07.25", slaHours: 72,
    estimatedCostWon: 3_600_000, actualCostWon: 0, evidence: [{ id: "evidence-5", phase: "작업 전", filename: "105동_누수흔적.jpg", recordedAt: "2026.07.12 14:30" }], createdAt: "2026.07.12 15:10", updatedAt: "2026.07.15 10:00",
  },
];

export const initialInsights: AIInsight[] = generateFacilityInsights(apartmentAssets);

export const projects = [
  { id: "project-1", name: "지하주차장 배수설비 개선공사", asset: asset(0).name, vendor: "한빛시설관리", budget: "86,000,000원", progress: "35%", status: "진행" },
  { id: "project-2", name: "105동 옥상 방수 보강공사", asset: asset(14).name, vendor: "우리종합설비", budget: "38,000,000원", progress: "입찰 준비", status: "검토 중" },
  { id: "project-3", name: "전기차 충전기 12대 증설", asset: asset(12).name, vendor: "채비", budget: "72,000,000원", progress: "100%", status: "완료" },
];

export const complaints = [
  { id: "complaint-2026-118", name: "105동 지하주차장 악취", location: "105동 지하 2층", category: "환경·악취", receivedAt: "2026.07.17", assetId: asset(4).id, status: "처리 중", publicProgress: "오수펌프 부품 교체 후 효과를 확인하고 있습니다." },
  { id: "complaint-2026-114", name: "정문 차량 출입 지연", location: "정문", category: "주차", receivedAt: "2026.07.19", assetId: asset(11).id, status: "작업 배정", publicProgress: "차단기 통신 장비 점검을 배정했습니다." },
  { id: "complaint-2026-104", name: "105동 최상층 천장 얼룩", location: "105동 20층", category: "누수", receivedAt: "2026.07.12", assetId: asset(14).id, status: "검토 중", publicProgress: "옥상 방수층 조사 결과를 검토하고 있습니다." },
];

export const notices = [
  { id: "notice-1", title: "지하주차장 배수펌프 긴급정비 안내", audience: "전체 입주민", period: "2026.07.21~2026.07.22", importance: "긴급", status: "게시" },
  { id: "notice-2", title: "전기차 충전구역 이용수칙 안내", audience: "충전기 이용 세대", period: "2026.07.15~2026.08.15", importance: "일반", status: "게시" },
];

export const documents = [
  { id: "document-1", name: "배수펌프 P-02 정기점검표", type: "점검서", related: asset(0).name, version: "v3", visibility: "관리사무소", uploadedAt: "2026.07.21" },
  { id: "document-2", name: "지하주차장 배수설비 개선 견적서", type: "견적서", related: "지하주차장 배수설비 개선공사", version: "v2", visibility: "입주자대표회의", uploadedAt: "2026.07.20" },
  { id: "document-3", name: "2026년 장기수선계획 검토자료", type: "회의자료", related: "7월 정기회의", version: "v1", visibility: "공개", uploadedAt: "2026.07.18" },
];
