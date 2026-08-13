"use client";

import { useState } from "react";
import type { PublicAgendaAttachment } from "@/server/services/agenda-attachment-service";

function formatFileSize(size: number) {
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)}KB`;
  return `${(size / (1024 * 1024)).toFixed(1)}MB`;
}

export function AgendaAttachmentManager({ agendaId, initialAttachments }: { agendaId: string; initialAttachments: PublicAgendaAttachment[] }) {
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploading(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    const response = await fetch(`/api/admin/agendas/${encodeURIComponent(agendaId)}/attachments`, { method: "POST", body: new FormData(form) });
    const data = await response.json() as { attachment?: PublicAgendaAttachment; error?: string };
    if (!response.ok || !data.attachment) {
      setError(data.error ?? "첨부 자료를 저장하지 못했습니다.");
    } else {
      setAttachments((current) => { const next = [...current, data.attachment!]; window.dispatchEvent(new CustomEvent("agenda-attachments-changed", { detail: next.length })); return next; });
      setMessage("첨부 자료가 안건에 저장되어 입주민 화면에 공개됩니다.");
      form.reset();
    }
    setUploading(false);
  }

  async function remove(attachment: PublicAgendaAttachment) {
    if (!window.confirm(`${attachment.name} 파일을 주민 공개 자료에서 삭제하시겠습니까?`)) return;
    setUploading(true); setError(""); setMessage("");
    const response = await fetch(`/api/admin/agendas/${encodeURIComponent(agendaId)}/attachments`, { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ attachmentId: attachment.id }) });
    const data = await response.json() as { ok?: boolean; error?: string };
    if (!response.ok) setError(data.error ?? "첨부 자료를 삭제하지 못했습니다.");
    else { setAttachments((current) => { const next = current.filter((item) => item.id !== attachment.id); window.dispatchEvent(new CustomEvent("agenda-attachments-changed", { detail: next.length })); return next; }); setMessage("첨부 자료를 주민 공개 목록에서 삭제했습니다."); }
    setUploading(false);
  }

  return <section className="card" style={{ marginTop: 22 }}>
    <h2>안건 첨부 자료</h2>
    <p className="muted">안건에 직접 첨부한 자료만 입주민의 안건 확인 화면에 표시됩니다. PDF·JPG·PNG·WebP·MP4, 파일당 최대 20MB</p>
    <form onSubmit={upload}>
      <label className="field-label" htmlFor="agenda-file">첨부 파일</label>
      <input className="field" id="agenda-file" name="file" type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,.mp4" required />
      <label className="field-label" htmlFor="attachment-alt">입주민 안내 설명</label>
      <input className="field" id="attachment-alt" name="altTextKo" placeholder="예: 변경 전·후 주차선 배치도" minLength={2} maxLength={200} required />
      <button className="btn btn-primary" style={{ marginTop: 14 }} disabled={uploading}>{uploading ? "첨부 중…" : "안건에 첨부"}</button>
    </form>
    {error && <p className="error" role="alert">{error}</p>}
    {message && <p className="success" role="status">{message}</p>}
    <h3 style={{ marginTop: 24 }}>입주민 공개 자료 {attachments.length}개</h3>
    {attachments.length === 0 ? <p className="muted">아직 이 안건에 첨부된 자료가 없습니다.</p> : <div className="table-wrap"><table><thead><tr><th>파일명</th><th>설명</th><th>형식</th><th>크기</th><th>공개 상태</th><th>관리</th></tr></thead><tbody>{attachments.map((item) => <tr key={item.id}><td><a href={item.href} target="_blank" rel="noreferrer">{item.name}</a></td><td>{item.altTextKo}</td><td>{item.mimeType}</td><td>{formatFileSize(item.size)}</td><td><span className="pill">주민 공개</span></td><td><button className="btn" type="button" disabled={uploading} onClick={() => void remove(item)}>삭제</button></td></tr>)}</tbody></table></div>}
  </section>;
}
