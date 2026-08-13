import { randomUUID } from "node:crypto";
import { deadlineStatus } from "@/server/policies/campaign";

export interface LedgerSubmission { tenantId: string; targetId: string; option: string; idempotencyKey: string; now: Date }
export interface LedgerCampaign { tenantId: string; startsAt: Date; endsAt: Date; allowResponseChange: boolean }
export interface LedgerResponse { id: string; targetId: string; option: string; idempotencyKey: string; state: "ACTIVE" | "SUPERSEDED"; previousId?: string }

export class ResponseLedger {
  readonly responses: LedgerResponse[] = [];
  private lock = Promise.resolve();
  constructor(private readonly campaign: LedgerCampaign) {}
  submit(input: LedgerSubmission): Promise<LedgerResponse> {
    const task = this.lock.then(() => this.submitLocked(input));
    this.lock = task.then(() => undefined, () => undefined);
    return task;
  }
  private submitLocked(input: LedgerSubmission) {
    if (input.tenantId !== this.campaign.tenantId) throw new Error("요청한 정보에 접근할 권한이 없습니다.");
    const sameKey = this.responses.find((item) => item.idempotencyKey === input.idempotencyKey);
    if (sameKey) return sameKey;
    if (deadlineStatus(input.now, this.campaign.startsAt, this.campaign.endsAt) !== "OPEN") throw new Error("응답할 수 있는 기간이 아닙니다.");
    const active = this.responses.find((item) => item.targetId === input.targetId && item.state === "ACTIVE");
    if (active && !this.campaign.allowResponseChange) return active;
    if (active) active.state = "SUPERSEDED";
    const response: LedgerResponse = { id: randomUUID(), targetId: input.targetId, option: input.option, idempotencyKey: input.idempotencyKey, state: "ACTIVE", previousId: active?.id };
    this.responses.push(response); return response;
  }
}

