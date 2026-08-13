import { randomUUID } from "node:crypto";

import { demoAgenda } from "@/server/demo/store";
import { getApprovedAgendaCostImpact } from "@/server/demo/fee-store";
import { canTransitionCampaign, type CampaignState } from "@/server/policies/campaign";

export type AgendaWorkflowState = "DRAFT" | "IN_REVIEW" | "APPROVED" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export interface DemoAgendaRecord {
  id: string;
  tenantId: string;
  titleKo: string;
  categoryKo: string;
  state: AgendaWorkflowState;
  ownerKo: string;
  version: number;
  summaryKo: string;
  backgroundKo: string;
  changeScopeKo: string;
  benefitKo: string;
  scheduleKo: string;
  cautionsKo: string;
  contactKo: string;
  consentTextKo: string;
  options: string[];
  reviewerFeedbackKo: string | null;
  updatedAt: string;
  publishedAt: string | null;
}

export interface DemoCampaignRecord {
  id: string;
  tenantId: string;
  nameKo: string;
  agendaId: string;
  rosterVersionKo: string;
  startsAt: string;
  endsAt: string;
  mode: "OPINION" | "MANAGEMENT_VOTE" | "LEGAL_CONSENT";
  verificationLevel: "SIMPLE_OTP" | "IDENTITY_MATCH" | "STRONG_SIGNATURE";
  anonymous: boolean;
  allowResponseChange: boolean;
  allowWithdrawal: boolean;
  quorumPercentage: number;
  approvalPercentage: number;
  resultDisclosure: "AFTER_CLOSE" | "REAL_TIME" | "ADMIN_ONLY";
  status: CampaignState;
  updatedAt: string;
  publishedAt: string | null;
}

export interface AgendaCampaignAudit {
  id: string;
  tenantId: string;
  actionKo: string;
  objectTypeKo: "안건" | "안건 현황" | "재안내";
  objectId: string;
  actorKo: string;
  detailKo: string;
  occurredAt: string;
}

interface AgendaCampaignState {
  agenda: DemoAgendaRecord;
  campaign: DemoCampaignRecord;
  audits: AgendaCampaignAudit[];
}

function initialAgenda(): DemoAgendaRecord {
  return {
    id: "demo-agenda",
    tenantId: "hion-demo",
    titleKo: demoAgenda.title,
    categoryKo: "시설 개선",
    state: "PUBLISHED",
    ownerKo: "콘텐츠 담당자",
    version: 1,
    summaryKo: demoAgenda.summary,
    backgroundKo: demoAgenda.background,
    changeScopeKo: demoAgenda.changeScope,
    benefitKo: demoAgenda.benefit,
    scheduleKo: demoAgenda.schedule,
    cautionsKo: demoAgenda.cautions,
    contactKo: demoAgenda.contact,
    consentTextKo: "본인은 안건 설명과 변경 전후 자료를 확인했으며 선택한 의견을 제출합니다.",
    options: ["동의", "반대", "기권"],
    reviewerFeedbackKo: null,
    updatedAt: "2026-07-15T02:00:00.000Z",
    publishedAt: "2026-07-15T02:00:00.000Z",
  };
}

function initialCampaign(): DemoCampaignRecord {
  return {
    id: "demo-campaign",
    tenantId: "hion-demo",
    nameKo: "2026년 주차 환경 개선",
    agendaId: "demo-agenda",
    rosterVersionKo: "2026년 7월 확정 명부 · 2,000권리",
    startsAt: demoAgenda.startsAt,
    endsAt: demoAgenda.endsAt,
    mode: "MANAGEMENT_VOTE",
    verificationLevel: "SIMPLE_OTP",
    anonymous: false,
    allowResponseChange: true,
    allowWithdrawal: false,
    quorumPercentage: 50,
    approvalPercentage: 50,
    resultDisclosure: "AFTER_CLOSE",
    status: "OPEN",
    updatedAt: "2026-07-15T02:10:00.000Z",
    publishedAt: "2026-07-15T02:10:00.000Z",
  };
}

const globalState = globalThis as typeof globalThis & { __hionAgendaCampaignDemo?: AgendaCampaignState };
export const agendaCampaignStore: AgendaCampaignState = (globalState.__hionAgendaCampaignDemo ??= {
  agenda: initialAgenda(),
  campaign: initialCampaign(),
  audits: [],
});

