"use client";

import { facilityDemoUsers } from "@/data/facilityDemoUsers";
import { ArrowRight, Building2, LoaderCircle, ShieldCheck } from "lucide-react";
import { useState } from "react";

export function FacilityLoginForm() {
  const [email, setEmail] = useState("manager@hion.local");
  const [password, setPassword] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  async function login(selectedEmail = email) {
    setLoading(true); setError("");
    const response = await fetch("/api/facility/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: selectedEmail, password }) });
    const data = await response.json() as { error?: string; redirectTo?: string };
    if (!response.ok) { setError(data.error ?? "로그인하지 못했습니다."); setLoading(false); return; }
    window.location.href = data.redirectTo ?? "/dashboard";
  }
  return <div className="facility-login-shell"><section className="facility-login-brand"><div className="facility-login-logo">HION</div><span>Apartment OS</span><h1>시설의 현재와 미래를<br />하나의 근거로 연결합니다.</h1><p>3D 공간에서 자산을 찾고, 점검·고장·작업·교체·예산과 입주민 의사결정까지 이어지는 아파트 시설운영 플랫폼입니다.</p><ul><li><Building2 /> 8개 동·864세대 공용시설 디지털 트윈</li><li><ShieldCheck /> 단지 격리와 역할 기반 접근 통제</li></ul></section><main className="facility-login-panel"><div><span className="facility-demo-badge">로컬 데모 환경</span><h2>HION 스마트파크 로그인</h2><p>데모 계정을 선택하거나 이메일과 비밀번호를 입력하세요.</p><form onSubmit={(event) => { event.preventDefault(); void login(); }}><label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" /></label><label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>{error && <p className="facility-login-error" role="alert">{error}</p>}<button type="submit" disabled={loading}>{loading ? <><LoaderCircle className="spin" /> 확인 중</> : <>로그인 <ArrowRight /></>}</button></form><div className="facility-demo-accounts"><strong>빠른 데모 계정</strong>{facilityDemoUsers.map((user) => <button key={user.id} type="button" disabled={loading} onClick={() => { setEmail(user.email); setPassword("demo1234"); void login(user.email); }}><span><strong>{user.role}</strong><small>{user.name} · {user.description}</small></span><ArrowRight /></button>)}</div><small className="facility-login-hint">모든 데모 계정 비밀번호: <strong>demo1234</strong></small></div></main></div>;
}
