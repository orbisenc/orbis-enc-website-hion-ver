import { readAdminSession } from "@/server/auth/session";
import { getDemoCampaignRecord, recordAgendaCampaignAudit } from "@/server/demo/agenda-campaign-store";
import { getDashboard } from "@/server/demo/store";

export async function GET(request: Request) {
  const session = await readAdminSession();
  if (!session) return new Response("로그인이 필요합니다.", { status: 401 });
  const url = new URL(request.url); const reasonKo = url.searchParams.get("reasonKo")?.trim() ?? ""; const campaignId = url.searchParams.get("campaignId") ?? "demo-campaign";
  if (reasonKo.length < 5) return Response.json({ error: "내보내기 사유를 5자 이상 입력해 주세요." }, { status: 400 });
  try { getDemoCampaignRecord(session.tenantId, campaignId); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건 현황을 찾을 수 없습니다." }, { status: 404 }); }
  const d = getDashboard();
  const csv = `항목,인원\r\n전체 대상,${d.total}\r\n응답,${d.responded}\r\n동의,${d.consent}\r\n반대,${d.oppose}\r\n기권,${d.abstain}\r\n미응답,${d.total - d.responded}\r\n`;
  recordAgendaCampaignAudit(session.tenantId, "CSV 보고서 내보내기", "안건 현황", campaignId, "단지 관리자", reasonKo);
  return new Response(`\uFEFF${csv}`, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": "attachment; filename*=UTF-8''HION-%EA%B2%B0%EA%B3%BC.csv", "cache-control": "no-store" } });
}
