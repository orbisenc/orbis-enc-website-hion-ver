import type { InspectionStatus } from "@/types/facility";
import { z } from "zod";

export const inspectionDraftSchema = z.object({
  type: z.string().trim().min(2, "점검명은 2자 이상 입력해 주세요.").max(60, "점검명은 60자 이내로 입력해 주세요."),
  kind: z.enum(["정기", "수시"]),
  assetId: z.string().trim().min(1, "대상 객체를 선택해 주세요."),
  scheduledAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "예정일을 선택해 주세요."),
  assignee: z.string().trim().min(2, "담당자를 2자 이상 입력해 주세요.").max(40, "담당자는 40자 이내로 입력해 주세요."),
  checklist: z.array(z.string().trim().min(1)).min(1, "점검 항목을 한 개 이상 입력해 주세요.").max(12, "점검 항목은 최대 12개까지 등록할 수 있습니다."),
  memo: z.string().trim().max(500, "메모는 500자 이내로 입력해 주세요.").optional(),
});

export type InspectionDraft = z.infer<typeof inspectionDraftSchema>;

const allowedTransitions: Record<InspectionStatus, InspectionStatus[]> = {
  예정: ["진행", "지연"],
  진행: ["완료", "지연"],
  지연: ["진행", "완료"],
  완료: [],
};

export function canTransitionInspection(from: InspectionStatus, to: InspectionStatus) {
  return allowedTransitions[from].includes(to);
}

export function normalizeChecklist(value: string) {
  return value.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
}

export function toDateInput(value: string) {
  return value.replaceAll(".", "-");
}

export function toDisplayDate(value: string) {
  return value.replaceAll("-", ".");
}
