"use client";

import { useState, useSyncExternalStore } from "react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const ready = useSyncExternalStore(() => () => undefined, () => true, () => false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.fromEntries(form)) });
    const data = await response.json() as { error?: string };
    if (!response.ok) { setError(data.error ?? "로그인하지 못했습니다."); setLoading(false); return; }
    window.location.href = "/admin";
  }
  return <form onSubmit={submit} noValidate>
    <label className="field-label" htmlFor="email">이메일</label>
    <input className="field" id="email" name="email" type="email" autoComplete="username" defaultValue="admin@hion.local" required />
    <label className="field-label" htmlFor="password">비밀번호</label>
    <input className="field" id="password" name="password" type="password" autoComplete="current-password" defaultValue="Hion!2026dev" required />
    <label className="field-label" htmlFor="mfaCode">관리자 인증번호</label>
    <input className="field" id="mfaCode" name="mfaCode" inputMode="numeric" autoComplete="one-time-code" defaultValue="000000" required />
    {error && <p className="error" role="alert">{error}</p>}
    <button className="btn btn-primary" style={{ width: "100%", marginTop: 20 }} disabled={loading || !ready}>{loading ? "확인 중…" : "로그인"}</button>
  </form>;
}
