import { describe, expect, it } from "vitest";
import { isHionFirebaseConfigured } from "@/lib/firebase/client";
import { getFirebaseBackendStatus } from "@/server/providers/firebase";

const config = {
  apiKey: "공개-시험-키",
  authDomain: "hion.example.test",
  projectId: "hion-test",
  storageBucket: "hion-test.example.test",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:test",
};

describe("Firebase HION Consent 설정", () => {
  it("필수 공개 설정이 모두 있으면 연결 준비 상태다", () => {
    expect(isHionFirebaseConfigured(config)).toBe(true);
    expect(getFirebaseBackendStatus(config, {})).toMatchObject({
      configured: true,
      projectId: "hion-test",
      appId: "1:1234567890:web:test",
      databaseRegion: "asia-northeast3",
      serverConfigured: false,
      dataPath: "hionConsentRuntime/private/tenants/{tenantId}/campaigns/{campaignId}",
    });
  });

  it("프로젝트 ID가 없으면 연결되지 않은 상태다", () => {
    expect(isHionFirebaseConfigured({ ...config, projectId: undefined })).toBe(false);
  });
});
