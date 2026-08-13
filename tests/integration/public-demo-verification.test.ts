import { randomUUID } from "node:crypto";

import { beforeEach, describe, expect, it } from "vitest";

import { DEMO_TOKEN, confirmChallenge, resetDemoStore } from "@/server/demo/store";
import { resetAgendaCampaignDemoStore } from "@/server/demo/agenda-campaign-store";
import { ResponseService } from "@/server/services/response-service";

beforeEach(() => {
  resetDemoStore();
  resetAgendaCampaignDemoStore();
});

describe("공개 시연 격리 런타임 본인 확인", () => {
  it("인증 요청 메모리가 다른 격리 환경에 없어도 시연 응답을 제출한다", async () => {
    const verificationId = confirmChallenge(randomUUID(), "123456");

    expect(verificationId).toBeTruthy();
    const receipt = await new ResponseService().submit({
      token: DEMO_TOKEN,
      verificationId: verificationId!,
      option: "동의",
      idempotencyKey: randomUUID(),
      consentReviewed: true,
    });

    expect(receipt.option).toBe("동의");
    expect(receipt.receiptNumber).toMatch(/^HION-/);
  });
});
