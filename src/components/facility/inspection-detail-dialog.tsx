"use client";

import { Modal } from "@/components/common/modal";
import type { Asset, Inspection, InspectionStatus } from "@/types/facility";
import { CalendarClock, CheckCircle2, ClipboardCheck, Copy, MapPin, Pencil, Play, Trash2, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface InspectionDetailDialogProps {
  inspection: Inspection;
  asset?: Asset;
  onClose(): void;
  onEdit(): void;
  onDuplicate(): void;
  onDelete(): void;
  onTransition(status: InspectionStatus, result?: string): void;
}

const statusOrder: InspectionStatus[] = ["예정", "진행", "완료"];

export function InspectionDetailDialog({ inspection, asset, onClose, onEdit, onDuplicate, onDelete, onTransition }: InspectionDetailDialogProps) {
  const [completing, setCompleting] = useState(false);
  const [result, setResult] = useState(inspection.result ?? "");
  const [error, setError] = useState("");
  const activeStep = inspection.status === "지연" ? 0 : statusOrder.indexOf(inspection.status);

  const transition = (status: InspectionStatus, completionResult?: string) => {
    try {
      onTransition(status, completionResult);
      setCompleting(false);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "상태를 변경하지 못했습니다.");
    }
  };

  const remove = () => {
    if (window.confirm(`‘${inspection.type}’ 점검 일정을 삭제하시겠습니까?`)) onDelete();
  };

  return <Modal title="점검 상세" onClose={onClose} size="large">
    <div className="facility-inspection-detail">
      <section className="facility-inspection-hero"><div><span className={`facility-table-status is-${inspection.status === "완료" ? "success" : inspection.status === "지연" ? "danger" : inspection.status === "진행" ? "warning" : "info"}`}>{inspection.status}</span><small>{inspection.kind}점검 · {inspection.id.startsWith("inspection-") ? inspection.id.slice(-8).toUpperCase() : inspection.id}</small><h3>{inspection.type}</h3><p>{asset?.name ?? "공용 설비"}</p></div><ClipboardCheck size={46} /></section>

      <ol className="facility-inspection-progress" aria-label={`현재 점검 상태 ${inspection.status}`}>
        {statusOrder.map((status, index) => <li key={status} className={index <= activeStep ? "is-active" : ""}><i>{index < activeStep ? <CheckCircle2 size={15} /> : index + 1}</i><span>{status}</span></li>)}
      </ol>
      {inspection.status === "지연" && <div className="facility-delay-notice" role="status">예정일이 지나 지연 상태입니다. 담당자와 일정을 확인한 뒤 점검을 시작해 주세요.</div>}

      <div className="facility-inspection-detail-grid">
        <section><h4>일정 및 담당</h4><dl>
          <div><dt><CalendarClock size={15} /> 예정일</dt><dd>{inspection.scheduledAt}</dd></div>
          <div><dt><UserRound size={15} /> 담당자</dt><dd>{inspection.assignee}</dd></div>
          <div><dt><MapPin size={15} /> 대상 위치</dt><dd>{asset?.locationLabel ?? "시설 공용 구역"}</dd></div>
          <div><dt>객체번호</dt><dd>{asset?.serialNumber ?? "공용 점검"}</dd></div>
          <div><dt>최근 수정</dt><dd>{inspection.updatedAt}</dd></div>
        </dl>{asset && <Link className="facility-text-link" href={`/assets/${asset.id}`}>대상 객체 상세 보기</Link>}</section>
        <section><h4>점검 체크리스트 <small>{inspection.checklist.length}개</small></h4><ul className="facility-checklist-view">{inspection.checklist.map((item, index) => <li key={`${item}-${index}`}><CheckCircle2 size={16} /><span>{item}</span></li>)}</ul></section>
      </div>

      {(inspection.memo || inspection.result) && <section className="facility-inspection-notes">{inspection.memo && <div><h4>관리 메모</h4><p>{inspection.memo}</p></div>}{inspection.result && <div className="is-result"><h4>점검 결과</h4><p>{inspection.result}</p>{inspection.completedAt && <small>완료 처리 {inspection.completedAt}</small>}</div>}</section>}

      {completing && <section className="facility-completion-box"><label><span>점검 결과 <em>필수</em></span><textarea data-autofocus value={result} onChange={(event) => setResult(event.target.value)} rows={3} placeholder="확인한 상태와 후속 조치를 구체적으로 입력해 주세요." /></label>{error && <p role="alert">{error}</p>}<div><button type="button" className="facility-button secondary" onClick={() => setCompleting(false)}>취소</button><button type="button" className="facility-button primary" onClick={() => transition("완료", result)}>완료 저장</button></div></section>}

      {!completing && error && <p className="facility-action-error" role="alert">{error}</p>}
      <footer className="facility-inspection-actions">
        <div><button type="button" className="facility-button danger-outline" onClick={remove}><Trash2 size={15} /> 삭제</button><button type="button" className="facility-button secondary" onClick={onDuplicate}><Copy size={15} /> 일정 복제</button><button type="button" className="facility-button secondary" onClick={onEdit} disabled={inspection.status === "완료"}><Pencil size={15} /> 수정</button></div>
        <div>{(inspection.status === "예정" || inspection.status === "지연") && <button type="button" className="facility-button primary" onClick={() => transition("진행")}><Play size={15} /> 점검 시작</button>}{inspection.status === "진행" && <button type="button" className="facility-button primary" onClick={() => setCompleting(true)}><CheckCircle2 size={15} /> 완료 처리</button>}<button type="button" className="facility-button secondary" onClick={onClose}>닫기</button></div>
      </footer>
    </div>
  </Modal>;
}
