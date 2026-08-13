import { readAdminSession } from "@/server/auth/session";
import { getDemoAgendaRecord, recordAgendaCampaignAudit } from "@/server/demo/agenda-campaign-store";
import { assertSameOrigin } from "@/server/security/csrf";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!session.roles.includes("CONTENT_EDITOR") && !session.roles.includes("COMPLEX_ADMIN")) return Response.json({ error: "장면을 저장할 권한이 없습니다." }, { status: 403 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  const { id } = await params;
  try {
    const agenda = getDemoAgendaRecord(session.tenantId, id);
    recordAgendaCampaignAudit(session.tenantId, "3D 장면 버전 저장", "안건", id, "콘텐츠 담당자", `${agenda.version}판의 장면·핫스폿·대체 이미지 구성을 저장했습니다.`);
    return Response.json({ message: `${agenda.version}판 장면 구성을 저장했습니다.` });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "장면 버전을 저장하지 못했습니다." }, { status: 404 }); }
}
