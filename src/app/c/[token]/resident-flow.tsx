"use client";

import { useEffect, useState } from "react";

import { ParkingFallback, ParkingViewer } from "@/components/viewer3d/parking-viewer";
import { formatReferenceMonth, formatSeoulDateTime, formatWon } from "@/lib/format/ko";
import type { DemoResponse, ResponseOption } from "@/server/demo/store";
import type { PublicAgendaAttachment } from "@/server/services/agenda-attachment-service";

type Agenda = typeof import("@/server/demo/store").demoAgenda;
type ResidentCostImpact = {
  estimatedProjectCost: string;
  actualProjectCost: string | null;
  fundingSourceKo: string;
  usesLongTermRepairReserve: boolean;
  requiresAdditionalFee: boolean;
  allocationType: "EQUAL" | "AREA" | "VOTING_RIGHT" | "NONE";
  estimatedAmountPerUnit: string;
  expectedBillingStartMonth: string;
  installmentCount: number;
  residentExplanationKo: string;
};

const stepNames = ["참여 안내", "안건 확인", "의견 선택", "본인 확인", "최종 확인"];
const responseOptions: Array<{ value: ResponseOption; description: string }> = [
  { value: "동의", description: "안건 내용에 찬성합니다" },
  { value: "반대", description: "안건 내용에 반대합니다" },
];

