import { describe, expect, it } from "vitest";
import { formatLiveDateTime } from "@/components/common/live-date-time";

describe("실시간 날짜 표시", () => {
  it("서울 시간대의 한국어 날짜와 시각을 초 단위로 표시한다", () => {
    expect(formatLiveDateTime(new Date("2026-07-21T05:30:45.000Z"))).toBe("2026.07.21 (화) 14:30:45");
  });
});
