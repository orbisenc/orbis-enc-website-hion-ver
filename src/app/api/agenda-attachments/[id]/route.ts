import { readPublicAgendaAttachment } from "@/server/services/agenda-attachment-service";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await readPublicAgendaAttachment(id);
  if (!result) return new Response("첨부 자료를 찾을 수 없습니다.", { status: 404 });
  return new Response(Buffer.from(result.data), {
    headers: {
      "content-type": result.attachment.mimeType,
      "content-length": String(result.attachment.size),
      "content-disposition": `inline; filename*=UTF-8''${encodeURIComponent(result.attachment.name)}`,
      "x-content-type-options": "nosniff",
      "cache-control": "private, no-store",
    },
  });
}
