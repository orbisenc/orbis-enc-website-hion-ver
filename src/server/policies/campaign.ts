export type CampaignState = "DRAFT" | "SCHEDULED" | "OPEN" | "PAUSED" | "CLOSED" | "FINALIZED" | "ARCHIVED";

const transitions: Record<CampaignState, CampaignState[]> = {
  DRAFT: ["SCHEDULED", "OPEN", "ARCHIVED"],
  SCHEDULED: ["OPEN", "ARCHIVED"],
  OPEN: ["PAUSED", "CLOSED"],
  PAUSED: ["OPEN", "CLOSED"],
  CLOSED: ["FINALIZED"],
  FINALIZED: ["ARCHIVED"],
  ARCHIVED: [],
};

export function canTransitionCampaign(from: CampaignState, to: CampaignState): boolean {
  return transitions[from].includes(to);
}

export function assertTenantScope(sessionTenantId: string, resourceTenantId: string): void {
  if (!sessionTenantId || sessionTenantId !== resourceTenantId) {
    throw new Error("요청한 정보에 접근할 권한이 없습니다.");
  }
}

export function assertAgendaMutable(state: string): void {
  if (["PUBLISHED", "CLOSED", "ARCHIVED"].includes(state)) {
    throw new Error("게시된 안건 버전은 수정할 수 없습니다. 새 버전을 만들어 주세요.");
  }
}

export function deadlineStatus(now: Date, startsAt: Date, endsAt: Date): "BEFORE" | "OPEN" | "ENDED" {
  if (now < startsAt) return "BEFORE";
  if (now > endsAt) return "ENDED";
  return "OPEN";
}

export function calculateQuorum(totalRights: number, respondedRights: number, requiredRatio: number) {
  const ratio = totalRights === 0 ? 0 : respondedRights / totalRights;
  return { ratio, requiredRatio, met: ratio >= requiredRatio };
}

