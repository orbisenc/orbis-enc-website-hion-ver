"use client";

import { useState } from "react";
import { formatWon } from "@/lib/format/ko";

export interface AgendaCostImpactFormValue {
  estimatedProjectCost: string;
  actualProjectCost: string;
  fundingSourceKo: string;
  usesLongTermRepairReserve: boolean;
  requiresAdditionalFee: boolean;
  additionalFeeTotal: string;
  allocationType: "EQUAL" | "AREA" | "VOTING_RIGHT" | "NONE";
  eligibleUnitCount: number;
  expectedBillingStartMonth: string;
  installmentCount: number;
  residentExplanationKo: string;
  approved: boolean;
  estimatedAmountPerUnit: string;
}

export function AgendaCostImpactForm({ agendaId, initialValue }: { agendaId: string; initialValue: AgendaCostImpactFormValue }) {
  const [value,setValue]=useState(initialValue); const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();setBusy(true);setMessage("");setError("");const response=await fetch(`/api/admin/agendas/${encodeURIComponent(agendaId)}/cost-impact`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({...value,eligibleUnitCount:Number(value.eligibleUnitCount),installmentCount:Number(value.installmentCount)})});const data=await response.json() as {impact?:{estimatedAmountPerUnit:string;version:number};error?:string};if(!response.ok||!data.impact)setError(data.error??"비용 영향을 저장하지 못했습니다.");else{setValue(current=>({...current,estimatedAmountPerUnit:data.impact!.estimatedAmountPerUnit}));window.dispatchEvent(new CustomEvent("agenda-cost-impact-changed",{detail:value.approved}));setMessage(`비용 계산 스냅샷 ${data.impact.version}판을 저장했습니다. 세대당 예상 부담액은 ${formatWon(data.impact.estimatedAmountPerUnit)}입니다.`);}setBusy(false);}
  return <section className="card" style={{marginTop:22}}><h2>비용 및 관리비 영향</h2><p className="muted">세대별 예상 부담액은 입력값과 배분 기준으로 서버에서 계산하며, 승인된 한국어 요약만 주민 화면에 표시됩니다.</p><form onSubmit={submit}><div className="filter-grid"><label>총 예상 사업비<input className="field" value={value.estimatedProjectCost} onChange={event=>setValue({...value,estimatedProjectCost:event.target.value})} inputMode="numeric" required/></label><label>실제 집행액<input className="field" value={value.actualProjectCost} onChange={event=>setValue({...value,actualProjectCost:event.target.value})} inputMode="numeric" placeholder="집행 후 입력"/></label><label>관리비 추가 부과 총액<input className="field" value={value.additionalFeeTotal} onChange={event=>setValue({...value,additionalFeeTotal:event.target.value})} inputMode="numeric" required/></label><label>부담금 배분 기준<select className="field" value={value.allocationType} onChange={event=>setValue({...value,allocationType:event.target.value as AgendaCostImpactFormValue["allocationType"]})}><option value="EQUAL">대상 세대 균등 배분</option><option value="AREA">세대 면적 기준</option><option value="VOTING_RIGHT">의결권 기준</option><option value="NONE">세대 추가 부담 없음</option></select></label><label>배분 대상 세대<input className="field" type="number" value={value.eligibleUnitCount} onChange={event=>setValue({...value,eligibleUnitCount:Number(event.target.value)})} min={1} required/></label><label>예상 부과 시작월<input className="field" type="month" value={value.expectedBillingStartMonth} onChange={event=>setValue({...value,expectedBillingStartMonth:event.target.value})} required/></label><label>분할 부과 횟수<input className="field" type="number" value={value.installmentCount} onChange={event=>setValue({...value,installmentCount:Number(event.target.value)})} min={1} required/></label><label>현재 세대당 예상 부담액<input className="field" value={formatWon(value.estimatedAmountPerUnit)} readOnly/></label></div><label className="field-label" htmlFor="funding-source">비용 집행 재원</label><input className="field" id="funding-source" value={value.fundingSourceKo} onChange={event=>setValue({...value,fundingSourceKo:event.target.value})} required/><label className="field-label" htmlFor="resident-cost-explanation">입주민 공개 설명</label><textarea className="field" id="resident-cost-explanation" rows={5} value={value.residentExplanationKo} onChange={event=>setValue({...value,residentExplanationKo:event.target.value})} required/><div style={{display:"grid",gap:8,marginTop:14}}><label><input type="checkbox" checked={value.usesLongTermRepairReserve} onChange={event=>setValue({...value,usesLongTermRepairReserve:event.target.checked})}/> 장기수선충당금 사용</label><label><input type="checkbox" checked={value.requiresAdditionalFee} onChange={event=>setValue({...value,requiresAdditionalFee:event.target.checked})}/> 관리비 추가 부과 필요</label><label><input type="checkbox" checked={value.approved} onChange={event=>setValue({...value,approved:event.target.checked})}/> 주민 공개 요약 승인</label></div><button className="btn btn-primary" style={{marginTop:14}} disabled={busy}>{busy?"서버 계산 중…":"비용 영향 계산·저장"}</button></form>{message&&<p className="success" role="status">{message}</p>}{error&&<p className="error" role="alert">{error}</p>}</section>;
}
