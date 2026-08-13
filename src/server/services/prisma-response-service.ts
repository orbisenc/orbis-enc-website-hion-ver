import { randomUUID } from "node:crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { sha256 } from "@/lib/security/hash";
import type { ResponseInput } from "@/lib/validation/contracts";

export class PrismaResponseService {
  constructor(private readonly prisma: PrismaClient) {}

  async submit(tenantId: string, campaignId: string, targetId: string, input: ResponseInput) {
    return this.prisma.$transaction(async (tx) => {
      const repeated = await tx.response.findUnique({ where: { campaignId_idempotencyKey: { campaignId, idempotencyKey: input.idempotencyKey } }, include: { evidence: true } });
      if (repeated) return repeated;
      const target = await tx.campaignTarget.findFirst({
        where: { id: targetId, tenantId, campaignId },
        include: { campaign: { include: { agendaVersion: true, rosterVersion: true } }, currentResponse: true },
      });
      if (!target) throw new Error("요청한 정보에 접근할 권한이 없습니다.");
      const now = new Date();
      if (target.campaign.status !== "OPEN" || now < target.campaign.startsAt || now > target.campaign.endsAt) throw new Error("응답할 수 있는 기간이 아닙니다.");
      const verification = await tx.verification.findFirst({ where: { id: input.verificationId, tenantId, targetId, state: "SUCCEEDED" } });
      if (!verification) throw new Error("본인 확인이 만료되었습니다. 다시 확인해 주세요.");
      if (target.currentResponse && !target.campaign.allowResponseChange) return target.currentResponse;
      if (target.currentResponse) await tx.response.update({ where: { id: target.currentResponse.id }, data: { state: "SUPERSEDED" } });
      const agenda = target.campaign.agendaVersion;
      const agendaHash = sha256({ id: agenda.id, version: agenda.version, summary: agenda.summaryKo, options: agenda.options });
      const consentTextHash = sha256(agenda.consentTextKo);
      const contentManifestHash = sha256(agenda.contentManifest);
      const receiptNumber = `HION-${now.toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8).toUpperCase()}`;
      const response = await tx.response.create({ data: { tenantId, campaignId, targetId, selectedOption: input.option, commentKo: input.comment, submittedAt: now, previousId: target.currentResponse?.id, idempotencyKey: input.idempotencyKey, receiptNumber } });
      const sealHash = sha256({ responseId: response.id, verificationId: verification.id, agendaHash, consentTextHash, contentManifestHash, serverTimestamp: now.toISOString() });
      await tx.consentEvidence.create({ data: { tenantId, responseId: response.id, verificationId: verification.id, agendaHash, consentTextHash, contentManifestHash, serverTimestamp: now, sealHash } });
      await tx.campaignTarget.update({ where: { id: targetId }, data: { currentResponseId: response.id, status: "RESPONDED" } });
      await tx.analyticsEvent.create({ data: { tenantId, campaignId, eventName: "response_submitted", metadata: { target: sha256(targetId) } } });
      return tx.response.findUniqueOrThrow({ where: { id: response.id }, include: { evidence: true } });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  }
}

