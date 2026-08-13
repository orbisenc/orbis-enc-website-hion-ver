import { readAdminSession } from "@/server/auth/session";
import { getDemoCampaignRecord, recordAgendaCampaignAudit } from "@/server/demo/agenda-campaign-store";
import { demoAgenda, demoStore } from "@/server/demo/store";

export async function GET(request: Request) {
  const session = await readAdminSession();
  if (!session) return Response.json({ 오류: "로그인이 필요합니다." }, { status: 401 });
  const url = new URL(request.url); const reasonKo = url.searchParams.get("reasonKo")?.trim() ?? ""; const campaignId = url.searchParams.get("campaignId") ?? "demo-campaign";
  if (reasonKo.length < 5) return Response.json({ 오류: "내보내기 사유를 5자 이상 입력해 주세요." }, { status: 400 });
  try { getDemoCampaignRecord(session.tenantId, campaignId); } catch (error) { return Response.json({ 오류: error instanceof Error ? error.message : "안건 현황을 찾을 수 없습니다." }, { status: 404 }); }
  recordAgendaCampaignAudit(session.tenantId, "증거 명세 내보내기", "안건 현황", campaignId, "단지 관리자", reasonKo);
  return Response.json({ 생성시각: new Date().toISOString(), 내보내기사유: reasonKo, 안건: { 제목: demoAgenda.title, 버전: demoAgenda.agendaVersion }, 응답: demoStore.responses.map((response) => ({ 영수증: response.receiptNumber, 제출시각: response.submittedAt, 상태: response.state, 이전응답: response.previousId ?? null, 증거해시: response.hashes })), 안내: "개발 증거 명세이며 운영 전 법률 검토와 공인 공급자 연동이 필요합니다." }, { headers: { "cache-control": "no-store", "content-disposition": "attachment; filename*=UTF-8''HION-%EC%A6%9D%EA%B1%B0.json" } });
}
