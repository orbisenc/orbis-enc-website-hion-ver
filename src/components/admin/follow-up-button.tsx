"use client";

import { useState } from "react";

const segments = [
  ["UNRESPONDED", "미응답"],
  ["DELIVERY_FAILED", "발송 실패"],
  ["OPENED_NOT_VERIFIED", "열람 후 미인증"],
] as const;

export interface FollowUpNotification { id: string; contentKo: string; state: string; sentAt: string; segmentKo: string; targetCount: number; channelKo: string }

export function FollowUpButton({ campaignId, disabled = false, onSent }: { campaignId: string; disabled?: boolean; onSent?: (notification: FollowUpNotification) => void }) {
  const [selected, setSelected] = useState<string[]>(["UNRESPONDED"]);
  const [contentKo, setContentKo] = useState("아직 응답하지 않은 안건이 있습니다. HION에서 내용을 확인해 주세요.");
  const [channel, setChannel] = useState<"SMS" | "EMAIL">("SMS");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function send() {
    if (!window.confirm("선택한 대상에게 재안내를 보내시겠습니까? 개발 환경에서는 실제 발송 없이 알림함에 기록됩니다.")) return;
    setBusy(true); setMessage(""); setError("");
    const response = await fetch(`/api/admin/campaigns/${encodeURIComponent(campaignId)}/follow-up`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ segments: selected, channel, contentKo }) });
    const data = await response.json() as { message?: string; error?: string; notification?: FollowUpNotification };
    if (!response.ok) setError(data.error ?? "재안내를 처리하지 못했습니다."); else { setMessage(data.message ?? "재안내를 저장했습니다."); if (data.notification) onSent?.(data.notification); }
    setBusy(false);
  }
  return <section className="card" style={{ marginTop: 20 }}><h2>대상별 재안내</h2><p className="muted">개인 연락처를 노출하지 않고 진행 상태 구간으로 대상을 선택합니다. 동일 안건은 1분 이내 중복 발송이 차단됩니다.</p><div className="filter-grid">{segments.map(([value, label]) => <label key={value}><input type="checkbox" checked={selected.includes(value)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, value] : current.filter((item) => item !== value))} /> {label}</label>)}<label>발송 채널<select className="field" value={channel} onChange={(event) => setChannel(event.target.value as "SMS" | "EMAIL")}><option value="SMS">문자</option><option value="EMAIL">이메일</option></select></label></div><label className="field-label" htmlFor="follow-up-content">한국어 안내 문구</label><textarea className="field" id="follow-up-content" rows={3} maxLength={300} value={contentKo} onChange={(event) => setContentKo(event.target.value)} /><button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => void send()} disabled={disabled || busy || selected.length === 0}>{busy ? "처리 중…" : "선택 대상에게 재안내"}</button>{disabled && <p className="muted">진행 중 상태에서만 재안내할 수 있습니다.</p>}{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}</section>;
}