function assertScope(tenantId: string, resourceTenantId: string) {
  if (tenantId !== resourceTenantId) throw new Error("다른 단지의 안건에 접근할 수 없습니다.");
}

export function getDemoAgendaRecord(tenantId: string, agendaId = "demo-agenda") {
  const agenda = agendaCampaignStore.agenda;
  assertScope(tenantId, agenda.tenantId);
  if (agenda.id !== agendaId) throw new Error("안건을 찾을 수 없습니다.");
  return { ...agenda, options: [...agenda.options] };
}

export function listDemoAgendas(tenantId: string) {
  return [getDemoAgendaRecord(tenantId)];
}

export function saveDemoAgenda(tenantId: string, input: Omit<DemoAgendaRecord, "id" | "tenantId" | "state" | "ownerKo" | "version" | "reviewerFeedbackKo" | "updatedAt" | "publishedAt">) {
  const agenda = agendaCampaignStore.agenda;
  assertScope(tenantId, agenda.tenantId);
  if (agenda.state !== "DRAFT") throw new Error("초안 상태에서만 내용을 수정할 수 있습니다. 새 버전을 만들어 주세요.");
  Object.assign(agenda, input, { updatedAt: new Date().toISOString() });
  recordAgendaCampaignAudit(tenantId, "안건 초안 저장", "안건", agenda.id, "콘텐츠 담당자", `${agenda.version}판 내용을 저장했습니다.`);
  return getDemoAgendaRecord(tenantId);
}

export function createNextDemoAgendaVersion(tenantId: string) {
  const agenda = agendaCampaignStore.agenda;
  assertScope(tenantId, agenda.tenantId);
  if (agenda.state !== "PUBLISHED" && agenda.state !== "CLOSED") throw new Error("게시 또는 종료된 버전에서만 새 버전을 만들 수 있습니다.");
  agenda.version += 1;
  agenda.state = "DRAFT";
  agenda.reviewerFeedbackKo = null;
  agenda.publishedAt = null;
  agenda.updatedAt = new Date().toISOString();
  recordAgendaCampaignAudit(tenantId, "새 안건 버전 생성", "안건", agenda.id, "콘텐츠 담당자", `${agenda.version}판 초안을 만들었습니다.`);
  return getDemoAgendaRecord(tenantId);
}

export function transitionDemoAgenda(tenantId: string, action: "REQUEST_REVIEW" | "APPROVE" | "RETURN" | "PUBLISH", feedbackKo?: string) {
  const agenda = agendaCampaignStore.agenda;
  assertScope(tenantId, agenda.tenantId);
  const expected: Record<typeof action, AgendaWorkflowState> = { REQUEST_REVIEW: "DRAFT", APPROVE: "IN_REVIEW", RETURN: "IN_REVIEW", PUBLISH: "APPROVED" };
  if (agenda.state !== expected[action]) throw new Error("현재 상태에서는 요청한 처리를 진행할 수 없습니다.");
  if (action === "REQUEST_REVIEW" && !getApprovedAgendaCostImpact(tenantId)) throw new Error("주민 공개 비용 영향을 승인해 주세요.");
  if (action === "REQUEST_REVIEW") agenda.state = "IN_REVIEW";
  if (action === "APPROVE") { agenda.state = "APPROVED"; agenda.reviewerFeedbackKo = feedbackKo || null; }
  if (action === "RETURN") { agenda.state = "DRAFT"; agenda.reviewerFeedbackKo = feedbackKo || "내용을 보완해 주세요."; }
  if (action === "PUBLISH") {
    agenda.state = "PUBLISHED";
    agenda.publishedAt = new Date().toISOString();
    Object.assign(demoAgenda, {
      title: agenda.titleKo,
      summary: agenda.summaryKo,
      background: agenda.backgroundKo,
      changeScope: agenda.changeScopeKo,
      benefit: agenda.benefitKo,
      schedule: agenda.scheduleKo,
      cautions: agenda.cautionsKo,
      contact: agenda.contactKo,
      agendaVersion: `${agenda.version}.0`,
      consentVersion: `${agenda.version}.0`,
      contentVersion: `${agenda.version}.0`,
      consentText: agenda.consentTextKo,
    });
  }
  agenda.updatedAt = new Date().toISOString();
  const actionKo = { REQUEST_REVIEW: "안건 검토 요청", APPROVE: "안건 승인", RETURN: "안건 보완 요청", PUBLISH: "안건 게시" }[action];
  recordAgendaCampaignAudit(tenantId, actionKo, "안건", agenda.id, action === "REQUEST_REVIEW" ? "콘텐츠 담당자" : "승인 관리자", feedbackKo || `${agenda.version}판 처리 완료`);
  return getDemoAgendaRecord(tenantId);
}