export function ResidentFlow({ agenda, token, attachments, costImpact }: { agenda: Agenda; token: string; attachments: PublicAgendaAttachment[]; costImpact: ResidentCostImpact | null }) {
  const [step, setStep] = useState(0);
  const [transactionId, setTransactionId] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [option, setOption] = useState<ResponseOption | null>(null);
  const [reviewed, setReviewed] = useState(false);
  const [receipt, setReceipt] = useState<DemoResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/receipt?token=${encodeURIComponent(token)}`)
      .then(async (response) => response.ok ? response.json() : null)
      .then((data) => { if (data?.receipt) setReceipt(data.receipt); })
      .catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (step > 0) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  if (receipt) return <Receipt receipt={receipt} agenda={agenda} />;

  function moveToStep(nextStep: number) {
    setError("");
    setStep(nextStep);
  }

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/verification/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, phone: form.get("phone") }),
      });
      const data = await response.json() as { transactionId?: string; error?: string };
      if (!response.ok) setError(data.error ?? "인증번호를 요청하지 못했습니다.");
      else setTransactionId(data.transactionId!);
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/verification/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ transactionId, otp: form.get("otp") }),
      });
      const data = await response.json() as { verificationId?: string; error?: string };
      if (!response.ok) setError(data.error ?? "본인 확인에 실패했습니다.");
      else {
        setVerificationId(data.verificationId!);
        moveToStep(4);
        void track("verification_completed");
      }
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function submit() {
    if (!option || !reviewed) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/responses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, verificationId, option, idempotencyKey: crypto.randomUUID(), consentReviewed: true }),
      });
      const data = await response.json() as { receipt?: DemoResponse; error?: string };
      if (!response.ok) setError(data.error ?? "응답을 제출하지 못했습니다.");
      else setReceipt(data.receipt!);
    } catch {
      setError("네트워크 연결을 확인한 뒤 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="resident-container">
    <header className="resident-hero">
      <div className="resident-brand-row">
        <span className="resident-brand">HION</span>
        <span className="pill resident-status"><span aria-hidden="true" />참여 가능</span>
      </div>
      <p className="resident-eyebrow">{agenda.complexName} 주민 의견 수렴</p>
      <h1>{agenda.title}</h1>
      <div className="resident-meta" aria-label="참여 안내 요약">
        <span>약 5분</span><span>본인 확인</span><span>응답 영수증 제공</span>
      </div>
    </header>

    <nav className="resident-progress" aria-label={`전체 5단계 중 ${step + 1}단계: ${stepNames[step]}`}>
      <div className="resident-progress-heading"><span>진행 단계</span><strong>{step + 1} / 5 · {stepNames[step]}</strong></div>
      <div className="steps">{stepNames.map((name, index) => <span key={name} className={`step ${index <= step ? "active" : ""}`} aria-current={index === step ? "step" : undefined}><span className="sr-only">{name}</span></span>)}</div>
    </nav>

    {error && <div className="resident-alert resident-alert-error" role="alert"><strong>확인이 필요합니다</strong><span>{error}</span></div>}

    {step === 0 && <section className="card resident-card resident-intro-card">
      <p className="resident-section-kicker">공개 시연 · 상시 참여 가능</p>
      <h2>안건을 확인하고 의견을 남겨주세요</h2>
      <p className="resident-lead">안건의 변경 내용과 비용 영향을 먼저 살펴보고 동의 또는 반대 의견을 선택할 수 있습니다.</p>
      <div className="resident-facts">
        <div><span>운영 주체</span><strong>해오름 아파트 관리사무소</strong></div>
        <div><span>의견 수렴</span><strong>시연 기간 동안 상시 참여</strong></div>
        <div><span>문의처</span><strong>{agenda.contact}</strong></div>
      </div>
      <div className="resident-alert resident-alert-info"><strong>개인정보 보호 안내</strong><span>초대받은 의결권자만 참여하며 다른 세대의 정보는 표시하지 않습니다.</span></div>
      <div className="resident-actions resident-actions-single">
        <button className="btn btn-primary resident-primary-action" type="button" onClick={() => { moveToStep(1); void track("agenda_section_viewed"); }}>안건 내용 확인하기</button>
        <small>본인 확인은 의견 선택 후 최종 확인 전에 진행합니다.</small>
      </div>
    </section>}

    {step === 1 && <>
      <AgendaDetails agenda={agenda} attachments={attachments} costImpact={costImpact} />
      <div className="resident-sticky-action">
        <button className="btn btn-primary resident-primary-action" type="button" onClick={() => { moveToStep(2); void track("response_started"); }}>안건 내용을 확인했습니다</button>
        <small>다음 단계에서 의견을 선택합니다.</small>
      </div>
    </>}

    {step === 2 && <section className="card resident-card">
      <p className="resident-section-kicker">의견 선택</p>
      <h2>의견을 하나 선택해 주세요</h2>
      <p className="resident-lead">기본 선택값은 없으며 최종 제출 전까지 변경할 수 있습니다.</p>
      <div className="option-grid">{responseOptions.map(({ value, description }) => <button key={value} className="option" type="button" aria-label={value} aria-pressed={option === value} onClick={() => { setOption(value); setVerificationId(""); setTransactionId(""); }}><strong>{value}</strong><span>{description}</span></button>)}</div>
      <label className="resident-consent">
        <input type="checkbox" checked={reviewed} onChange={(event) => setReviewed(event.target.checked)} />
        <span><strong>필수 동의문을 확인했습니다</strong><small>{agenda.consentText}</small></span>
      </label>
      <div className="resident-actions">
        <button className="btn" type="button" onClick={() => moveToStep(1)}>안건 다시 보기</button>
        <button className="btn btn-primary" disabled={!option || !reviewed} onClick={() => moveToStep(3)}>본인 확인으로 이동</button>
      </div>
      {(!option || !reviewed) && <p className="field-hint resident-action-hint">의견을 선택하고 필수 동의문을 확인하면 본인 확인을 진행할 수 있습니다.</p>}
    </section>}

    {step === 3 && <section className="card resident-card">
      <p className="resident-section-kicker">최종 제출 전 본인 확인</p>
      <h2>휴대전화로 본인을 확인합니다</h2>
      <p className="resident-lead">선택한 의견은 아직 제출되지 않았습니다. 초대 대상과 일치하는지 확인한 뒤 최종 내용을 검토합니다.</p>
      <div className="resident-selection-summary"><span>선택한 의견</span><strong>{option}</strong></div>
      <div className="resident-alert resident-alert-info"><strong>시연용 안내</strong><span>아래 예시 번호와 인증번호를 그대로 사용해 전체 과정을 확인할 수 있습니다.</span></div>

      {!transactionId ? <form className="resident-form" onSubmit={requestOtp}>
        <label className="field-label" htmlFor="phone">휴대전화 번호</label>
        <input className="field resident-input" id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" defaultValue="010-0000-1203" aria-describedby="phone-hint" required />
        <p className="field-hint" id="phone-hint">시연 번호: 010-0000-1203</p>
        <div className="resident-actions">
          <button className="btn" type="button" onClick={() => moveToStep(2)}>의견 수정</button>
          <button className="btn btn-primary" disabled={loading}>{loading ? "요청 중…" : "인증번호 받기"}</button>
        </div>
      </form> : <form className="resident-form" onSubmit={confirmOtp}>
        <div className="resident-alert resident-alert-success" role="status"><strong>인증번호를 보냈습니다</strong><span>5분 안에 여섯 자리 번호를 입력해 주세요.</span></div>
        <label className="field-label" htmlFor="otp">인증번호 6자리</label>
        <input className="field resident-input resident-otp-input" id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} defaultValue="123456" aria-describedby="otp-hint" required />
        <p className="field-hint" id="otp-hint">시연용 인증번호: <strong>123456</strong></p>
        <div className="resident-actions">
          <button className="btn" type="button" onClick={() => setTransactionId("")}>번호 다시 입력</button>
          <button className="btn btn-primary" disabled={loading}>{loading ? "확인 중…" : "본인 확인 후 최종 검토"}</button>
        </div>
      </form>}
    </section>}

    {step === 4 && <section className="card resident-card">
      <p className="resident-section-kicker">제출 전 마지막 단계</p>
      <h2>선택한 내용을 확인해 주세요</h2>
      <div className="resident-selection-summary"><span>선택한 의견</span><strong>{option}</strong></div>
      <dl className="resident-review-list">
        <div><dt>본인 확인</dt><dd><strong>완료</strong></dd></div>
        <div><dt>의결권</dt><dd>{agenda.building} {agenda.unit} · {agenda.rightType}</dd></div>
        <div><dt>안건 버전</dt><dd>{agenda.agendaVersion}</dd></div>
        <div><dt>동의문 버전</dt><dd>{agenda.consentVersion}</dd></div>
      </dl>
      <details className="resident-disclosure"><summary>확인한 동의문 전문 보기</summary><p>{agenda.consentText}</p></details>
      <div className="resident-alert resident-alert-warning"><strong>제출 후 영수증이 발급됩니다</strong><span>서버 제출 시각과 자료 버전이 응답 증거에 연결됩니다. 이 시연은 법적 효력을 자동 보장하지 않습니다.</span></div>
      <div className="resident-actions">
        <button className="btn" type="button" disabled={loading} onClick={() => { setVerificationId(""); setTransactionId(""); moveToStep(2); }}>의견 수정</button>
        <button className="btn btn-primary" type="button" disabled={loading} onClick={submit}>{loading ? "안전하게 제출 중…" : "이 의견으로 최종 제출"}</button>
      </div>
    </section>}
  </main>;
}

function AgendaDetails({ agenda, attachments, costImpact }: { agenda: Agenda; attachments: PublicAgendaAttachment[]; costImpact: ResidentCostImpact | null }) {
  return <article className="resident-agenda-details">
    <section className="card resident-card resident-summary-card">
      <p className="resident-section-kicker">핵심 내용</p>
      <h2>무엇이 달라지나요?</h2>
      <p className="resident-lead">{agenda.summary}</p>
      <div className="agenda-key-points">
        <div><span>현재 문제</span><p>{agenda.background}</p></div>
        <div><span>변경 범위</span><p>{agenda.changeScope}</p></div>
        <div><span>기대 효과</span><p>{agenda.benefit}</p></div>
      </div>
      <details className="resident-disclosure"><summary>일정과 유의 사항 확인</summary><h3>일정</h3><p>{agenda.schedule}</p><h3>유의 사항</h3><p>{agenda.cautions}</p></details>
    </section>

    {costImpact && <section className="card resident-card cost-impact">
      <p className="resident-section-kicker">비용 정보</p>
      <h2>비용 및 관리비 영향</h2>
      <div className="resident-cost-highlight"><span>세대당 예상 부담액</span><strong>{formatWon(costImpact.estimatedAmountPerUnit)}</strong><small>현재 가정에 따른 예상치</small></div>
      <dl className="resident-review-list">
        <div><dt>총사업비</dt><dd>{formatWon(costImpact.estimatedProjectCost)} <small>(예상)</small></dd></div>
        <div><dt>비용 마련 방식</dt><dd>{costImpact.fundingSourceKo}</dd></div>
        <div><dt>관리비 영향</dt><dd>{costImpact.requiresAdditionalFee ? `${formatReferenceMonth(costImpact.expectedBillingStartMonth)}부터 ${costImpact.installmentCount}회 분할 부과 예정` : "세대 추가 관리비 부과 없음"}</dd></div>
        <div><dt>계산 기준</dt><dd>{allocationTypeKo(costImpact.allocationType)}</dd></div>
      </dl>
      <p>{costImpact.residentExplanationKo}</p>
      <p className="field-hint">실제 집행과 승인 결과에 따라 최종 금액은 달라질 수 있습니다.</p>
    </section>}

    {attachments.length > 0 && <section className="card resident-card">
      <p className="resident-section-kicker">관리사무소 제공</p>
      <h2>안건 첨부 자료</h2>
      <p className="resident-lead">안건 검토에 사용된 원문 자료를 새 창에서 확인할 수 있습니다.</p>
      <div className="attachment-list">{attachments.map((item) => <a className="attachment-item" key={item.id} href={item.href} target="_blank" rel="noreferrer"><span className="attachment-icon" aria-hidden="true">문서</span><span><strong>{item.name}</strong><small>{item.altTextKo}</small></span><b aria-hidden="true">↗</b></a>)}</div>
    </section>}

    <section className="card resident-card">
      <p className="resident-section-kicker">한눈에 비교</p>
      <h2>변경 전·후 비교</h2>
      <div className="comparison"><ParkingFallback after={false} /><ParkingFallback after /></div>
    </section>

    <section className="card resident-card">
      <p className="resident-section-kicker">직접 확인</p>
      <h2>3D 모델</h2>
      <p className="resident-lead">변경 전후 버튼으로 주차선과 방화문 앞 통행 공간을 비교할 수 있습니다.</p>
      <ParkingViewer />
    </section>

    <section className="card resident-card resident-faq">
      <p className="resident-section-kicker">추가 안내</p>
      <h2>자주 묻는 질문</h2>
      <details><summary>주차면 수가 줄어드나요?</summary><p>주차면 수는 유지하고 위치와 안전 유도선만 조정합니다.</p></details>
      <details><summary>공사 일정은 언제인가요?</summary><p>응답 종료와 관리주체 검토 후 별도로 안내합니다.</p></details>
      <details><summary>영상이 없어도 내용을 확인할 수 있나요?</summary><p>핵심 요약, 첨부 자료, 변경 전후 비교와 3D 모델에서 동일한 핵심 내용을 확인할 수 있습니다.</p></details>
      <div className="resident-contact"><span>추가 문의</span><strong>{agenda.contact}</strong></div>
    </section>
  </article>;
}

function Receipt({ receipt, agenda }: { receipt: DemoResponse; agenda: Agenda }) {
  return <main className="resident-container resident-receipt-page">
    <header className="resident-hero resident-receipt-hero">
      <span className="resident-success-mark" aria-hidden="true">✓</span>
      <p className="resident-section-kicker">제출 완료</p>
      <h1>의견이 안전하게 기록됐습니다</h1>
      <p className="resident-lead">아래 영수증 번호로 제출 사실과 자료 버전을 확인할 수 있습니다.</p>
    </header>
    <section className="card resident-card resident-receipt-card">
      <h2>응답 영수증</h2>
      <div className="resident-receipt-number"><span>영수증 번호</span><strong>{receipt.receiptNumber}</strong></div>
      <dl className="resident-review-list">
        <div><dt>서버 제출 시각</dt><dd>{formatSeoulDateTime(receipt.submittedAt)}</dd></div>
        <div><dt>선택한 의견</dt><dd><strong>{receipt.option}</strong></dd></div>
        <div><dt>안건</dt><dd>{agenda.title}</dd></div>
        <div><dt>자료 버전</dt><dd>안건 {agenda.agendaVersion} · 동의문 {agenda.consentVersion} · 콘텐츠 {agenda.contentVersion}</dd></div>
      </dl>
      <div className="resident-alert resident-alert-info"><strong>영수증은 다시 확인할 수 있습니다</strong><span>새로고침하거나 같은 초대 링크로 다시 들어오면 동일한 영수증이 표시됩니다.</span></div>
      <button className="btn resident-primary-action" type="button" onClick={() => window.print()}>영수증 인쇄</button>
    </section>
  </main>;
}

function allocationTypeKo(type: ResidentCostImpact["allocationType"]) {
  return type === "EQUAL" ? "대상 세대 균등 배분" : type === "AREA" ? "세대 면적 기준 배분" : type === "VOTING_RIGHT" ? "의결권 기준 배분" : "다른 재원 사용";
}

function track(eventName: string) {
  return fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventName }), keepalive: true }).catch(() => undefined);
}
