"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { FollowUpButton, type FollowUpNotification } from "@/components/admin/follow-up-button";
import type { AgendaCampaignAudit, DemoCampaignRecord } from "@/server/demo/agenda-campaign-store";

interface DashboardValue { total: number; delivered: number; opened: number; verified: number; responded: number; consent: number; oppose: number; abstain: number; failed: number }
const stateKo = { DRAFT: "초안", SCHEDULED: "예약", OPEN: "진행 중", PAUSED: "일시중지", CLOSED: "마감", FINALIZED: "결과 확정", ARCHIVED: "보관" } as const;
const modeKo = { OPINION: "의견 수렴", MANAGEMENT_VOTE: "관리 의결", LEGAL_CONSENT: "법적 동의" } as const;

function localDateTime(iso: string) {
  const date = new Date(iso);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function CampaignManager({ initialCampaign, dashboard, initialAudits, notifications }: { initialCampaign: DemoCampaignRecord; dashboard: DashboardValue; initialAudits: AgendaCampaignAudit[]; notifications: FollowUpNotification[] }) {
  const [campaign, setCampaign] = useState(initialCampaign);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [liveNotifications, setLiveNotifications] = useState(notifications);
  const [renderedAt] = useState(() => Date.now());
  const settingsEditable = ["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status);
  const responseRate = Math.round(dashboard.responded / dashboard.total * 1000) / 10;
  const validVotes = dashboard.consent + dashboard.oppose;
  const approvalRate = validVotes ? Math.round(dashboard.consent / validVotes * 1000) / 10 : 0;
  const quorumMet = responseRate >= campaign.quorumPercentage;
  const approvalMet = approvalRate >= campaign.approvalPercentage;
  const remainingKo = useMemo(() => {
    const hours = Math.ceil((new Date(campaign.endsAt).getTime() - renderedAt) / 3_600_000);
    if (hours <= 0) return "기간 종료";
    if (hours < 24) return `${hours}시간 남음`;
    return `${Math.ceil(hours / 24)}일 남음`;
  }, [campaign.endsAt, renderedAt]);

  function update<K extends keyof DemoCampaignRecord>(key: K, value: DemoCampaignRecord[K]) { setCampaign((current) => ({ ...current, [key]: value })); }
  async function request(body: Record<string, unknown>, successKo: string) {
    setBusy(true); setMessage(""); setError("");
    const response = await fetch(`/api/admin/campaigns/${encodeURIComponent(campaign.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json() as { campaign?: DemoCampaignRecord; error?: string };
    if (!response.ok || !data.campaign) setError(data.error ?? "안건 현황을 처리하지 못했습니다.");
    else { setCampaign(data.campaign); setMessage(successKo); }
    setBusy(false);
  }
  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { id: _id, tenantId: _tenant, agendaId: _agenda, status: _status, updatedAt: _updated, publishedAt: _published, ...settings } = campaign;
    void [_id, _tenant, _agenda, _status, _updated, _published];
    await request(settings, "기간·대상·응답 정책을 저장했습니다.");
  }
  async function transition(to: "SCHEDULED" | "OPEN" | "PAUSED" | "CLOSED" | "FINALIZED" | "ARCHIVED", label: string) {
    const reasonKo = window.prompt(`${label} 사유를 5자 이상 입력해 주세요.`);
    if (!reasonKo) return;
    if (["CLOSED", "FINALIZED", "ARCHIVED"].includes(to) && !window.confirm(`${label} 처리 후 일부 기능이 제한됩니다. 계속하시겠습니까?`)) return;
    await request({ to, reasonKo }, `${label} 처리가 완료됐습니다.`);
  }

  return <>
    <div className="page-heading"><div><p className="muted"><Link href="/admin/campaigns">안건 현황 관리</Link> / 상세</p><h1>{campaign.nameKo}</h1><p><span className="pill">{stateKo[campaign.status]}</span> · {modeKo[campaign.mode]} · {remainingKo}</p></div><div className="button-row"><Link className="btn" href="/admin/agendas/demo-agenda">게시 안건 확인</Link><Link className="btn" href={`/admin/campaigns/${campaign.id}/reports`}>보고서와 증거</Link></div></div>
    <section className="stats" aria-label="안건 진행 현황">{[["대상 권리", dashboard.total], ["초대 전달", dashboard.delivered], ["열람", dashboard.opened], ["본인 확인", dashboard.verified], ["응답", dashboard.responded], ["미응답", dashboard.total - dashboard.responded]].map(([label, value]) => <div className="stat" key={label}><span>{label}</span><strong>{Number(value).toLocaleString("ko-KR")}명</strong></div>)}</section>
    <section className="dashboard-grid">
      <article className="card"><h2>진행 단계 전환율</h2>{[["초대 전달", dashboard.delivered], ["열람", dashboard.opened], ["본인 확인", dashboard.verified], ["응답", dashboard.responded]].map(([label, value]) => { const rate = Math.round(Number(value) / dashboard.total * 100); return <div className="funnel-row" key={label}><div><span>{label}</span><strong>{Number(value).toLocaleString("ko-KR")}명 · {rate}%</strong></div><span className="bar-track"><span style={{ width: `${rate}%` }} /></span></div>; })}</article>
      <article className="card"><h2>정족수·의결 판단</h2><dl className="definition-grid"><dt>응답 정족수</dt><dd><strong>{responseRate}%</strong> / 기준 {campaign.quorumPercentage}% · {quorumMet ? "충족" : "미충족"}</dd><dt>찬성 비율</dt><dd><strong>{approvalRate}%</strong> / 기준 {campaign.approvalPercentage}% · {approvalMet ? "충족" : "미충족"}</dd><dt>응답 구성</dt><dd>동의 {dashboard.consent} · 반대 {dashboard.oppose} · 기권 {dashboard.abstain}</dd></dl><p className="muted">현재 값은 실시간 참고치이며 결과 확정 시 마감 스냅샷을 기준으로 판단합니다.</p></article>
    </section>

    <section className="card" style={{ marginTop: 20 }}><div className="page-heading"><div><h2>운영 상태</h2><p className="muted">허용된 순서로만 상태를 변경하며 모든 처리가 이력에 남습니다.</p></div><div className="button-row">{campaign.status === "DRAFT" && <><button className="btn" disabled={busy} onClick={() => void transition("SCHEDULED", "진행 예약")}>예약</button><button className="btn btn-primary" disabled={busy} onClick={() => void transition("OPEN", "진행 시작")}>바로 시작</button></>}{campaign.status === "SCHEDULED" && <button className="btn btn-primary" disabled={busy} onClick={() => void transition("OPEN", "진행 시작")}>진행 시작</button>}{campaign.status === "OPEN" && <><button className="btn" disabled={busy} onClick={() => void transition("PAUSED", "일시중지")}>일시중지</button><button className="btn btn-primary" disabled={busy} onClick={() => void transition("CLOSED", "응답 마감")}>응답 마감</button></>}{campaign.status === "PAUSED" && <><button className="btn btn-primary" disabled={busy} onClick={() => void transition("OPEN", "진행 재개")}>진행 재개</button><button className="btn" disabled={busy} onClick={() => void transition("CLOSED", "응답 마감")}>응답 마감</button></>}{campaign.status === "CLOSED" && <button className="btn btn-primary" disabled={busy} onClick={() => void transition("FINALIZED", "결과 확정")}>결과 확정</button>}{campaign.status === "FINALIZED" && <button className="btn" disabled={busy} onClick={() => void transition("ARCHIVED", "기록 보관")}>기록 보관</button>}</div></div>{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}</section>

    <form onSubmit={save}><fieldset disabled={!settingsEditable || busy} className="editor-fieldset"><section className="card editor-section"><h2>기간과 대상 설정</h2>{!settingsEditable && <p className="muted">진행 중에는 설정을 보호합니다. 변경이 필요하면 먼저 일시중지해 주세요.</p>}<div className="filter-grid"><label>현황 관리명<input className="field" value={campaign.nameKo} onChange={(event) => update("nameKo", event.target.value)} required /></label><label>대상 명부<input className="field" value={campaign.rosterVersionKo} onChange={(event) => update("rosterVersionKo", event.target.value)} readOnly /></label><label>시작 시각<input className="field" type="datetime-local" value={localDateTime(campaign.startsAt)} onChange={(event) => update("startsAt", new Date(event.target.value).toISOString())} required /></label><label>종료 시각<input className="field" type="datetime-local" value={localDateTime(campaign.endsAt)} onChange={(event) => update("endsAt", new Date(event.target.value).toISOString())} required /></label></div></section>
      <section className="card editor-section"><h2>본인확인과 응답 정책</h2><div className="filter-grid"><label>운영 모드<select className="field" value={campaign.mode} onChange={(event) => update("mode", event.target.value as DemoCampaignRecord["mode"])}><option value="OPINION">의견 수렴</option><option value="MANAGEMENT_VOTE">관리 의결</option><option value="LEGAL_CONSENT" disabled>법적 동의 · 공급자 연동 필요</option></select></label><label>본인확인 수준<select className="field" value={campaign.verificationLevel} onChange={(event) => update("verificationLevel", event.target.value as DemoCampaignRecord["verificationLevel"])}><option value="SIMPLE_OTP">휴대전화 간편 확인</option><option value="IDENTITY_MATCH">본인 정보 일치 확인</option><option value="STRONG_SIGNATURE" disabled>강화 전자서명 · 공급자 연동 필요</option></select></label><label>응답 정족수<input className="field" type="number" min={1} max={100} value={campaign.quorumPercentage} onChange={(event) => update("quorumPercentage", Number(event.target.value))} /></label><label>찬성 기준<input className="field" type="number" min={1} max={100} value={campaign.approvalPercentage} onChange={(event) => update("approvalPercentage", Number(event.target.value))} /></label><label>결과 공개<select className="field" value={campaign.resultDisclosure} onChange={(event) => update("resultDisclosure", event.target.value as DemoCampaignRecord["resultDisclosure"])}><option value="AFTER_CLOSE">마감 후 공개</option><option value="REAL_TIME">실시간 공개</option><option value="ADMIN_ONLY">관리자만 확인</option></select></label></div><div className="check-list"><label><input type="checkbox" checked={campaign.anonymous} onChange={(event) => update("anonymous", event.target.checked)} /> 결과 집계에서 응답자 익명 처리</label><label><input type="checkbox" checked={campaign.allowResponseChange} onChange={(event) => update("allowResponseChange", event.target.checked)} /> 마감 전 응답 변경 허용</label><label><input type="checkbox" checked={campaign.allowWithdrawal} onChange={(event) => update("allowWithdrawal", event.target.checked)} /> 마감 전 응답 철회 허용</label></div></section></fieldset>{settingsEditable && <button className="btn btn-primary" disabled={busy} style={{ marginTop: 16 }}>{busy ? "저장 중…" : "운영 설정 저장"}</button>}</form>

    <section className="card" style={{ marginTop: 20 }}><h2>대상 구간</h2><div className="table-wrap"><table><thead><tr><th>구간</th><th>대상 수</th><th>권장 조치</th></tr></thead><tbody><tr><td>미응답</td><td>{(dashboard.total - dashboard.responded).toLocaleString("ko-KR")}명</td><td>마감 전 재안내</td></tr><tr><td>발송 실패</td><td>{dashboard.failed}명</td><td>연락처 또는 채널 확인</td></tr><tr><td>열람 후 미인증</td><td>{Math.max(dashboard.opened - dashboard.verified, 0).toLocaleString("ko-KR")}명</td><td>본인확인 안내</td></tr></tbody></table></div></section>
    <FollowUpButton campaignId={campaign.id} disabled={campaign.status !== "OPEN"} onSent={(notification) => setLiveNotifications((current) => [...current, notification])} />
    <section className="card" style={{ marginTop: 20 }}><h2>재안내 이력</h2>{liveNotifications.length === 0 ? <p className="muted">이 세션에서 보낸 재안내가 없습니다.</p> : <div className="table-wrap"><table><thead><tr><th>대상</th><th>채널</th><th>인원</th><th>상태</th><th>문구</th><th>시각</th></tr></thead><tbody>{liveNotifications.slice().reverse().map((item) => <tr key={item.id}><td>{item.segmentKo}</td><td>{item.channelKo}</td><td>{item.targetCount.toLocaleString("ko-KR")}명</td><td>{item.state}</td><td>{item.contentKo}</td><td>{new Date(item.sentAt).toLocaleString("ko-KR")}</td></tr>)}</tbody></table></div>}</section>
    <section className="card" style={{ marginTop: 20 }}><h2>운영 변경 이력</h2>{initialAudits.length === 0 ? <p className="muted">이 세션에서 변경한 이력이 없습니다.</p> : <div className="table-wrap"><table><thead><tr><th>처리</th><th>담당</th><th>사유·내용</th><th>시각</th></tr></thead><tbody>{initialAudits.slice(0, 10).map((item) => <tr key={item.id}><td>{item.actionKo}</td><td>{item.actorKo}</td><td>{item.detailKo}</td><td>{new Date(item.occurredAt).toLocaleString("ko-KR")}</td></tr>)}</tbody></table></div>}</section>
  </>;
}
