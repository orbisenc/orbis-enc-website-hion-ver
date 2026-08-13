"use client";

import { useState } from "react";

export function SceneSaveButton({ agendaId }: { agendaId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function save() {
    setBusy(true); setMessage(""); setError("");
    const response = await fetch(`/api/admin/agendas/${encodeURIComponent(agendaId)}/scene`, { method: "POST" });
    const data = await response.json() as { message?: string; error?: string };
    if (!response.ok) setError(data.error ?? "장면 버전을 저장하지 못했습니다."); else setMessage(data.message ?? "장면 버전을 저장했습니다.");
    setBusy(false);
  }
  return <><button className="btn btn-primary" disabled={busy} onClick={() => void save()}>{busy ? "저장 중…" : "새 장면 버전 저장"}</button>{message && <p className="success" role="status">{message}</p>}{error && <p className="error" role="alert">{error}</p>}</>;
}
