"use client";

import { useRef, useState } from "react";
import { facilityTypes, inquiryTypes } from "@/content/site";
import { trackMarketingEvent } from "@/lib/analytics/marketing";
import { inquirySchema } from "@/lib/validation/inquiry";

type FormErrors = Record<string, string>;
type Defaults = { inquiryType?: string; facilityType?: string };

function inputValue(form: FormData, key: string) { return String(form.get(key) ?? ""); }
function payloadFrom(form: HTMLFormElement) {
  const data = new FormData(form);
  return {
    inquiryType: inputValue(data,"inquiryType"), organization: inputValue(data,"organization"), name: inputValue(data,"name"),
    department: inputValue(data,"department"), email: inputValue(data,"email"), phone: inputValue(data,"phone"),
    facilityType: inputValue(data,"facilityType"), facilityScale: inputValue(data,"facilityScale"), desiredTiming: inputValue(data,"desiredTiming"),
    message: inputValue(data,"message"), privacyConsent: data.get("privacyConsent") === "on", website: inputValue(data,"website"),
  };
}

export function ContactForm({ defaults = {} }: { defaults?: Defaults }) {
  const [errors,setErrors]=useState<FormErrors>({});
  const [status,setStatus]=useState<{kind:"success"|"error";message:string}|null>(null);
  const [pending,setPending]=useState(false);
  const statusRef=useRef<HTMLDivElement>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus(null);
    const form=event.currentTarget;
    const payload=payloadFrom(form);
    const parsed=inquirySchema.safeParse(payload);
    if(!parsed.success){const next:FormErrors={};for(const issue of parsed.error.issues){const key=String(issue.path[0]??"form");next[key]??=issue.message;}setErrors(next);requestAnimationFrame(()=>document.getElementById(Object.keys(next)[0])?.focus());return;}
    setErrors({}); setPending(true); trackMarketingEvent({event:"contact_form_started",page:"/contact"});
    try{
      const response=await fetch("/api/inquiries",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(parsed.data)});
      const result=await response.json() as {ok:boolean;message?:string;fields?:FormErrors};
      if(!response.ok){setErrors(result.fields??{});setStatus({kind:"error",message:result.message??"입력 내용을 확인해 주세요."});}
      else{setStatus({kind:"success",message:result.message??"문의가 접수되었습니다."});form.reset();trackMarketingEvent({event:"contact_form_submitted",page:"/contact"});}
    }catch{setStatus({kind:"error",message:"네트워크 연결을 확인한 뒤 다시 시도해 주세요."});}
    finally{setPending(false);requestAnimationFrame(()=>statusRef.current?.focus());}
  }

  const field=(name:string,label:string,required:boolean,input:React.ReactNode)=><div className={`form-field ${name==="message"?"form-field-full":""}`}><label htmlFor={name}>{label}{required?<span className="required-mark" aria-hidden="true"> *</span>:null}</label>{input}{errors[name]?<p className="form-error" id={`${name}-error`}>{errors[name]}</p>:null}</div>;
  const props=(name:string)=>({id:name,name,className:"marketing-input",required:["inquiryType","organization","name","email","phone","facilityType","message"].includes(name),"aria-invalid":Boolean(errors[name]),"aria-describedby":errors[name]?`${name}-error`:undefined});
  return <form className="contact-form" noValidate onSubmit={onSubmit} onFocus={()=>trackMarketingEvent({event:"contact_form_started",page:"/contact"})}>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">웹사이트</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <div className="form-grid">
      {field("inquiryType","문의 유형",true,<select {...props("inquiryType")} defaultValue={defaults.inquiryType??""}><option value="" disabled>선택해 주세요</option>{inquiryTypes.map(v=><option key={v}>{v}</option>)}</select>)}
      {field("organization","기관·회사명",true,<input {...props("organization")} autoComplete="organization" />)}
      {field("name","이름",true,<input {...props("name")} autoComplete="name" />)}
      {field("department","부서·직책",false,<input {...props("department")} autoComplete="organization-title" />)}
      {field("email","업무 이메일",true,<input {...props("email")} type="email" autoComplete="email" inputMode="email" />)}
      {field("phone","연락처",true,<input {...props("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="010-0000-0000" />)}
      {field("facilityType","시설 유형",true,<select {...props("facilityType")} defaultValue={defaults.facilityType??""}><option value="" disabled>선택해 주세요</option>{facilityTypes.map(v=><option key={v}>{v}</option>)}</select>)}
      {field("facilityScale","대상 규모",false,<input {...props("facilityScale")} placeholder="예: 3개 동, 연면적 등" />)}
      {field("desiredTiming","도입 시기",false,<input {...props("desiredTiming")} placeholder="예: 검토 중, 2027년 상반기" />)}
      {field("message","문의 내용",true,<><textarea {...props("message")} minLength={20} maxLength={1000} /><p className="form-help">20자 이상 1,000자 이하로 작성해 주세요.</p></>)}
    </div>
    <label className="consent-box"><input id="privacyConsent" name="privacyConsent" type="checkbox" required aria-invalid={Boolean(errors.privacyConsent)} aria-describedby={errors.privacyConsent?"privacyConsent-error":undefined}/><span>개인정보 수집·이용에 동의합니다. <span className="required-mark">필수</span><small>문의 응대를 위해 입력한 정보를 사용합니다. 자세한 내용은 개인정보처리방침에서 확인할 수 있습니다.</small>{errors.privacyConsent?<small className="form-error" id="privacyConsent-error">{errors.privacyConsent}</small>:null}</span></label>
    {status?<div ref={statusRef} className={`form-status ${status.kind}`} role={status.kind==="error"?"alert":"status"} tabIndex={-1}>{status.message}</div>:null}
    <button className="marketing-button button-primary form-submit" disabled={pending} type="submit">{pending?"접수 가능 여부 확인 중…":"상담 요청 보내기"}</button>
  </form>;
}