export function getDemoCampaignRecord(tenantId: string, campaignId = "demo-campaign") {
  const campaign = agendaCampaignStore.campaign;
  assertScope(tenantId, campaign.tenantId);
  if (campaign.id !== campaignId) throw new Error("안건 현황을 찾을 수 없습니다.");
  return { ...campaign };
}

export function listDemoCampaigns(tenantId: string) {
  return [getDemoCampaignRecord(tenantId)];
}

export function saveDemoCampaign(tenantId: string, input: Omit<DemoCampaignRecord, "id" | "tenantId" | "agendaId" | "status" | "updatedAt" | "publishedAt">) {
  const campaign = agendaCampaignStore.campaign;
  assertScope(tenantId, campaign.tenantId);
  if (!["DRAFT", "SCHEDULED", "PAUSED"].includes(campaign.status)) throw new Error("진행 중인 안건은 먼저 일시중지한 뒤 설정을 변경해 주세요.");
  if (new Date(input.endsAt) <= new Date(input.startsAt)) throw new Error("종료 시각은 시작 시각보다 뒤여야 합니다.");
  Object.assign(campaign, input, { updatedAt: new Date().toISOString() });
  recordAgendaCampaignAudit(tenantId, "안건 현황 설정 저장", "안건 현황", campaign.id, "단지 관리자", "기간·본인확인·정족수 정책을 저장했습니다.");
  return getDemoCampaignRecord(tenantId);
}

export function transitionDemoCampaign(tenantId: string, to: CampaignState, reasonKo: string) {
  const campaign = agendaCampaignStore.campaign;
  assertScope(tenantId, campaign.tenantId);
  if (!canTransitionCampaign(campaign.status, to)) throw new Error("현재 상태에서는 선택한 상태로 변경할 수 없습니다.");
  if (to === "OPEN" && agendaCampaignStore.agenda.state !== "PUBLISHED") throw new Error("게시된 안건 버전이 있어야 진행을 시작할 수 있습니다.");
  campaign.status = to;
  campaign.updatedAt = new Date().toISOString();
  if (to === "OPEN" && !campaign.publishedAt) campaign.publishedAt = campaign.updatedAt;
  recordAgendaCampaignAudit(tenantId, `안건 현황 ${campaignStateKo(to)}`, "안건 현황", campaign.id, "단지 관리자", reasonKo);
  return getDemoCampaignRecord(tenantId);
}

export function recordAgendaCampaignAudit(tenantId: string, actionKo: string, objectTypeKo: AgendaCampaignAudit["objectTypeKo"], objectId: string, actorKo: string, detailKo: string) {
  const event: AgendaCampaignAudit = { id: randomUUID(), tenantId, actionKo, objectTypeKo, objectId, actorKo, detailKo, occurredAt: new Date().toISOString() };
  agendaCampaignStore.audits.push(event);
  return event;
}

export function listAgendaCampaignAudits(tenantId: string, objectId?: string) {
  return agendaCampaignStore.audits.filter((event) => event.tenantId === tenantId && (!objectId || event.objectId === objectId)).slice().reverse();
}

export function campaignStateKo(state: CampaignState) {
  return ({ DRAFT: "초안", SCHEDULED: "예약", OPEN: "진행 중", PAUSED: "일시중지", CLOSED: "마감", FINALIZED: "결과 확정", ARCHIVED: "보관" } as const)[state];
}

export function agendaStateKo(state: AgendaWorkflowState) {
  return ({ DRAFT: "초안", IN_REVIEW: "검토 중", APPROVED: "승인", PUBLISHED: "게시됨", CLOSED: "종료", ARCHIVED: "보관" } as const)[state];
}

export function resetAgendaCampaignDemoStore() {
  agendaCampaignStore.agenda = initialAgenda();
  agendaCampaignStore.campaign = initialCampaign();
  agendaCampaignStore.audits.splice(0);
}
