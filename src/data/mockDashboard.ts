import type { Asset, AssetCategory, AssetStatus, FacilityDashboardData } from "@/types/facility";

type AssetSeed = Pick<Asset, "assetCode" | "name" | "category" | "subtype" | "floor" | "room" | "installedAt" | "status" | "importance" | "healthScore" | "riskScore" | "manufacturer" | "modelName" | "plannedReplacementCost" | "repeatedFailureCount" | "residentImpact">;

const coreAssets: AssetSeed[] = [
  { assetCode: "P-02", name: "지하주차장 배수펌프 P-02", category: "mechanical", subtype: "배수펌프", floor: "지하 2층", room: "배수펌프실", installedAt: "2018.03.12", status: "urgent", importance: "핵심", healthScore: 42, riskScore: 88, manufacturer: "한일펌프", modelName: "HDP-2200", plannedReplacementCost: 8_600_000, repeatedFailureCount: 4, residentImpact: 8 },
  { assetCode: "WP-01", name: "급수펌프 WP-01", category: "mechanical", subtype: "급수펌프", floor: "지하 1층", room: "기계실", installedAt: "2019.04.03", status: "attention", importance: "핵심", healthScore: 68, riskScore: 61, manufacturer: "윌로펌프", modelName: "HMI-804", plannedReplacementCost: 12_800_000, repeatedFailureCount: 2, residentImpact: 9 },
  { assetCode: "FP-01", name: "소방펌프 FP-01", category: "fire", subtype: "소방펌프", floor: "지하 1층", room: "소방펌프실", installedAt: "2017.11.22", status: "normal", importance: "핵심", healthScore: 82, riskScore: 38, manufacturer: "신신펌프", modelName: "SFP-300", plannedReplacementCost: 19_500_000, repeatedFailureCount: 1, residentImpact: 10 },
  { assetCode: "TK-01", name: "저수조 TK-01", category: "plumbing", subtype: "저수조", floor: "지하 2층", room: "저수조실", installedAt: "2017.11.22", status: "normal", importance: "핵심", healthScore: 84, riskScore: 32, manufacturer: "대한STS", modelName: "STS-600T", plannedReplacementCost: 42_000_000, repeatedFailureCount: 0, residentImpact: 10 },
  { assetCode: "SP-03", name: "오수펌프 SP-03", category: "plumbing", subtype: "오수펌프", floor: "지하 2층", room: "오수조", installedAt: "2018.03.12", status: "attention", importance: "높음", healthScore: 64, riskScore: 66, manufacturer: "한일펌프", modelName: "SSP-1500", plannedReplacementCost: 6_200_000, repeatedFailureCount: 3, residentImpact: 7 },
  { assetCode: "VF-04", name: "지하주차장 환기팬 VF-04", category: "mechanical", subtype: "환기팬", floor: "지하 2층", room: "104동 주차구역", installedAt: "2020.06.18", status: "attention", importance: "높음", healthScore: 70, riskScore: 58, manufacturer: "동우팬", modelName: "DVF-1250", plannedReplacementCost: 7_500_000, repeatedFailureCount: 2, residentImpact: 7 },
  { assetCode: "TR-01", name: "변압기 TR-01", category: "electrical", subtype: "몰드변압기", floor: "지하 1층", room: "전기실", installedAt: "2017.11.22", status: "normal", importance: "핵심", healthScore: 78, riskScore: 47, manufacturer: "효성중공업", modelName: "TR-1500KVA", plannedReplacementCost: 68_000_000, repeatedFailureCount: 1, residentImpact: 10 },
  { assetCode: "GEN-01", name: "비상발전기 GEN-01", category: "electrical", subtype: "비상발전기", floor: "지하 1층", room: "발전기실", installedAt: "2017.11.22", status: "normal", importance: "핵심", healthScore: 86, riskScore: 29, manufacturer: "두산모트롤", modelName: "D1146T", plannedReplacementCost: 95_000_000, repeatedFailureCount: 0, residentImpact: 10 },
  { assetCode: "FA-01", name: "소방수신반 FA-01", category: "fire", subtype: "R형 수신기", floor: "지상 1층", room: "방재실", installedAt: "2021.02.09", status: "normal", importance: "핵심", healthScore: 91, riskScore: 21, manufacturer: "한국소방", modelName: "R-3200", plannedReplacementCost: 22_000_000, repeatedFailureCount: 0, residentImpact: 10 },
  { assetCode: "EL-101-01", name: "101동 승강기 EL-101-01", category: "mechanical", subtype: "승강기", floor: "전 층", room: "101동 승강로", installedAt: "2017.11.22", status: "normal", importance: "핵심", healthScore: 80, riskScore: 44, manufacturer: "현대엘리베이터", modelName: "WBLX-1050", plannedReplacementCost: 165_000_000, repeatedFailureCount: 1, residentImpact: 10 },
  { assetCode: "C-117", name: "지하주차장 CCTV C-117", category: "security", subtype: "CCTV", floor: "지하 2층", room: "107동 주차구역", installedAt: "2022.08.10", status: "normal", importance: "높음", healthScore: 92, riskScore: 18, manufacturer: "한화비전", modelName: "QNO-8080R", plannedReplacementCost: 780_000, repeatedFailureCount: 0, residentImpact: 6 },
  { assetCode: "PG-01", name: "주차차단기 PG-01", category: "security", subtype: "주차차단기", floor: "지상 1층", room: "정문", installedAt: "2020.09.28", status: "inspection", importance: "높음", healthScore: 57, riskScore: 70, manufacturer: "아마노코리아", modelName: "APG-210", plannedReplacementCost: 9_800_000, repeatedFailureCount: 3, residentImpact: 8 },
  { assetCode: "EV-B2-08", name: "전기차 충전기 EV-B2-08", category: "electrical", subtype: "전기차 충전기", floor: "지하 2층", room: "충전구역", installedAt: "2024.05.14", status: "normal", importance: "보통", healthScore: 95, riskScore: 11, manufacturer: "채비", modelName: "CAV-7K", plannedReplacementCost: 2_400_000, repeatedFailureCount: 0, residentImpact: 5 },
  { assetCode: "AC-103", name: "103동 출입통제기 AC-103", category: "security", subtype: "출입통제기", floor: "지상 1층", room: "103동 공동현관", installedAt: "2021.07.07", status: "normal", importance: "높음", healthScore: 89, riskScore: 22, manufacturer: "코맥스", modelName: "CDL-710", plannedReplacementCost: 3_200_000, repeatedFailureCount: 0, residentImpact: 7 },
  { assetCode: "RF-105", name: "105동 옥상 방수구역 RF-105", category: "plumbing", subtype: "옥상 방수", floor: "옥상", room: "105동 옥상", installedAt: "2017.11.22", status: "attention", importance: "높음", healthScore: 62, riskScore: 64, manufacturer: "삼화방수", modelName: "URE-PLUS", plannedReplacementCost: 38_000_000, repeatedFailureCount: 2, residentImpact: 8 },
  { assetCode: "PL-01", name: "놀이터 시설 PL-01", category: "security", subtype: "어린이놀이시설", floor: "지상 1층", room: "중앙광장", installedAt: "2023.04.20", status: "normal", importance: "높음", healthScore: 93, riskScore: 16, manufacturer: "아이꿈터", modelName: "HION-PLAY-8", plannedReplacementCost: 48_000_000, repeatedFailureCount: 0, residentImpact: 9 },
];

