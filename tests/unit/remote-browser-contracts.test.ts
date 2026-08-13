import { describe, expect, it } from "vitest";
import { createRemoteBrowserSessionSchema, remoteBrowserActionSchema } from "@/lib/remote-browser/contracts";

describe("원격 브라우저 요청 계약", () => {
  it("세션 화면 크기를 제한한다", () => {
    expect(createRemoteBrowserSessionSchema.safeParse({ width: 1440, height: 900 }).success).toBe(true);
    expect(createRemoteBrowserSessionSchema.safeParse({ width: 5000, height: 900 }).success).toBe(false);
  });

  it("허용한 키보드 입력만 통과시킨다", () => {
    expect(remoteBrowserActionSchema.safeParse({ type: "key", key: "Enter" }).success).toBe(true);
    expect(remoteBrowserActionSchema.safeParse({ type: "key", key: "F12" }).success).toBe(false);
  });

  it("화면 클릭 좌표를 검증한다", () => {
    expect(remoteBrowserActionSchema.safeParse({ type: "click", x: 320, y: 240, button: "left" }).success).toBe(true);
    expect(remoteBrowserActionSchema.safeParse({ type: "click", x: -1, y: 240, button: "left" }).success).toBe(false);
  });

  it("한글 IME 조합 업데이트와 확정을 허용한다", () => {
    expect(remoteBrowserActionSchema.safeParse({ type: "composition", phase: "update", text: "한" }).success).toBe(true);
    expect(remoteBrowserActionSchema.safeParse({ type: "composition", phase: "commit", text: "한글" }).success).toBe(true);
  });

  it("과도하게 큰 텍스트 입력을 거부한다", () => {
    expect(remoteBrowserActionSchema.safeParse({ type: "type", text: "가".repeat(1001) }).success).toBe(false);
  });
});
