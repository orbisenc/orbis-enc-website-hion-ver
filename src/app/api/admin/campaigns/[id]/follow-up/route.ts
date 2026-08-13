import { campaignFollowUpSchema } from "@/lib/validation/contracts";
import { readAdminSession } from "@/server/auth/session";
import { getDemoCampaignRecord, recordAgendaCampaignAudit } from "@/server/demo/agenda-campaign-store";
import { demoStore, getDashboard, recordEvent } from "@/server/demo/store";
import { assertSameOrigin } from "@/server/security/csrf";

const segmentKo = { UNRESPONDED: "미응답", DELIVERY_FAILED: "발송 실패", OPENED_NOT_VERIFIED: "열람 후 미인증" } as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await readAdminSession();
  if (!session) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  if (!session.roles.includes("COMPLEX_ADMIN")) return Response.json({ error: "재안내를 발송할 권한이 없습니다." }, { status: 403 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  const { id } = await params;
  const parsed = campaignFollowUpSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const campaign = getDemoCampaignRecord(session.tenantId, id);
    if (campaign.status !== "OPEN") return Response.json({ error: "진행 중인 안건에만 재안내를 보낼 수 있습니다." }, { status: 409 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건 현황을 찾을 수 없습니다." }, { status: 404 }); }
  const recent = demoStore.notifications.at(-1);
  if (recent && Date.now() - new Date(recent.sentAt).getTime() < 60_000) return Response.json({ error: "중복 발송을 막기 위해 1분 뒤 다시 시도해 주세요." }, { status: 429 });
  const dashboard = getDashboard();
  const counts = { UNRESPONDED: dashboard.total - dashboard.responded, DELIVERY_FAILED: dashboard.failed, OPENED_NOT_VERIFIED: Math.max(dashboard.opened - dashboard.verified, 0) };
  const targetCount = parsed.data.segments.reduce((sum, segment) => sum + counts[segment], 0);
  const segmentsKo = parsed.data.segments.map((segment) => segmentKo[segment]).join(", ");
  demoStore.notifications.push({ id: crypto.randomUUID(), contentKo: parsed.data.contentKo, state: "개발 전달 완료", sentAt: new Date().toISOString(), segmentKo: segmentsKo, targetCount, channelKo: parsed.data.channel === "SMS" ? "문자" : "이메일" });
  recordEvent("notification_sent", { campaignId: id, targetCount: String(targetCount) });
  recordEvent("notification_delivered", { campaignId: id });
  recordAgendaCampaignAudit(session.tenantId, "대상별 재안내", "재안내", id, "단지 관리자", `${segmentsKo} ${targetCount.toLocaleString("ko-KR")}명에게 개발 알림을 저장했습니다.`);
  return Response.json({ message: `${segmentsKo} ${targetCount.toLocaleString("ko-KR")}명에게 한국어 재안내를 저장했습니다.`, notification: demoStore.notifications.at(-1) });
}