const categoryCodes: Record<AssetCategory, string> = { mechanical: "ME", electrical: "EL", fire: "FI", plumbing: "PL", security: "SE" };
const genericNames: Array<[string, AssetCategory, string]> = [
  ["승강기", "mechanical", "승강기"], ["주차장 환기팬", "mechanical", "환기팬"], ["급수 부스터펌프", "mechanical", "급수펌프"], ["배수펌프", "mechanical", "배수펌프"],
  ["동력분전반", "electrical", "분전반"], ["전기차 충전기", "electrical", "전기차 충전기"], ["공용부 조명제어반", "electrical", "조명제어"], ["태양광 인버터", "electrical", "인버터"],
  ["옥내소화전", "fire", "옥내소화전"], ["스프링클러 알람밸브", "fire", "알람밸브"], ["방화문", "fire", "방화문"], ["제연댐퍼", "fire", "제연설비"],
  ["생활급수 입상관", "plumbing", "급수배관"], ["오수 입상관", "plumbing", "오수배관"], ["우수 집수정", "plumbing", "집수정"], ["옥상 배수구역", "plumbing", "옥상방수"],
  ["공동현관 출입통제기", "security", "출입통제기"], ["주차장 CCTV", "security", "CCTV"], ["비상방송 스피커", "security", "비상방송"], ["무인택배함", "security", "무인택배함"],
];

