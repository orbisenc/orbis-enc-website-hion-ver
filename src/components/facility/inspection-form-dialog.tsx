"use client";

import { Modal } from "@/components/common/modal";
import { inspectionDraftSchema, normalizeChecklist, toDateInput, type InspectionDraft } from "@/lib/validation/inspection";
import type { Asset, Inspection, InspectionKind } from "@/types/facility";
import { CalendarPlus, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";

interface InspectionFormDialogProps {
  assets: Asset[];
  initial?: Inspection;
  mode?: "create" | "edit" | "duplicate";
  presetAssetId?: string;
  title?: string;
  onClose(): void;
  onSubmit(draft: InspectionDraft): void;
}

const assignees = ["안전관리팀", "설비관리팀", "전기안전팀", "위생관리팀", "시설운영팀"];

function defaultScheduledAt() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function InspectionFormDialog({ assets, initial, mode = initial ? "edit" : "create", presetAssetId, title, onClose, onSubmit }: InspectionFormDialogProps) {
  const [type, setType] = useState(initial?.type ?? "");
  const [kind, setKind] = useState<InspectionKind>(initial?.kind ?? "정기");
  const [assetId, setAssetId] = useState(initial?.assetId ?? presetAssetId ?? "");
  const [scheduledAt, setScheduledAt] = useState(initial ? toDateInput(initial.scheduledAt) : defaultScheduledAt());
  const [assignee, setAssignee] = useState(initial?.assignee ?? "시설운영팀");
  const [checklist, setChecklist] = useState(initial?.checklist.join("\n") ?? "외관 및 손상 여부\n작동 상태\n안전 기준 충족 여부");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const selectedAsset = useMemo(() => assets.find((asset) => asset.id === assetId), [assetId, assets]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const parsed = inspectionDraftSchema.safeParse({ type, kind, assetId, scheduledAt, assignee, checklist: normalizeChecklist(checklist), memo });
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const field = String(issue.path[0] ?? "form");
        nextErrors[field] ??= issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    onSubmit(parsed.data);
  };

  const editing = mode === "edit";

  return <Modal title={title ?? (editing ? "점검 일정 수정" : mode === "duplicate" ? "점검 일정 복제" : "새 점검 등록")} onClose={onClose} size="large">
    <form className="facility-inspection-form" onSubmit={submit} noValidate>
      <div className="facility-form-scroll"><div className="facility-form-intro"><span><CalendarPlus size={22} /></span><div><strong>{editing ? "등록된 점검 일정을 수정합니다." : mode === "duplicate" ? "기존 내용을 바탕으로 새 일정을 등록합니다." : "점검 일정과 담당 업무를 등록합니다."}</strong><p>필수 항목과 체크리스트를 입력하면 점검 관리 목록에 즉시 반영됩니다.</p></div></div>
        {Object.keys(errors).length > 0 && <div className="facility-form-error-summary" role="alert">입력 내용을 확인해 주세요. 표시된 필수 항목을 모두 작성해야 저장할 수 있습니다.</div>}
        <div className="facility-form-grid">
        <label className="wide"><span>점검명 <em>필수</em></span><input data-autofocus value={type} onChange={(event) => setType(event.target.value)} aria-invalid={Boolean(errors.type)} placeholder="예: 소방시설 작동기능점검" />{errors.type && <small>{errors.type}</small>}</label>
        <fieldset><legend>점검 구분 <em>필수</em></legend><div className="facility-segmented-control">{(["정기", "수시"] as const).map((item) => <label key={item} className={kind === item ? "is-active" : ""}><input type="radio" name="inspection-kind" value={item} checked={kind === item} onChange={() => setKind(item)} /><span>{item}점검</span></label>)}</div></fieldset>
        <label><span>예정일 <em>필수</em></span><input type="date" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} aria-invalid={Boolean(errors.scheduledAt)} />{errors.scheduledAt && <small>{errors.scheduledAt}</small>}</label>
        <label className="wide"><span>대상 객체 <em>필수</em></span><select value={assetId} onChange={(event) => setAssetId(event.target.value)} aria-invalid={Boolean(errors.assetId)}><option value="">대상 객체 선택</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.locationLabel}</option>)}</select>{selectedAsset && <small className="is-hint">{selectedAsset.serialNumber}</small>}{errors.assetId && <small>{errors.assetId}</small>}</label>
        <label><span>담당자 <em>필수</em></span><select value={assignee} onChange={(event) => setAssignee(event.target.value)}>{assignees.map((item) => <option key={item}>{item}</option>)}</select>{errors.assignee && <small>{errors.assignee}</small>}</label>
        <label className="wide"><span>점검 항목 <em>필수</em></span><span className="facility-input-with-icon"><ClipboardList size={17} /><textarea value={checklist} onChange={(event) => setChecklist(event.target.value)} aria-invalid={Boolean(errors.checklist)} rows={4} placeholder="한 줄에 점검 항목 하나씩 입력해 주세요." /></span><small className={errors.checklist ? "" : "is-hint"}>{errors.checklist ?? "한 줄에 하나씩 입력하며 최대 12개까지 등록할 수 있습니다."}</small></label>
        <label className="wide"><span>관리 메모</span><textarea value={memo} onChange={(event) => setMemo(event.target.value)} rows={3} maxLength={500} placeholder="출입 협조, 준비물, 주의사항 등을 입력해 주세요." />{errors.memo && <small>{errors.memo}</small>}<small className="is-hint is-count">{memo.length}/500</small></label>
        </div>
      </div>
      <footer className="facility-modal-actions"><button type="button" className="facility-button secondary" onClick={onClose}>취소</button><button type="submit" className="facility-button primary">{editing ? "변경사항 저장" : mode === "duplicate" ? "복제 일정 등록" : "점검 등록"}</button></footer>
    </form>
  </Modal>;
}
