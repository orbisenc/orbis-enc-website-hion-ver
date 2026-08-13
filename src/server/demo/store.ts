import { randomUUID } from "node:crypto";
import { sha256 } from "@/lib/security/hash";
import { DEMO_CONSENT } from "@/lib/demo-content";
import { canUseDemoProviders } from "@/server/security/runtime";

export const DEMO_TOKEN = "demo-parking-change-1203";
export const DEMO_PHONE = "010-0000-1203";
export const DEMO_CAMPAIGN_STARTS_AT = "2026-01-01T00:00:00.000Z";
export const DEMO_CAMPAIGN_ENDS_AT = "2099-12-31T14:59:59.000Z";
export { DEMO_CONSENT };

export type ResponseOption = "동의" | "반대" | "기권";
export interface DemoResponse {
  id: string;
  targetId: string;
  verificationId: string;
  idempotencyKey: string;
  option: ResponseOption;
  comment?: string;
  receiptNumber: string;
  submittedAt: string;
  state: "ACTIVE" | "SUPERSEDED";
  previousId?: string;
  hashes: { agenda: string; consent: string; content: string; seal: string };
}

export interface DemoAgendaAttachment {
  id: string;
  tenantId: string;
  agendaId: string;
  name: string;
  mimeType: string;
  size: number;
  sha256: string;
  altTextKo: string;
  storageKey: string;
  uploadedAt: string;
}

interface DemoVerification {
  token: string;
  phoneHash: string;
  verifiedAt: string;
  targetId: string;
}

interface DemoState {
  challenges: Map<string, { token: string; phoneHash: string; expiresAt: number }>;
  verifications: Map<string, DemoVerification>;
  responses: DemoResponse[];
  analytics: Array<{ eventName: string; occurredAt: string; metadata?: Record<string, string> }>;
  notifications: Array<{ id: string; contentKo: string; state: string; sentAt: string; segmentKo: string; targetCount: number; channelKo: string }>;
  agendaAttachments: DemoAgendaAttachment[];
}

const globalStore = globalThis as typeof globalThis & {
  __hionDemo?: DemoState;
  __hionLock?: Promise<void>;
};

export const demoStore: DemoState = (globalStore.__hionDemo ??= {
  challenges: new Map(),
  verifications: new Map(),
  responses: [],
  analytics: [],
  notifications: [],
  agendaAttachments: [],
});

demoStore.agendaAttachments ??= [];

export const demoAgenda = {
  tenantId: "hion-demo",
  campaignId: "demo-campaign",
  targetId: "demo-target-1203",
  complexName: "해오름 아파트",
  building: "101동",
  unit: "1203호",
  rightType: "소유자 의결권 1개",
  title: "지하주차장 방화문 출입을 위한 주차 라인 위치 변경 안건",
  summary: "방화문 앞 통행 공간을 확보하고 차량과 보행자의 접근성을 개선합니다.",
  background: "현재 주차선이 방화문 통행 범위와 가까워 긴급 상황 이동과 일상 점검에 불편이 있습니다.",
  changeScope: "지하 1층 101동 출입구 인근 주차면 4곳의 선을 조정하고 안전 유도선을 추가합니다.",
  benefit: "방화문 앞 통행 폭을 확보하고 차량 문 열림과 보행 동선을 분리할 수 있습니다.",
  schedule: "의견 수렴 종료 후 관리주체 검토를 거쳐 공사 일정을 별도로 안내합니다.",
  cautions: "공사 중 해당 구역은 일시 통제될 수 있으며 확정 일정은 입주민께 미리 알립니다.",
  contact: "관리사무소 시설팀 · 02-000-0000",
  agendaVersion: "1.0",
  consentVersion: "1.0",
  contentVersion: "1.0",
  consentText: DEMO_CONSENT,
  // Workers can evaluate module-level clocks outside a request and return the
  // Unix epoch. Fixed demo dates keep the public walkthrough available.
  startsAt: DEMO_CAMPAIGN_STARTS_AT,
  endsAt: DEMO_CAMPAIGN_ENDS_AT,
};

export async function withDemoLock<T>(task: () => Promise<T> | T): Promise<T> {
  const previous = globalStore.__hionLock ?? Promise.resolve();
  let release!: () => void;
  globalStore.__hionLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  await previous;
  try {
    return await task();
  } finally {
    release();
  }
}

export function resetDemoStore() {
  demoStore.challenges.clear();
  demoStore.verifications.clear();
  demoStore.responses.splice(0);
  demoStore.analytics.splice(0);
  demoStore.notifications.splice(0);
  demoStore.agendaAttachments.splice(0);
}

export function recordEvent(eventName: string, metadata?: Record<string, string>) {
  demoStore.analytics.push({ eventName, occurredAt: new Date().toISOString(), metadata });
}

export function createChallenge(token: string, phone: string) {
  const transactionId = randomUUID();
  demoStore.challenges.set(transactionId, {
    token,
    phoneHash: sha256(phone),
    expiresAt: Date.now() + 5 * 60_000,
  });
  return transactionId;
}

export function confirmChallenge(transactionId: string, otp: string) {
  const challenge = demoStore.challenges.get(transactionId);
  const storedChallengeIsValid = Boolean(challenge && challenge.expiresAt > Date.now());
  const statelessPublicDemoChallenge = !challenge && canUseDemoProviders();
  const success = otp === "123456" && canUseDemoProviders() && (storedChallengeIsValid || statelessPublicDemoChallenge);
  if (!success) return null;
  const id = randomUUID();
  demoStore.verifications.set(id, {
    token: challenge?.token ?? DEMO_TOKEN,
    phoneHash: challenge?.phoneHash ?? sha256(DEMO_PHONE),
    targetId: demoAgenda.targetId,
    verifiedAt: new Date().toISOString(),
  });
  if (challenge) demoStore.challenges.delete(transactionId);
  recordEvent("verification_completed");
  return id;
}

export function getDashboard() {
  const active = demoStore.responses.filter((item) => item.state === "ACTIVE");
  return {
    total: 2000,
    delivered: 1992,
    opened: 1348,
    verified: 1012,
    responded: 824 + active.length,
    consent: 611 + active.filter((item) => item.option === "동의").length,
    oppose: 186 + active.filter((item) => item.option === "반대").length,
    abstain: 27 + active.filter((item) => item.option === "기권").length,
    failed: 8,
    deadlineDays: 7,
    notifications: demoStore.notifications.length,
  };
}

export function evidenceHashes(option: string, submittedAt: string) {
  const agenda = sha256({
    title: demoAgenda.title,
    summary: demoAgenda.summary,
    version: demoAgenda.agendaVersion,
  });
  const consent = sha256(demoAgenda.consentText);
  const content = sha256({
    scene: "parking-procedural-v1",
    fallback: "parking-comparison-v1",
    attachments: demoStore.agendaAttachments.map(({ name, mimeType, size, sha256: fileHash }) => ({ name, mimeType, size, fileHash })),
  });
  return { agenda, consent, content, seal: sha256({ agenda, consent, content, option, submittedAt }) };
}