const generatedAssets: AssetSeed[] = Array.from({ length: 32 }, (_, index) => {
  const building = 101 + (index % 8);
  const [label, category, subtype] = genericNames[index % genericNames.length]!;
  const installedYear = 2018 + (index % 7);
  const attention = index === 6;
  return {
    assetCode: `${categoryCodes[category]}-${String(index + 17).padStart(3, "0")}`,
    name: `${building}동 ${label} ${String((index % 4) + 1).padStart(2, "0")}`,
    category,
    subtype,
    floor: index % 5 === 0 ? "지하 2층" : index % 5 === 1 ? "지하 1층" : index % 5 === 2 ? "지상 1층" : index % 5 === 3 ? "옥상" : "전 층",
    room: `${building}동 ${subtype} 구역`,
    installedAt: `${installedYear}.0${(index % 8) + 1}.15`,
    status: attention ? "offline" : "normal",
    importance: index % 6 === 0 ? "핵심" : index % 3 === 0 ? "높음" : "보통",
    healthScore: attention ? 49 : 76 + (index % 20),
    riskScore: attention ? 76 : 12 + (index % 34),
    manufacturer: ["한빛기전", "우리설비", "세이프텍", "스마트원"][index % 4]!,
    modelName: `HSP-${categoryCodes[category]}-${100 + index}`,
    plannedReplacementCost: 1_500_000 + index * 850_000,
    repeatedFailureCount: attention ? 3 : index % 3,
    residentImpact: 3 + (index % 8),
  };
});

function yearsSince(date: string) {
  return Math.max(0, 2026 - Number(date.slice(0, 4)));
}

function categoryLocationCode(seed: AssetSeed, index: number) {
  if (/10\d동/.test(seed.name)) return seed.name.slice(0, 4).replace("동", "D");
  if (seed.floor.includes("지하 2")) return "B2MR";
  if (seed.floor.includes("지하 1")) return "B1MR";
  if (seed.floor === "옥상") return "ROOF";
  return `COM${String(index + 1).padStart(2, "0")}`;
}

