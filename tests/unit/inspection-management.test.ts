import { canTransitionInspection, inspectionDraftSchema, normalizeChecklist, toDisplayDate } from "@/lib/validation/inspection";
import { describe, expect, it } from "vitest";

describe("점검 관리 업무 규칙", () => {
  it("필수 입력과 체크리스트가 준비된 점검만 등록한다", () => {
    const result = inspectionDraftSchema.safeParse({
      type: "체육관 비상유도등 점검",
      kind: "정기",
      assetId: "asset-exit-007",
      scheduledAt: "2026-08-12",
      assignee: "안전관리팀",
      checklist: ["점등 상태", "축전지 전압"],
      memo: "",
    });
    expect(result.success).toBe(true);
  });

  it("대상 객체와 점검 항목이 없으면 등록을 거부한다", () => {
    const result = inspectionDraftSchema.safeParse({ type: "점검", kind: "정기", assetId: "", scheduledAt: "", assignee: "팀", checklist: [], memo: "" });
    expect(result.success).toBe(false);
  });

  it("체크리스트 입력에서 빈 줄을 제거한다", () => {
    expect(normalizeChecklist("외관 확인\n\n 작동 상태 \n")).toEqual(["외관 확인", "작동 상태"]);
  });

  it("예정→진행→완료 순서만 허용한다", () => {
    expect(canTransitionInspection("예정", "진행")).toBe(true);
    expect(canTransitionInspection("진행", "완료")).toBe(true);
    expect(canTransitionInspection("예정", "완료")).toBe(false);
    expect(canTransitionInspection("완료", "진행")).toBe(false);
  });

  it("입력용 날짜를 화면 표시 형식으로 변환한다", () => {
    expect(toDisplayDate("2026-08-12")).toBe("2026.08.12");
  });
});
