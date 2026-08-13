import { randomUUID } from "node:crypto";
import { extname } from "node:path";
import { demoStore, type DemoAgendaAttachment } from "@/server/demo/store";
import { LocalStorageProvider } from "@/server/providers/local-storage";
import { recordAgendaCampaignAudit } from "@/server/demo/agenda-campaign-store";

const DEMO_TENANT_ID = "hion-demo";
const DEMO_AGENDA_ID = "demo-agenda";
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
]);
const storage = new LocalStorageProvider();

export type PublicAgendaAttachment = Omit<DemoAgendaAttachment, "tenantId" | "storageKey" | "sha256"> & { href: string };

function assertAgendaScope(tenantId: string, agendaId: string) {
  if (tenantId !== DEMO_TENANT_ID || agendaId !== DEMO_AGENDA_ID) throw new Error("요청한 안건에 접근할 권한이 없습니다.");
}

function publicMetadata(item: DemoAgendaAttachment): PublicAgendaAttachment {
  return {
    id: item.id,
    agendaId: item.agendaId,
    name: item.name,
    mimeType: item.mimeType,
    size: item.size,
    altTextKo: item.altTextKo,
    uploadedAt: item.uploadedAt,
    href: `/api/agenda-attachments/${encodeURIComponent(item.id)}`,
  };
}

function hasExpectedSignature(mimeType: string, data: Uint8Array) {
  const starts = (...bytes: number[]) => bytes.every((byte, index) => data[index] === byte);
  if (mimeType === "application/pdf") return starts(0x25, 0x50, 0x44, 0x46);
  if (mimeType === "image/jpeg") return starts(0xff, 0xd8, 0xff);
  if (mimeType === "image/png") return starts(0x89, 0x50, 0x4e, 0x47);
  if (mimeType === "image/webp") return starts(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...data.slice(8, 12)) === "WEBP";
  if (mimeType === "video/mp4") return String.fromCharCode(...data.slice(4, 8)) === "ftyp";
  return false;
}

export function listAgendaAttachments(tenantId: string, agendaId: string) {
  assertAgendaScope(tenantId, agendaId);
  return demoStore.agendaAttachments.filter((item) => item.tenantId === tenantId && item.agendaId === agendaId).map(publicMetadata);
}

export function listPublicAgendaAttachments(agendaId: string) {
  if (agendaId !== DEMO_AGENDA_ID) return [];
  return demoStore.agendaAttachments.filter((item) => item.agendaId === agendaId).map(publicMetadata);
}

export async function attachFileToAgenda(input: { tenantId: string; agendaId: string; name: string; mimeType: string; data: Uint8Array; altTextKo: string }) {
  assertAgendaScope(input.tenantId, input.agendaId);
  if (!allowedMimeTypes.has(input.mimeType)) throw new Error("PDF, JPG, PNG, WebP, MP4 파일만 첨부할 수 있습니다.");
  if (input.data.byteLength === 0 || input.data.byteLength > MAX_FILE_SIZE) throw new Error("첨부 파일은 20MB 이하여야 합니다.");
  if (!hasExpectedSignature(input.mimeType, input.data)) throw new Error("파일 내용과 형식이 일치하지 않습니다. 원본 파일을 다시 확인해 주세요.");
  const fileHash = (await import("@/lib/security/hash")).sha256(input.data);
  if (demoStore.agendaAttachments.some((item) => item.tenantId === input.tenantId && item.agendaId === input.agendaId && item.sha256 === fileHash)) throw new Error("같은 파일이 이미 이 안건에 첨부되어 있습니다.");

  const id = randomUUID();
  const extension = extname(input.name).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const storageKey = `agendas/${input.agendaId}/${id}${extension}`;
  const stored = await storage.put({ key: storageKey, data: input.data, mimeType: input.mimeType });
  const attachment: DemoAgendaAttachment = {
    id,
    tenantId: input.tenantId,
    agendaId: input.agendaId,
    name: input.name.slice(0, 180),
    mimeType: stored.mimeType,
    size: stored.size,
    sha256: stored.sha256,
    altTextKo: input.altTextKo,
    storageKey,
    uploadedAt: new Date().toISOString(),
  };
  demoStore.agendaAttachments.push(attachment);
  recordAgendaCampaignAudit(input.tenantId, "안건 자료 첨부", "안건", input.agendaId, "콘텐츠 담당자", `${attachment.name} 파일을 주민 공개 자료로 첨부했습니다.`);
  return publicMetadata(attachment);
}

export async function removeAgendaAttachment(tenantId: string, agendaId: string, attachmentId: string) {
  assertAgendaScope(tenantId, agendaId);
  const index = demoStore.agendaAttachments.findIndex((item) => item.id === attachmentId && item.tenantId === tenantId && item.agendaId === agendaId);
  if (index < 0) throw new Error("삭제할 첨부 자료를 찾을 수 없습니다.");
  const [attachment] = demoStore.agendaAttachments.splice(index, 1);
  await storage.delete(attachment!.storageKey);
  recordAgendaCampaignAudit(tenantId, "안건 자료 삭제", "안건", agendaId, "콘텐츠 담당자", `${attachment!.name} 파일을 공개 자료에서 삭제했습니다.`);
}

export async function readPublicAgendaAttachment(id: string) {
  const attachment = demoStore.agendaAttachments.find((item) => item.id === id && item.agendaId === DEMO_AGENDA_ID);
  if (!attachment) return null;
  return { attachment, data: await storage.get(attachment.storageKey) };
}
