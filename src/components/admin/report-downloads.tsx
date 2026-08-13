"use client";

import { useMemo, useState } from "react";

export function ReportDownloads({ campaignId }: { campaignId: string }) {
  const [reasonKo, setReasonKo] = useState("관리위원회 결과 검토");
  const query = useMemo(() => new URLSearchParams({ campaignId, reasonKo }).toString(), [campaignId, reasonKo]);
  const valid = reasonKo.trim().length >= 5;
  return <section className="card" style={{ marginTop: 18 }}><h2>보고서 내보내기</h2><p className="muted">내보내기 목적과 관리자, 시각이 운영 이력에 기록됩니다. 필요한 범위의 자료만 내려받아 주세요.</p><label className="field-label" htmlFor="reason">자료 내보내기 사유</label><input id="reason" className="field" value={reasonKo} onChange={(event) => setReasonKo(event.target.value)} minLength={5} maxLength={200} required /><div className="button-row"><a className="btn btn-primary" aria-disabled={!valid} href={valid ? `/api/admin/reports/csv?${query}` : undefined}>한국어 CSV 내려받기</a><a className="btn" aria-disabled={!valid} href={valid ? `/api/admin/reports/evidence?${query}` : undefined}>증거 명세 JSON</a><a className="btn" aria-disabled={!valid} href={valid ? `/api/admin/reports/pdf?${query}` : undefined}>한국어 PDF 요약</a></div>{!valid && <p className="error">내보내기 사유를 5자 이상 입력해 주세요.</p>}</section>;
}
