import type { AIInsight, Asset } from "@/types/facility";

export function generateFacilityInsights(assets: Asset[], generatedAt = "2026.07.21 15:30"): AIInsight[] {
  const repeated = assets.filter((asset) => asset.repeatedFailureCount >= 3);
  const overdue = assets.filter((asset) => new Date(asset.nextInspectionAt.replaceAll(".", "-") + "T00:00:00+09:00") < new Date("2026-07-21T00:00:00+09:00"));
  const replacement = assets.filter((asset) => asset.riskScore >= 65);
  const insights: AIInsight[] = [];
  if (repeated.length) insights.push({ id: "insight-repeated-failure", title: "반복 고장 설비 집중 점검 필요", severity: "경고", confidence: "높음", assetIds: repeated.map((asset) => asset.id), evidence: repeated.map((asset) => `${asset.name}: 최근 반복 고장 ${asset.repeatedFailureCount}회`), rule: "최근 12개월 고장 이력이 3회 이상인 자산을 탐지", ruleVersion: "FAC-RULE-1.2", expectedImpact: "돌발 정지와 입주민 불편 가능성 증가", recommendedAction: "원인 분석 후 부분보수와 전면교체 시나리오를 비교하세요.", generatedAt, status: "신규" });
  if (overdue.length) insights.push({ id: "insight-overdue", title: "점검 기한 초과 자산", severity: "주의", confidence: "높음", assetIds: overdue.map((asset) => asset.id), evidence: overdue.map((asset) => `${asset.name}: 다음 점검일 ${asset.nextInspectionAt}`), rule: "기준일보다 다음 점검일이 이른 자산을 탐지", ruleVersion: "FAC-RULE-1.1", expectedImpact: "법정·정기점검 누락 위험", recommendedAction: "담당자를 지정하고 현장 점검 일정을 확정하세요.", generatedAt, status: "신규" });
  if (replacement.length) insights.push({ id: "insight-replacement", title: "교체 검토 우선순위 상승", severity: "주의", confidence: "보통", assetIds: replacement.map((asset) => asset.id), evidence: replacement.map((asset) => `${asset.name}: 위험점수 ${asset.riskScore}점, 건전도 ${asset.healthScore}점`), rule: "위험점수 65점 이상 또는 건전도 55점 미만", ruleVersion: "FAC-RULE-2.0", expectedImpact: "유지비 증가와 서비스 중단 가능성", recommendedAction: "장기수선계획 반영 여부를 검토하세요.", generatedAt, status: "신규" });
  return insights;
}
