export type AssetCategory = "mechanical" | "electrical" | "fire" | "plumbing" | "security";
export type AssetStatus = "normal" | "attention" | "urgent" | "inspection" | "offline";
export type AssetPriority = "low" | "normal" | "high" | "urgent";
export type FacilityViewMode = "all" | "floor" | "system";
export type InspectionKind = "정기" | "수시";
export type InspectionStatus = "예정" | "진행" | "완료" | "지연";
export type FacilityRole = "플랫폼 관리자" | "관리사무소 책임자" | "시설 담당자" | "입주자대표회의" | "협력업체" | "입주민";
export type AssetImportance = "낮음" | "보통" | "높음" | "핵심";
export type WorkOrderStatus = "접수" | "분류" | "승인대기" | "배정" | "진행" | "검수요청" | "완료" | "종료" | "보류" | "취소";
export type WorkOrderSeverity = "낮음" | "보통" | "높음" | "긴급";

export interface Building {
  id: string;
  name: string;
  organization: string;
  address: string;
  spaceCount: number;
  assetCount: number;
  buildingCount?: number;
  unitCount?: number;
  totalAreaSquareMeters?: number;
  parkingSpaces?: number;
}

export interface Space {
  id: string;
  buildingId: string;
  name: string;
  floor: string;
  use: string;
  areaSquareMeters: number;
  assetCount: number;
}

export interface Position2D { left: number; top: number }
export interface Position3D { x: number; y: number; z: number }

export interface Asset {
  id: string;
  name: string;
  serialNumber: string;
  category: AssetCategory;
  subtype: string;
  buildingId: string;
  floor: string;
  room: string;
  locationLabel: string;
  status: AssetStatus;
  installedAt: string;
  serviceYears: number;
  replacementCycleYears: number;
  expectedReplacementAt: string;
  nextInspectionAt: string;
  lastInspectionResult: string;
  latestMaintenanceSummary: string;
  linkedTo3D: boolean;
  modelObjectName: string | null;
  position2D: Position2D;
  position3D: Position3D | null;
  priority: AssetPriority;
  assetCode: string;
  manufacturer: string;
  modelName: string;
  warrantyEndAt: string;
  inspectionCycle: string;
  importance: AssetImportance;
  healthScore: number;
  riskScore: number;
  lastInspectedAt: string;
  cumulativeMaintenanceCost: number;
  plannedReplacementCost: number;
  repeatedFailureCount: number;
  residentImpact: number;
  replacedAssetId?: string;
}

export interface Inspection {
  id: string;
  assetId: string;
  scheduledAt: string;
  type: string;
  kind: InspectionKind;
  assignee: string;
  status: InspectionStatus;
  checklist: string[];
  memo?: string;
  result?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  completedAt: string;
  title: string;
  contractor: string;
  costWon: number;
  description: string;
  attachmentName: string;
  status: "접수" | "진행" | "완료";
}

export interface ReplacementReview {
  id: string;
  assetId: string;
  reason: string;
  estimatedCostWon: number;
  dueDate: string;
  status: "검토 대기" | "검토 중" | "승인" | "보류";
  priority: AssetPriority;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "danger";
  createdAt: string;
  assetId?: string;
}

export interface BudgetSummary {
  year: number;
  plannedMillionWon: number;
  spentMillionWon: number;
  remainingMillionWon: number;
}

export interface SensorSnapshot {
  temperatureCelsius: number;
  humidityPercent: number;
  environmentStatus: "좋음" | "보통" | "주의";
  measuredAt: string;
  sources: string[];
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  severity: "info" | "warning" | "danger";
}

export interface AssetCategorySummary {
  id: AssetCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
}

export interface FacilityDashboardData {
  building: Building;
  sensor: SensorSnapshot;
  categorySummary: AssetCategorySummary[];
  assets: Asset[];
  inspections: Inspection[];
  maintenance: MaintenanceRecord[];
  replacementReviews: ReplacementReview[];
  budget: BudgetSummary;
  notifications: Notification[];
  alerts: Alert[];
  spaces: Space[];
}

export interface WorkOrderEvidence {
  id: string;
  phase: "작업 전" | "작업 중" | "작업 후";
  filename: string;
  recordedAt: string;
}

export interface WorkOrder {
  id: string;
  tenantId: string;
  assetId: string;
  sourceType: "점검" | "민원" | "알림" | "직접 등록";
  sourceId: string;
  title: string;
  description: string;
  severity: WorkOrderSeverity;
  status: WorkOrderStatus;
  assignee: string;
  vendor?: string;
  targetDate: string;
  slaHours: number;
  estimatedCostWon: number;
  actualCostWon: number;
  completionSummary?: string;
  evidence: WorkOrderEvidence[];
  createdAt: string;
  updatedAt: string;
}

export interface RiskScoreBreakdown {
  condition: number;
  repeatedFailures: number;
  criticality: number;
  maintenanceCost: number;
  residentImpact: number;
  overdue: number;
  total: number;
}

export interface AIInsight {
  id: string;
  title: string;
  severity: "정보" | "주의" | "경고";
  confidence: "보통" | "높음";
  assetIds: string[];
  evidence: string[];
  rule: string;
  ruleVersion: string;
  expectedImpact: string;
  recommendedAction: string;
  generatedAt: string;
  status: "신규" | "확인" | "조치 중" | "조치 완료" | "보류";
}