export const apartmentAssets: Asset[] = [...coreAssets, ...generatedAssets].map((seed, index) => {
  const installYear = Number(seed.installedAt.slice(0, 4));
  const replacementYears = seed.subtype.includes("배관") || seed.subtype.includes("방수") ? 15 : seed.subtype.includes("승강기") ? 18 : 10;
  const id = `HION-HSP01-${categoryCodes[seed.category]}-${seed.subtype.replace(/[^가-힣A-Z0-9]/g, "").slice(0, 5).toUpperCase()}-${categoryLocationCode(seed, index)}-${installYear}-${String(index + 1).padStart(3, "0")}`;
  const buildingNumber = 101 + (index % 8);
  return {
    id,
    assetCode: seed.assetCode,
    name: seed.name,
    serialNumber: `SN-HSP-${String(index + 1).padStart(5, "0")}`,
    category: seed.category,
    subtype: seed.subtype,
    buildingId: `building-${buildingNumber}`,
    floor: seed.floor,
    room: seed.room,
    locationLabel: seed.room,
    status: seed.status as AssetStatus,
    installedAt: seed.installedAt,
    serviceYears: yearsSince(seed.installedAt),
    replacementCycleYears: replacementYears,
    expectedReplacementAt: `${installYear + replacementYears}.${seed.installedAt.slice(5)}`,
    nextInspectionAt: `2026.${String(7 + (index % 3)).padStart(2, "0")}.${String(22 + (index % 7)).padStart(2, "0")}`,
    lastInspectionResult: seed.status === "normal" ? "정상" : seed.status === "urgent" ? "기준 초과" : "주의 관찰",
    latestMaintenanceSummary: index % 3 === 0 ? "소모품 교체 및 운전 상태 확인" : "외관·작동 상태 정기 확인",
    linkedTo3D: true,
    modelObjectName: `HSP_${categoryCodes[seed.category]}_${String(index + 1).padStart(3, "0")}`,
    position2D: { left: 10 + (index % 8) * 11.2, top: 18 + Math.floor(index / 8) * 12.5 },
    position3D: { x: -10.5 + (index % 8) * 3, y: 0.8 + (index % 5) * 0.9, z: -3.2 + Math.floor(index / 8) * 1.25 },
    priority: seed.riskScore >= 80 ? "urgent" : seed.riskScore >= 58 ? "high" : "normal",
    manufacturer: seed.manufacturer,
    modelName: seed.modelName,
    warrantyEndAt: `${installYear + 3}.${seed.installedAt.slice(5)}`,
    inspectionCycle: seed.importance === "핵심" ? "매월" : seed.importance === "높음" ? "분기" : "반기",
    importance: seed.importance,
    healthScore: seed.healthScore,
    riskScore: seed.riskScore,
    lastInspectedAt: `2026.0${5 + (index % 2)}.${String(10 + (index % 16)).padStart(2, "0")}`,
    cumulativeMaintenanceCost: 180_000 + index * 127_000 + seed.repeatedFailureCount * 420_000,
    plannedReplacementCost: seed.plannedReplacementCost,
    repeatedFailureCount: seed.repeatedFailureCount,
    residentImpact: seed.residentImpact,
  };
});

const categoryMeta: Record<AssetCategory, { label: string; color: string }> = {
  mechanical: { label: "기계·급배수", color: "#19BDE2" },
  electrical: { label: "전기·발전", color: "#0B63CE" },
  fire: { label: "소방·안전", color: "#DC2626" },
  plumbing: { label: "배관·방수", color: "#15803D" },
  security: { label: "주차·보안", color: "#7C3AED" },
};

const categorySummary = (Object.keys(categoryMeta) as AssetCategory[]).map((category) => {
  const count = apartmentAssets.filter((asset) => asset.category === category).length;
  return { id: category, label: categoryMeta[category].label, count, percentage: Number((count / apartmentAssets.length * 100).toFixed(1)), color: categoryMeta[category].color };
});

