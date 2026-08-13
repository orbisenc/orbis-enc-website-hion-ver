import { randomUUID } from "node:crypto";
import type { ResponseInput } from "@/lib/validation/contracts";
import { DEMO_TOKEN, demoAgenda, demoStore, evidenceHashes, recordEvent, withDemoLock, type DemoResponse } from "@/server/demo/store";
import { getDemoCampaignRecord } from "@/server/demo/agenda-campaign-store";
import { canUseDemoProviders } from "@/server/security/runtime";
import { FirebaseDashboardService } from "@/server/services/firebase-dashboard-service";

export class ResponseService {
  constructor(private readonly firebaseDashboard = new FirebaseDashboardService()) {}

  async submit(input: ResponseInput): Promise<DemoResponse> {
    const response = await withDemoLock(async () => {
      const existingByKey = demoStore.responses.find((item) => item.idempotencyKey === input.idempotencyKey);
      if (existingByKey) return existingByKey;
      const campaign = getDemoCampaignRecord("hion-demo");
      const now = new Date();
      if (campaign.status !== "OPEN" || now < new Date(campaign.startsAt) || now > new Date(campaign.endsAt)) throw new Error("현재 응답할 수 있는 기간이 아닙니다.");
      const verification = demoStore.verifications.get(input.verificationId);
      const statelessPublicDemoVerification = canUseDemoProviders() && input.token === DEMO_TOKEN;
      if ((!verification && !statelessPublicDemoVerification) || (verification && (verification.token !== input.token || verification.targetId !== demoAgenda.targetId))) {
        throw new Error("본인 확인이 만료되었습니다. 다시 확인해 주세요.");
      }
      const active = demoStore.responses.find(
        (item) => item.targetId === (verification?.targetId ?? demoAgenda.targetId) && item.state === "ACTIVE",
      );
      if (active && !campaign.allowResponseChange) return active;
      const submittedAt = new Date().toISOString();
      const response: DemoResponse = {
        id: randomUUID(),
        targetId: verification?.targetId ?? demoAgenda.targetId,
        verificationId: input.verificationId,
        idempotencyKey: input.idempotencyKey,
        option: input.option,
        comment: input.comment,
        receiptNumber: `HION-${submittedAt.slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`,
        submittedAt,
        state: "ACTIVE",
        previousId: active?.id,
        hashes: evidenceHashes(input.option, submittedAt),
      };
      if (active) active.state = "SUPERSEDED";
      demoStore.responses.push(response);
      recordEvent("response_submitted");
      return response;
    });
    try {
      await this.firebaseDashboard.sync(demoAgenda.tenantId, demoAgenda.campaignId);
    } catch {
      recordEvent("firebase_projection_failed");
    }
    return response;
  }

  getReceipt(token: string) {
    if (token !== demoAgenda.tenantId && token !== "demo-parking-change-1203") {
      throw new Error("초대 링크를 확인할 수 없습니다.");
    }
    return demoStore.responses.find((item) => item.targetId === demoAgenda.targetId && item.state === "ACTIVE") ?? null;
  }
}
