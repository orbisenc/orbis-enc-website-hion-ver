"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { DemoAgendaRecord } from "@/server/demo/agenda-campaign-store";

const stateKo = { DRAFT: "초안", IN_REVIEW: "검토 중", APPROVED: "승인", PUBLISHED: "게시됨", CLOSED: "종료", ARCHIVED: "보관" } as const;

export function AgendaEditor({ initialAgenda, attachmentCount, costImpactApproved }: { initialAgenda: DemoAgendaRecord; attachmentCount: number; costImpactApproved: boolean }) {
  const [agenda, setAgenda] = useState(initialAgenda);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [liveAttachmentCount, setLiveAttachmentCount] = useState(attachmentCount);
  const [liveCostImpactApproved, setLiveCostImpactApproved] = useState(costImpactApproved);
  useEffect(() => {
    const attachmentListener = (event: Event) => setLiveAttachmentCount((event as CustomEvent<number>).detail);
    const costListener = (event: Event) => setLiveCostImpactApproved((event as CustomEvent<boolean>).detail);
    window.addEventListener("agenda-attachments-changed", attachmentListener);
    window.addEventListener("agenda-cost-impact-changed", costListener);
    return () => { window.removeEventListener("agenda-attachments-changed", attachmentListener); window.removeEventListener("agenda-cost-impact-changed", costListener); };
  }, []);
  const editable = agenda.state === "DRAFT";
  const completed = useMemo(() => [
    agenda.titleKo.length >= 5,
    agenda.summaryKo.length >= 10 && agenda.backgroundKo.length >= 10 && agenda.changeScopeKo.length >= 10 && agenda.benefitKo.length >= 10,
    agenda.options.length >= 2 && agenda.consentTextKo.length >= 10,
    true,
    liveCostImpactApproved,
  ], [agenda, liveCostImpactApproved]);
  const readiness = Math.round(completed.filter(Boolean).length / completed.length * 100);

  function update<K extends keyof DemoAgendaRecord>(key: K, value: DemoAgendaRecord[K]) { setAgenda((current) => ({ ...current, [key]: value })); }

  async function request(body: Record<string, unknown>, successKo: string) {
    setBusy(true); setMessage(""); setError("");
    const response = await fetch(`/api/admin/agendas/${encodeURIComponent(agenda.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json() as { agenda?: DemoAgendaRecord; error?: string };
    if (!response.ok || !data.agenda) setError(data.error ?? "안건을 처리하지 못했습니다.");
    else { setAgenda(data.agenda); setMessage(successKo); }
    setBusy(false);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const { id: _id, tenantId: _tenantId, state: _state, ownerKo: _owner, version: _version, reviewerFeedbackKo: _feedback, updatedAt: _updated, publishedAt: _published, ...draft } = agenda;
    void [_id, _tenantId, _state, _owner, _version, _feedback, _updated, _published];
    await request(draft, "안건 초안을 저장했습니다.");
  }

  async function action(actionName: "NEW_VERSION" | "REQUEST_REVIEW" | "APPROVE" | "RETURN" | "PUBLISH") {
    let feedbackKo: string | undefined;
    if (actionName === "RETURN") {
      feedbackKo = window.prompt("보완할 내용을 5자 이상 입력해 주세요.") ?? undefined;
      if (!feedbackKo) return;
    }
    if (actionName === "PUBLISH" && !window.confirm("현재 승인본을 입주민에게 게시하시겠습니까? 게시 후에는 직접 수정할 수 없습니다.")) return;
    const messages = { NEW_VERSION: "새 안건 버전 초안을 만들었습니다.", REQUEST_REVIEW: "승인 관리자에게 검토를 요청했습니다.", APPROVE: "안건을 승인했습니다.", RETURN: "초안으로 돌려보냈습니다.", PUBLISH: "승인된 안건을 입주민용 게시본으로 확정했습니다." };
    await request({ action: actionName, feedbackKo }, messages[actionName]);
  }

  return <>
    <div className="page-heading">
      <div><p className="muted"><Link href="/admin/agendas">안건 제작</Link> / {agenda.version}판</p><h1>{agenda.titleKo}</h1><p><span className="pill">{stateKo[agenda.state]}</span> · 담당 {agenda.ownerKo} · 게시 준비 {readiness}%</p></div>
      <div className="button-row">
        <Link className="btn" href={`/admin/agendas/${agenda.id}/viewer`}>3D 장면 확인</Link>
        {agenda.state === "PUBLISHED" && <button className="btn btn-primary" disabled={busy} onClick={() => void action("NEW_VERSION")}>새 버전 만들기</button>}
      </div>
    </div>

    <section className="workflow-steps" aria-label="안건 제작 단계">
      {["내용 작성", "자료·비용", "검토", "승인", "게시"].map((label, index) => <div key={label} className={index <= ({ DRAFT: 0, IN_REVIEW: 2, APPROVED: 3, PUBLISHED: 4, CLOSED: 4, ARCHIVED: 4 }[agenda.state]) ? "workflow-step active" : "workflow-step"}><strong>{index + 1}</strong><span>{label}</span></div>)}
    </section>

    <section className="card readiness-card">
      <div><h2>게시 준비 점검</h2><p className="muted">필수 항목을 모두 준비한 뒤 검토·승인·게시 순서로 진행합니다.</p></div>
      <strong className="readiness-score">{readiness}%</strong>
      <ul className="check-list">
        {["제목과 분류", "주민 안내 본문", "응답 선택지와 최종 확인", `첨부 자료 확인 · ${liveAttachmentCount}개`, "비용 영향 승인"].map((label, index) => <li key={label} className={completed[index] ? "done" : ""}>{completed[index] ? "완료" : "필요"} · {label}</li>)}
      </ul>
    </section>

    {agenda.reviewerFeedbackKo && <p className="error" role="status">검토 의견: {agenda.reviewerFeedbackKo}</p>}
    <form onSubmit={save}>
      <fieldset disabled={!editable || busy} className="editor-fieldset">
        <section className="card editor-section"><h2>1. 기본 정보</h2><div className="filter-grid"><label>안건 제목<input className="field" value={agenda.titleKo} onChange={(event) => update("titleKo", event.target.value)} required minLength={5} maxLength={120} /></label><label>안건 분류<select className="field" value={agenda.categoryKo} onChange={(event) => update("categoryKo", event.target.value)}><option>시설 개선</option><option>관리 규약</option><option>예산·관리비</option><option>공용 공간</option><option>기타</option></select></label></div><label className="field-label" htmlFor="agenda-summary">한 줄 요약</label><textarea className="field" id="agenda-summary" rows={3} value={agenda.summaryKo} onChange={(event) => update("summaryKo", event.target.value)} required minLength={10} maxLength={300} /></section>
        <section className="card editor-section"><h2>2. 입주민 안내 본문</h2><div className="editor-grid"><label>추진 배경<textarea className="field" rows={5} value={agenda.backgroundKo} onChange={(event) => update("backgroundKo", event.target.value)} required /></label><label>변경 범위<textarea className="field" rows={5} value={agenda.changeScopeKo} onChange={(event) => update("changeScopeKo", event.target.value)} required /></label><label>기대 효과<textarea className="field" rows={5} value={agenda.benefitKo} onChange={(event) => update("benefitKo", event.target.value)} required /></label><label>예상 일정<textarea className="field" rows={5} value={agenda.scheduleKo} onChange={(event) => update("scheduleKo", event.target.value)} required /></label><label>유의 사항<textarea className="field" rows={4} value={agenda.cautionsKo} onChange={(event) => update("cautionsKo", event.target.value)} required /></label><label>문의처<textarea className="field" rows={4} value={agenda.contactKo} onChange={(event) => update("contactKo", event.target.value)} required /></label></div></section>
        <section className="card editor-section"><h2>3. 응답과 최종 확인</h2><p className="muted">관리 의결 선택지는 주민 판단에 영향을 주지 않도록 동의·반대·기권의 고정된 중립 표현을 사용합니다.</p><div className="filter-grid">{agenda.options.map((option, index) => <label key={index}>선택지 {index + 1}<input className="field" value={option} readOnly /></label>)}</div><label className="field-label" htmlFor="agenda-consent-text">최종 확인 문구</label><textarea className="field" id="agenda-consent-text" rows={4} value={agenda.consentTextKo} onChange={(event) => update("consentTextKo", event.target.value)} required /></section>
      </fieldset>
      {editable && <button className="btn btn-primary" disabled={busy} style={{ marginTop: 16 }}>{busy ? "저장 중…" : "초안 저장"}</button>}
    </form>
    <div className="button-row workflow-actions">
      {agenda.state === "DRAFT" && <button className="btn btn-cyan" disabled={busy || readiness < 100} onClick={() => void action("REQUEST_REVIEW")}>검토 요청</button>}
      {agenda.state === "IN_REVIEW" && <><button className="btn" disabled={busy} onClick={() => void action("RETURN")}>보완 요청</button><button className="btn btn-primary" disabled={busy} onClick={() => void action("APPROVE")}>승인</button></>}
      {agenda.state === "APPROVED" && <button className="btn btn-primary" disabled={busy} onClick={() => void action("PUBLISH")}>입주민 게시</button>}
    </div>
    {message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}
  </>;
}