export const mockDashboardData: FacilityDashboardData = {
  building: {
    id: "hsp01",
    name: "HION 스마트파크",
    organization: "HION Apartment OS",
    address: "전라남도 순천시 미래로 21",
    spaceCount: 186,
    assetCount: apartmentAssets.length,
    buildingCount: 8,
    unitCount: 864,
    totalAreaSquareMeters: 82_123,
    parkingSpaces: 1_024,
  },
  sensor: { temperatureCelsius: 27, humidityPercent: 61, environmentStatus: "좋음", measuredAt: "2026.07.21 (화) 15:30", sources: ["BMS", "FMS", "IoT 센서"] },
  categorySummary,
  assets: apartmentAssets,
  inspections: apartmentAssets.slice(0, 18).map((asset, index) => ({
    id: `inspection-${index + 1}`,
    assetId: asset.id,
    scheduledAt: asset.nextInspectionAt,
    type: `${asset.name} ${index % 4 === 0 ? "성능" : "정기"}점검`,
    kind: index % 5 === 0 ? "수시" : "정기",
    assignee: index % 3 === 0 ? "김시설" : index % 3 === 1 ? "박기술" : "안전관리팀",
    status: index === 4 ? "진행" : index === 7 ? "지연" : "예정",
    checklist: ["외관 손상과 누수 여부", "운전 소음·진동 상태", "계측값 허용 범위"],
    memo: "점검 전 안전 조치와 입주민 안내 여부를 확인합니다.",
    createdAt: "2026.07.01 09:00",
    updatedAt: "2026.07.21 14:20",
  })),
  maintenance: apartmentAssets.map((asset, index) => ({
    id: `maintenance-${index + 1}`,
    assetId: asset.id,
    completedAt: `2026.0${4 + (index % 3)}.${String(5 + (index % 20)).padStart(2, "0")}`,
    title: `${asset.name} 예방정비`,
    contractor: index % 2 === 0 ? "한빛시설관리" : "우리종합설비",
    costWon: 180_000 + index * 42_000,
    description: "점검 기준서에 따라 외관, 운전 상태와 안전장치를 확인하고 결과를 자산 이력에 기록했습니다.",
    attachmentName: `${asset.assetCode}_정비완료사진.pdf`,
    status: "완료",
  })),
  replacementReviews: apartmentAssets.filter((asset) => asset.riskScore >= 58).map((asset, index) => ({
    id: `review-${index + 1}`,
    assetId: asset.id,
    reason: asset.repeatedFailureCount >= 3 ? "반복 고장과 유지비 증가" : "건전도 저하 및 권장 교체일 접근",
    estimatedCostWon: asset.plannedReplacementCost,
    dueDate: asset.expectedReplacementAt,
    status: index === 0 ? "검토 중" : "검토 대기",
    priority: asset.riskScore >= 80 ? "urgent" : "high",
  })),
  budget: { year: 2026, plannedMillionWon: 1_200, spentMillionWon: 745, remainingMillionWon: 455 },
  notifications: [
    { id: "notification-1", title: "배수펌프 긴급 조치", description: "P-02 진동값이 허용 범위를 초과했습니다.", createdAt: "10분 전", read: false, severity: "danger" },
    { id: "notification-2", title: "점검 기한 임박", description: "이번 주 정기점검 7건이 예정되어 있습니다.", createdAt: "1시간 전", read: false, severity: "warning" },
    { id: "notification-3", title: "전기차 충전기 연동", description: "충전기 16대의 통신 상태가 정상입니다.", createdAt: "2시간 전", read: false, severity: "info" },
  ],
  alerts: [
    { id: "alert-1", title: "배수펌프 진동 기준 초과", message: "지하 2층 P-02의 즉시 점검과 작업지시가 필요합니다.", severity: "danger", createdAt: "2026.07.21 15:20", assetId: apartmentAssets[0]!.id },
    { id: "alert-2", title: "주차차단기 통신 중단", message: "정문 PG-01의 제어기 통신 상태를 확인해 주세요.", severity: "warning", createdAt: "2026.07.21 14:05", assetId: apartmentAssets[11]!.id },
  ],
  spaces: Array.from({ length: 8 }, (_, index) => ({ id: `space-${index + 1}`, buildingId: `building-${101 + index}`, name: `${101 + index}동 공용부`, floor: "전 층", use: "주거동 공용시설", areaSquareMeters: 7_880 + index * 310, assetCount: apartmentAssets.filter((asset) => asset.buildingId === `building-${101 + index}`).length })),
};
