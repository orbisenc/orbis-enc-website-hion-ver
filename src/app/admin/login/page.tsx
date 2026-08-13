import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return <main className="resident-container" style={{ paddingTop: 70 }}>
    <p className="pill">관리자 전용</p><h1>HION 관리자 로그인</h1>
    <p className="muted">계정과 다중 인증번호로 안전하게 로그인하세요.</p>
    <section className="card"><LoginForm /></section>
  </main>;
}

