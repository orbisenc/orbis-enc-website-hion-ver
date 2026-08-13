import { describe, expect, it, vi } from "vitest";
import {
  FirestoreConsentDashboardRepository,
  getFirebaseServerConfig,
  type ConsentDashboardProjection,
} from "@/server/providers/firebase-firestore";

const config = {
  projectId: "hion-test",
  apiKey: "public-test-api-key",
  serviceAccountEmail: "hion@test.iam.gserviceaccount.com",
  serviceAccountPrivateKey: "사용하지 않는 테스트 키",
};

const projection: ConsentDashboardProjection = {
  tenantId: "hion-demo",
  campaignId: "demo-campaign",
  total: 2000,
  delivered: 1992,
  opened: 1348,
  verified: 1012,
  responded: 824,
  consent: 611,
  oppose: 186,
  abstain: 27,
  failed: 8,
  updatedAt: "2026-07-21T00:00:00.000Z",
  schemaVersion: 1,
};

describe("Firebase 서버 집계 저장소", () => {
  it("서버 자격 증명이 모두 있어야 활성화된다", () => {
    expect(getFirebaseServerConfig({ NEXT_PUBLIC_FIREBASE_PROJECT_ID: "hion-test", NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey })).toBeNull();
    expect(getFirebaseServerConfig({
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: "hion-test",
      NEXT_PUBLIC_FIREBASE_API_KEY: config.apiKey,
      FIREBASE_SERVICE_ACCOUNT_EMAIL: config.serviceAccountEmail,
      FIREBASE_SERVICE_ACCOUNT_PRIVATE_KEY: "line1\\nline2",
    })).toEqual({ ...config, serviceAccountPrivateKey: "line1\nline2" });
  });

  it("테넌트 전용 중첩 경로에 개인정보 없는 집계만 저장한다", async () => {
    let capturedUrl = "";
    let capturedRequest: RequestInit | undefined;
    const fetcher: typeof fetch = vi.fn(async (input, request) => {
      capturedUrl = String(input);
      capturedRequest = request;
      return new Response("{}", { status: 200 });
    });
    const repository = new FirestoreConsentDashboardRepository(config, fetcher, async () => "test-token");

    await repository.upsert(projection);

    expect(capturedUrl).toContain("/hionConsentRuntime/private/tenants/hion-demo/campaigns/demo-campaign");
    const body = String(capturedRequest?.body);
    expect(body).toContain('"responded":{"integerValue":"824"}');
    expect(body).not.toMatch(/phone|name|comment|receipt|targetId/i);
    expect(capturedRequest?.headers).toMatchObject({ authorization: "Bearer test-token" });
  });

  it("경로 구분자가 포함된 테넌트 식별자를 거부한다", async () => {
    const repository = new FirestoreConsentDashboardRepository(config, vi.fn(), async () => "test-token");
    await expect(repository.find("other/tenant", "demo-campaign")).rejects.toThrow();
  });
});
