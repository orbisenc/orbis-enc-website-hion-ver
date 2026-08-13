import Link from "next/link";
import { redirect } from "next/navigation";

import { readAdminSession } from "@/server/auth/session";
import { campaignStateKo, listDemoCampaigns } from "@/server/demo/agenda-campaign-store";
import { getDashboard } from "@/server/demo/store";

const modeKo = { OPINION: "의견 수렴", MANAGEMENT_VOTE: "관리 의결", LEGAL_CONSENT: "법적 동의" } as const;

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ query?: string; state?: string }> }) {
  const session = await readAdminSession();
  if (!session) redirect("/admin/login");
  const filters = await searchParams;
  const allCampaigns = listDemoCampaigns(session.tenantId);
  const campaigns = allCampaigns.filter((item) => (!filters.query || item.nameKo.includes(filters.query)) && (!filters.state || item.status === filters.state));
  const dashboard = getDashboard();
  return <>
    <div className="page-heading"><div><h1>안건 현황 관리</h1><p className="muted">게시 안건의 대상 명부, 기간, 본인확인, 정족수와 진행 상태를 운영합니다.</p></div><Link className="btn btn-primary" href="/admin/campaigns/demo-campaign">진행 현황 열기</Link></div>
    <section className="stats"><div className="stat"><span>진행 중</span><strong>{allCampaigns.filter((item) => item.status === "OPEN").length}건</strong></div><div className="stat"><span>전체 대상 권리</span><strong>{dashboard.total.toLocaleString("ko-KR")}개</strong></div><div className="stat"><span>누적 응답</span><strong>{dashboard.responded.toLocaleString("ko-KR")}명</strong></div><div className="stat"><span>발송 확인 필요</span><strong>{dashboard.failed}명</strong></div></section>
    <form className="filter-grid"><label>안건 검색<input className="field" name="query" defaultValue={filters.query ?? ""} placeholder="현황 관리명으로 검색" /></label><label>운영 상태<select className="field" name="state" defaultValue={filters.state ?? ""}><option value="">전체</option><option value="DRAFT">초안</option><option value="SCHEDULED">예약</option><option value="OPEN">진행 중</option><option value="PAUSED">일시중지</option><option value="CLOSED">마감</option><option value="FINALIZED">결과 확정</option></select></label><button className="btn">검색 적용</button><Link className="btn" href="/admin/campaigns">초기화</Link></form>
    <div className="table-wrap"><table><thead><tr><th>안건 현황명</th><th>운영 모드</th><th>상태</th><th>기간</th><th>대상 권리</th><th>응답률</th><th>관리</th></tr></thead><tbody>{campaigns.map((campaign) => <tr key={campaign.id}><td><strong>{campaign.nameKo}</strong><br/><small>{campaign.rosterVersionKo}</small></td><td>{modeKo[campaign.mode]}</td><td><span className="pill">{campaignStateKo(campaign.status)}</span></td><td>{new Date(campaign.startsAt).toLocaleDateString("ko-KR")} ~ {new Date(campaign.endsAt).toLocaleDateString("ko-KR")}</td><td>{dashboard.total.toLocaleString("ko-KR")}개</td><td>{Math.round(dashboard.responded / dashboard.total * 100)}%</td><td><Link className="btn" href={`/admin/campaigns/${campaign.id}`}>상세 관리</Link></td></tr>)}</tbody></table></div>
    {campaigns.length === 0 && <p className="empty-state">조건에 맞는 안건 현황이 없습니다.</p>}
    <section className="card" style={{ marginTop: 20 }}><strong>법적 동의 모드는 기본 비활성화되어 있습니다.</strong><p className="muted">법률 검토와 적격 본인확인·전자서명 서비스 연결이 완료된 운영 환경에서만 활성화할 수 있습니다.</p></section>
  </>;
}
