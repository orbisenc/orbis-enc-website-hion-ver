import { randomUUID } from "node:crypto";
import type { ElectronicSignatureProvider, IdentityProvider, MalwareScanProvider, NotificationProvider, StoredObject, VerificationConfirmation } from "./types";
import { canUseDemoProviders } from "@/server/security/runtime";

const challenges = new Map<string, Date>();
export class MockIdentityProvider implements IdentityProvider {
  async requestVerification() {
    const transactionId = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60_000);
    challenges.set(transactionId, expiresAt);
    return { transactionId, expiresAt };
  }
  async confirmVerification({ transactionId, otp }: VerificationConfirmation) {
    const expiresAt = challenges.get(transactionId);
    const success = canUseDemoProviders() && otp === "123456" && Boolean(expiresAt && expiresAt > new Date());
    return { success, resultCode: success ? "본인 확인 완료" : "인증번호 불일치", verifiedAt: success ? new Date() : undefined };
  }
}
export class MockNotificationProvider implements NotificationProvider {
  async send() { return { success: true, providerMessageId: `개발-${randomUUID()}`, resultKo: "개발 알림함에 저장됨" }; }
}
export class MockMalwareScanProvider implements MalwareScanProvider {
  async scan(file: StoredObject) {
    const safe = !file.key.includes("검사실패");
    return { safe, reasonKo: safe ? "위험 요소가 발견되지 않음" : "시험용 악성 파일 규칙에 해당함" };
  }
}
export class DisabledElectronicSignatureProvider implements ElectronicSignatureProvider {
  async createSigningRequest() { return { enabled: false, messageKo: "승인된 전자서명 공급자가 연결되지 않았습니다." }; }
  async verify() { return { valid: false, messageKo: "전자서명을 확인할 수 없습니다." }; }
}
