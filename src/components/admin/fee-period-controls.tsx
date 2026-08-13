"use client";

import { useState } from "react";
import { feePeriodStateKo } from "@/lib/fees/presentation";
import type { FeePeriodState } from "@/server/demo/fee-store";

export function FeePeriodControls({ periodId, initialState }: { periodId: string; initialState: FeePeriodState }) {
  const [state, setState] = useState(initialState);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [adjustmentId, setAdjustmentId] = useState("");

  async function periodAction(action: "CONFIRM" | "CLOSE" | "REOPEN", reasonKo = "") {
    setBusy(true); setError(""); setMessage("");
    const response = await fetch("/api/admin/fees/periods/actions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ periodId, action, reasonKo, idempotencyKey: crypto.randomUUID() }) });
    const data = await response.json() as { period?: { state: FeePeriodState }; error?: string };
    if (!response.ok || !data.period) setError(data.error ?? "기준월 상태를 변경하지 못했습니다.");
    else { setState(data.period.state); setMessage(action === "CONFIRM" ? "기준월을 확정했습니다." : action === "CLOSE" ? "불변 스냅샷을 만들고 기준월을 마감했습니다." : "기준월을 승인 절차로 재개했습니다."); }
    setBusy(false);
  }

  async function createAdjustment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage(""); const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/fees/adjustments", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ periodId, unitKey: form.get("unitKey"), amount: form.get("amount"), reasonKo: form.get("reasonKo"), idempotencyKey: crypto.randomUUID() }) });
    const data = await response.json() as { adjustment?: { id: string }; error?: string };
    if (!response.ok || !data.adjustment) setError(data.error ?? "조정을 등록하지 못했습니다."); else { setAdjustmentId(data.adjustment.id); setMessage("추가 전용 조정 내역을 등록했습니다. 승인 후 원장에 반영됩니다."); }
    setBusy(false);
  }

  async function approve() {
    setBusy(true); setError("");
    const response = await fetch("/api/admin/fees/adjustments", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ adjustmentId, idempotencyKey: crypto.randomUUID() }) });
    const data = await response.json() as { error?: string };
    if (!response.ok) setError(data.error ?? "조정을 승인하지 못했습니다."); else { setAdjustmentId(""); setMessage("조정 내역을 승인했습니다."); }
    setBusy(false);
  }

  return <section className="card" style={{ marginTop: 20 }}>
    <h2>확정·마감·조정</h2><p>현재 상태: <strong>{feePeriodStateKo(state)}</strong></p>
    <div className="button-row">
      {state === "IMPORTED" && <button className="btn btn-primary" disabled={busy} onClick={() => periodAction("CONFIRM")}>기준월 확정</button>}
      {(state === "CONFIRMED" || state === "REOPENED") && <button className="btn btn-primary" disabled={busy} onClick={() => { const reason=window.prompt("마감 사유를 한국어로 5자 이상 입력해 주세요.","부과·수납 대사 확인 완료"); if(reason) void periodAction("CLOSE",reason); }}>기준월 마감</button>}
      {state === "CLOSED" && <button className="btn" disabled={busy} onClick={() => { const reason=window.prompt("재개 사유를 한국어로 5자 이상 입력해 주세요.","추가 조정 자료 확인 필요"); if(reason) void periodAction("REOPEN",reason); }}>승인 후 재개</button>}
    </div>
    <form onSubmit={createAdjustment} style={{ marginTop: 18 }}><h3>추가 전용 조정 등록</h3><div className="filter-grid"><label>동·호수<input className="field" name="unitKey" defaultValue="101동 1203호" required/></label><label>조정액<input className="field" name="amount" defaultValue="-5000" inputMode="numeric" required/></label><label>한국어 조정 사유<input className="field" name="reasonKo" defaultValue="계량기 검침값 정정 반영" minLength={5} required/></label><button className="btn" disabled={busy}>조정 등록</button></div></form>
    {adjustmentId && <button className="btn btn-primary" onClick={approve} disabled={busy}>방금 등록한 조정 승인</button>}{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}
  </section>;
}
