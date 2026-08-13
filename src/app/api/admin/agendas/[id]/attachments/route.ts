import { NextResponse } from "next/server";
import { agendaAttachmentFieldsSchema } from "@/lib/validation/contracts";
import { readAdminSession } from "@/server/auth/session";
import { attachFileToAgenda, listAgendaAttachments, removeAgendaAttachment } from "@/server/services/agenda-attachment-service";
import { assertSameOrigin } from "@/server/security/csrf";

function canEdit(roles: string[]) { return roles.includes("CONTENT_EDITOR") || roles.includes("COMPLEX_ADMIN"); }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { id } = await params;
  try {
    return NextResponse.json({ attachments: listAgendaAttachments(session.tenantId, id) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "첨부 자료를 불러오지 못했습니다." }, { status: 403 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!canEdit(session.roles)) return NextResponse.json({ error: "첨부 자료를 관리할 권한이 없습니다." }, { status: 403 });
  try { assertSameOrigin(request); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  const { id } = await params;
  const body = await request.json().catch(() => null) as { attachmentId?: string } | null;
  if (!body?.attachmentId) return NextResponse.json({ error: "삭제할 첨부 자료를 선택해 주세요." }, { status: 400 });
  try { await removeAgendaAttachment(session.tenantId, id, body.attachmentId); return NextResponse.json({ ok: true }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "첨부 자료를 삭제하지 못했습니다." }, { status: 400 }); }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!canEdit(session.roles)) return NextResponse.json({ error: "첨부 자료를 관리할 권한이 없습니다." }, { status: 403 });
  try { assertSameOrigin(request); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  const { id } = await params;
  const form = await request.formData();
  const parsed = agendaAttachmentFieldsSchema.safeParse({ altTextKo: form.get("altTextKo") });
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "첨부할 파일을 선택해 주세요." }, { status: 400 });
  try {
    const attachment = await attachFileToAgenda({
      tenantId: session.tenantId,
      agendaId: id,
      name: file.name,
      mimeType: file.type,
      data: new Uint8Array(await file.arrayBuffer()),
      altTextKo: parsed.data.altTextKo,
    });
    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "첨부 자료를 저장하지 못했습니다." }, { status: 400 });
  }
}
