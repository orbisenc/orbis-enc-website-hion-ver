import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ReportDownloads } from "@/components/admin/report-downloads";
import { readAdminSession } from "@/server/auth/session";
import { campaignStateKo, getDemoCampaignRecord } from "@/server/demo/agenda-campaign-store";
import { getDashboard } from "@/server/demo/store";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  const { id } = await params;
  let campaign;
  try { campaign = getDemoCampaignRecord(session.tenantId, id); } catch { notFound(); }
  const dashboard = getDashboard();
  const responseRate = Math.round(dashboard.responded / dashboard.total * 1000) / 10;
  const validVotes = dashboard.consent + dashboard.oppose;
  const approvalRate = validVotes ? Math.round(dashboard.consent / validVotes * 1000) / 10 : 0;
  return <><p className="muted"><Link href={`/admin/campaigns/${id}`}>안건 현황 관리</Link> / 결과·증거</p><h1>결과·증거 보고서</h1><p className="muted">현재 상태: {campaignStateKo(campaign.status)} · 결과 확정 전 수치는 실시간 참고값입니다.</p><section className="stats"><div className="stat"><span>전체 응답</span><strong>{dashboard.responded.toLocaleString("ko-KR")}명</strong></div><div className="stat"><span>동의</span><strong>{dashboard.consent.toLocaleString("ko-KR")}명</strong></div><div className="stat"><span>반대</span><strong>{dashboard.oppose.toLocaleString("ko-KR")}명</strong></div><div className="stat"><span>기권</span><strong>{dashboard.abstain.toLocaleString("ko-KR")}명</strong></div></section><section className="dashboard-grid"><article className="card"><h2>정족수</h2><p><strong>{responseRate}%</strong> · 기준 {campaign.quorumPercentage}%</p><p className={responseRate >= campaign.quorumPercentage ? "success" : "error"}>{responseRate >= campaign.quorumPercentage ? "응답 정족수 충족" : "응답 정족수 미충족"}</p></article><article className="card"><h2>찬성 기준</h2><p><strong>{approvalRate}%</strong> · 기준 {campaign.approvalPercentage}%</p><p className={approvalRate >= campaign.approvalPercentage ? "success" : "error"}>{approvalRate >= campaign.approvalPercentage ? "찬성 기준 충족" : "찬성 기준 미충족"}</p></article></section><ReportDownloads campaignId={id} /><section className="card" style={{ marginTop: 18 }}><h2>증거 포함 범위</h2><ul><li>안건·동의문·콘텐츠 버전과 해시</li><li>영수증 번호, 제출 시각과 응답 변경 연결</li><li>내보내기 목적과 처리 시각</li></ul><p className="muted">법적 효력을 자동 보장하지 않으며 운영 전 법률 검토와 적격 공급자 연결이 필요합니다.</p></section></>;
}
