"use client";

import { complaints as seededComplaints } from "@/data/apartmentOperations";
import { Camera, CheckCircle2, MessageSquarePlus, Search } from "lucide-react";
import { useState } from "react";

export function ComplaintsPage() {
  const [items, setItems] = useState(seededComplaints);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const filtered = items.filter((item) => `${item.name} ${item.location} ${item.category}`.includes(query));
  return <div className="facility-page"><div className="facility-page-heading"><div><span className="facility-eyebrow">개인정보 분리·공개 진행상태 제공</span><h1>입주민 민원</h1><p>민원을 공간·자산에 연결하고 필요한 경우 작업지시로 전환합니다.</p></div><button className="facility-button primary" type="button" onClick={() => setOpen((value) => !value)}><MessageSquarePlus size={16} /> 민원 등록</button></div>
    {open && <form className="facility-page-panel facility-complaint-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); const name = String(form.get("name") ?? "").trim(); const location = String(form.get("location") ?? "").trim(); const category = String(form.get("category") ?? ""); if (!name || !location) { setMessage("민원 제목과 위치를 입력해 주세요."); return; } setItems((current) => [{ id: `complaint-demo-${Date.now()}`, name, location, category, receivedAt: "2026.07.21", assetId: "", status: "접수", publicProgress: "관리사무소에서 내용을 확인하고 있습니다." }, ...current]); setMessage("민원이 접수되었습니다. 공개 진행상태에서 처리 과정을 확인할 수 있습니다."); event.currentTarget.reset(); }}><div className="facility-form-grid"><label><span>민원 제목 *</span><input name="name" placeholder="예: 지하주차장 배수 소음" /></label><label><span>분류 *</span><select name="category"><option>시설 고장</option><option>누수</option><option>주차</option><option>환경·악취</option><option>보안</option></select></label><label className="wide"><span>동·위치 *</span><input name="location" placeholder="예: 105동 지하 2층" /></label><label className="wide"><span>상세 설명</span><textarea name="description" placeholder="발생 시각과 현상을 적어 주세요." /></label><label className="wide"><span><Camera size={14} /> 사진 미리보기</span><input type="file" accept="image/jpeg,image/png,image/webp" /></label></div><div className="facility-modal-actions"><button className="facility-button secondary" type="button" onClick={() => setOpen(false)}>취소</button><button className="facility-button primary" type="submit">민원 접수</button></div></form>}
    {message && <p className="facility-action-message" role="status"><CheckCircle2 size={15} /> {message}</p>}
    <section className="facility-page-panel"><div className="facility-work-toolbar"><label><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="민원명, 위치, 분류 검색" /></label><span>{filtered.length}건</span></div><div className="facility-dark-table-wrap"><table><thead><tr><th>접수번호</th><th>민원</th><th>분류</th><th>위치</th><th>접수일</th><th>공개 진행상태</th><th>상태</th></tr></thead><tbody>{filtered.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.name}</td><td>{item.category}</td><td>{item.location}</td><td>{item.receivedAt}</td><td>{item.publicProgress}</td><td><span className="facility-table-status is-warning">{item.status}</span></td></tr>)}</tbody></table></div></section>
  </div>;
}
