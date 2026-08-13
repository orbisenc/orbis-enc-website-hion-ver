import { beforeEach, describe, expect, it } from "vitest";

import {
  createNextDemoAgendaVersion,
  getDemoAgendaRecord,
  getDemoCampaignRecord,
  resetAgendaCampaignDemoStore,
  saveDemoAgenda,
  saveDemoCampaign,
  transitionDemoAgenda,
  transitionDemoCampaign,
} from "@/server/demo/agenda-campaign-store";
import { demoAgenda, demoStore, resetDemoStore } from "@/server/demo/store";
import { resetFeeDemoStore } from "@/server/demo/fee-store";

const tenantId = "hion-demo";

beforeEach(() => {
  resetDemoStore();
  resetAgendaCampaignDemoStore();
  resetFeeDemoStore();
});

describe("안건 제작 수명주기", () => {
  it("게시본에서 새 버전을 만들고 검토·승인·게시한다", () => {
    const draft = createNextDemoAgendaVersion(tenantId);
    expect(draft.state).toBe("DRAFT");
    saveDemoAgenda(tenantId, {
      titleKo: "새로운 주차 환경 개선 안건",
      categoryKo: draft.categoryKo,
      summaryKo: draft.summaryKo,
      backgroundKo: draft.backgroundKo,
      changeScopeKo: draft.changeScopeKo,
      benefitKo: draft.benefitKo,
      scheduleKo: draft.scheduleKo,
      cautionsKo: draft.cautionsKo,
      contactKo: draft.contactKo,
      consentTextKo: draft.consentTextKo,
      options: draft.options,
    });
    demoStore.agendaAttachments.push({ id: "첨부-1", tenantId, agendaId: draft.id, name: "배치도.pdf", mimeType: "application/pdf", size: 10, sha256: "hash", altTextKo: "변경 배치도", storageKey: "test", uploadedAt: new Date().toISOString() });
    expect(transitionDemoAgenda(tenantId, "REQUEST_REVIEW").state).toBe("IN_REVIEW");
    expect(transitionDemoAgenda(tenantId, "APPROVE").state).toBe("APPROVED");
    expect(transitionDemoAgenda(tenantId, "PUBLISH").state).toBe("PUBLISHED");
    expect(demoAgenda.title).toBe("새로운 주차 환경 개선 안건");
    expect(demoAgenda.agendaVersion).toBe("2.0");
  });

  it("첨부 자료가 없어도 선택 자료 확인 후 검토할 수 있다", () => {
    createNextDemoAgendaVersion(tenantId);
    expect(transitionDemoAgenda(tenantId, "REQUEST_REVIEW").state).toBe("IN_REVIEW");
  });

  it("다른 단지의 안건 접근을 막는다", () => {
    expect(() => getDemoAgendaRecord("other-tenant")).toThrow("다른 단지");
  });
});

describe("안건 현황 관리 수명주기", () => {
  it("공개 시연 안건은 장기 응답 가능 기간으로 초기화한다", () => {
    const campaign = getDemoCampaignRecord(tenantId);
    const now = new Date("2026-07-16T00:00:00.000Z");

    expect(campaign.status).toBe("OPEN");
    expect(now > new Date(campaign.startsAt)).toBe(true);
    expect(now < new Date(campaign.endsAt)).toBe(true);
    expect(new Date(campaign.endsAt).getUTCFullYear()).toBe(2099);
  });

  it("진행 중 설정 변경을 막고 일시중지 후 허용한다", () => {
    const open = getDemoCampaignRecord(tenantId);
    expect(() => saveDemoCampaign(tenantId, { ...open, nameKo: "변경 이름" })).toThrow("일시중지");
    const paused = transitionDemoCampaign(tenantId, "PAUSED", "기간 정책 점검 필요");
    const saved = saveDemoCampaign(tenantId, {
      nameKo: "변경된 주차 환경 개선",
      rosterVersionKo: paused.rosterVersionKo,
      startsAt: paused.startsAt,
      endsAt: paused.endsAt,
      mode: paused.mode,
      verificationLevel: paused.verificationLevel,
      anonymous: paused.anonymous,
      allowResponseChange: paused.allowResponseChange,
      allowWithdrawal: paused.allowWithdrawal,
      quorumPercentage: 55,
      approvalPercentage: 60,
      resultDisclosure: paused.resultDisclosure,
    });
    expect(saved.quorumPercentage).toBe(55);
    expect(transitionDemoCampaign(tenantId, "OPEN", "설정 확인 후 진행 재개").status).toBe("OPEN");
  });

  it("마감 뒤 결과 확정과 보관 순서를 강제한다", () => {
    expect(() => transitionDemoCampaign(tenantId, "FINALIZED", "결과를 바로 확정합니다")).toThrow("현재 상태");
    expect(transitionDemoCampaign(tenantId, "CLOSED", "응답 기간 종료로 마감").status).toBe("CLOSED");
    expect(transitionDemoCampaign(tenantId, "FINALIZED", "정족수와 결과 검토 완료").status).toBe("FINALIZED");
    expect(transitionDemoCampaign(tenantId, "ARCHIVED", "증거 묶음 생성 후 보관").status).toBe("ARCHIVED");
  });
});
