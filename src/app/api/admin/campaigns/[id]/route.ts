import { campaignActionSchema, campaignSettingsSchema } from "@/lib/validation/contracts";
import { readAdminSession } from "@/server/auth/session";
import { getDemoCampaignRecord, saveDemoCampaign, transitionDemoCampaign } from "@/server/demo/agenda-campaign-store";
import { assertSameOrigin } from "@/server/security/csrf";

function canManage(roles: string[]) { return roles.includes("COMPLEX_ADMIN") || roles.includes("APPROVER"); }

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { return Response.json({ campaign: getDemoCampaignRecord(session.tenantId, (await params).id) }); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건 현황을 불러오지 못했습니다." }, { status: 404 }); }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!canManage(session.roles)) return Response.json({ error: "안건 현황을 관리할 권한이 없습니다." }, { status: 403 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  const { id } = await params;
  try { getDemoCampaignRecord(session.tenantId, id); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건 현황을 찾을 수 없습니다." }, { status: 404 }); }
  const body = await request.json().catch(() => null);
  if (body?.to) {
    const parsed = campaignActionSchema.safeParse(body);
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    try {
      const campaign = transitionDemoCampaign(session.tenantId, parsed.data.to, parsed.data.reasonKo);
      return Response.json({ campaign });
    } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "상태를 변경하지 못했습니다." }, { status: 409 }); }
  }
  const parsed = campaignSettingsSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const campaign = saveDemoCampaign(session.tenantId, parsed.data);
    return Response.json({ campaign });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "설정을 저장하지 못했습니다." }, { status: 409 }); }
}
