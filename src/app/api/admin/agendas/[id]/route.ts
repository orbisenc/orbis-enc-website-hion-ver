import { agendaActionSchema, agendaDraftSchema } from "@/lib/validation/contracts";
import { readAdminSession } from "@/server/auth/session";
import { createNextDemoAgendaVersion, getDemoAgendaRecord, saveDemoAgenda, transitionDemoAgenda } from "@/server/demo/agenda-campaign-store";
import { assertSameOrigin } from "@/server/security/csrf";

function canEdit(roles: string[]) { return roles.includes("CONTENT_EDITOR") || roles.includes("COMPLEX_ADMIN"); }
function canApprove(roles: string[]) { return roles.includes("APPROVER") || roles.includes("COMPLEX_ADMIN"); }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { return Response.json({ agenda: getDemoAgendaRecord(session.tenantId, (await params).id) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건을 불러오지 못했습니다." }, { status: 404 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  const { id } = await params;
  try { getDemoAgendaRecord(session.tenantId, id); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건을 찾을 수 없습니다." }, { status: 404 }); }
  const body = await request.json().catch(() => null);
  if (body?.action) {
    const parsed = agendaActionSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const approvalAction = ["APPROVE", "RETURN", "PUBLISH"].includes(parsed.data.action);
    if (approvalAction ? !canApprove(session.roles) : !canEdit(session.roles)) return Response.json({ error: "이 작업을 수행할 권한이 없습니다." }, { status: 403 });
    try {
      const agenda = parsed.data.action === "NEW_VERSION"
        ? createNextDemoAgendaVersion(session.tenantId)
        : transitionDemoAgenda(session.tenantId, parsed.data.action, parsed.data.feedbackKo);
      return Response.json({ agenda });
    } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건 상태를 변경하지 못했습니다." }, { status: 409 }); }
  }
  if (!canEdit(session.roles)) return Response.json({ error: "안건 내용을 수정할 권한이 없습니다." }, { status: 403 });
  const parsed = agendaDraftSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const agenda = saveDemoAgenda(session.tenantId, parsed.data);
    return Response.json({ agenda });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건을 저장하지 못했습니다." }, { status: 409 }); }
}
