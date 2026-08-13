import Link from "next/link";
import { formatKoreanNumber } from "@/lib/format/ko";
import { getDashboard } from "@/server/demo/store";
import { getDemoCampaignRecord, campaignStateKo } from "@/server/demo/agenda-campaign-store";

export default function DashboardPage() {
  const data = getDashboard();
  const campaign = getDemoCampaignRecord("hion-demo");
  const complexResponses = [{ name: "해오름 아파트", responded: data.responded, total: data.total }];
  const stats = [["전체 대상 권리", data.total], ["전달", data.delivered], ["열람", data.opened], ["본인 확인", data.verified], ["전체 응답", data.responded], ["동의", data.consent], ["반대", data.oppose], ["기권", data.abstain], ["발송 실패", data.failed]] as const;
  return <>
    <p className="pill">{campaignStateKo(campaign.status)} 안건 1건</p><h1>안건 현황</h1>
    <p className="muted">{new Date(campaign.endsAt).toLocaleDateString("ko-KR")} 마감 · {campaign.nameKo}</p>
    <section className="stats" aria-label="응답 현황">{stats.map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{formatKoreanNumber(value)}명</strong></div>)}</section>
    <h2 style={{ marginTop: 32 }}>단지별 누적 응답</h2>
    <div className="card" aria-label="단지별 누적 응답 막대 차트">
      {complexResponses.map((complex) => {
        const rate = Math.round(complex.responded / complex.total * 100);
        return <div key={complex.name} style={{ display: "grid", gridTemplateColumns: "140px 1fr 120px", gap: 10, margin: "10px 0", alignItems: "center" }}><strong>{complex.name}</strong><span style={{ background: "#e7edf4", borderRadius: 5 }}><span style={{ display: "block", width: `${rate}%`, height: 20, background: "#19bce4", borderRadius: 5 }} /></span><span>{formatKoreanNumber(complex.responded)}명 · {rate}%</span></div>;
      })}
    </div>
    <h2 style={{ marginTop: 32 }}>진행 안건</h2>
    <div className="table-wrap"><table><thead><tr><th>안건</th><th>상태</th><th>응답률</th><th>마감일</th><th>관리</th></tr></thead><tbody><tr><td>{campaign.nameKo}</td><td><span className="pill">{campaignStateKo(campaign.status)}</span></td><td>{Math.round(data.responded / data.total * 100)}%</td><td>{new Date(campaign.endsAt).toLocaleDateString("ko-KR")}</td><td><Link className="btn" href="/admin/campaigns/demo-campaign">상세 보기</Link></td></tr></tbody></table></div>
  </>;
}
