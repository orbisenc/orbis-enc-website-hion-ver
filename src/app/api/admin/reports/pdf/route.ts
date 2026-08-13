import { readFile } from "node:fs/promises";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { readAdminSession } from "@/server/auth/session";
import { getDashboard } from "@/server/demo/store";
import { getDemoCampaignRecord, recordAgendaCampaignAudit } from "@/server/demo/agenda-campaign-store";

async function koreanFont() {
  const candidates = [process.env.KOREAN_PDF_FONT_PATH, "C:\\Windows\\Fonts\\malgun.ttf", "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"].filter(Boolean) as string[];
  for (const path of candidates) { try { return await readFile(path); } catch {} }
  return null;
}

export async function GET(request: Request) {
  const session = await readAdminSession();
  if (!session) return new Response("로그인이 필요합니다.", { status: 401 });
  const url = new URL(request.url); const reasonKo = url.searchParams.get("reasonKo")?.trim() ?? ""; const campaignId = url.searchParams.get("campaignId") ?? "demo-campaign";
  if (reasonKo.length < 5) return Response.json({ error: "내보내기 사유를 5자 이상 입력해 주세요." }, { status: 400 });
  try { getDemoCampaignRecord(session.tenantId, campaignId); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건 현황을 찾을 수 없습니다." }, { status: 404 }); }
  const fontBytes = await koreanFont();
  if (!fontBytes) return Response.json({ error: "한국어 PDF 글꼴이 없습니다. KOREAN_PDF_FONT_PATH를 설정해 주세요." }, { status: 503 });
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  pdf.setTitle("HION 안건 결과 요약"); pdf.setSubject("해오름 아파트 주민 응답 결과");
  const font = await pdf.embedFont(fontBytes, { subset: true }); const page = pdf.addPage([595, 842]); const data = getDashboard();
  page.drawText("HION 안건 결과 요약", { x: 52, y: 780, size: 20, font, color: rgb(.04, .16, .33) });
  page.drawText(`전체 대상 ${data.total.toLocaleString("ko-KR")}명`, { x: 52, y: 735, size: 12, font });
  page.drawText(`응답 ${data.responded.toLocaleString("ko-KR")}명 · 동의 ${data.consent.toLocaleString("ko-KR")}명 · 반대 ${data.oppose.toLocaleString("ko-KR")}명 · 기권 ${data.abstain.toLocaleString("ko-KR")}명`, { x: 52, y: 705, size: 11, font });
  page.drawText("이 문서는 개발 시연용 요약입니다. 운영 전 법률 검토와 승인된 공급자 연동이 필요합니다.", { x: 52, y: 665, size: 9, font });
  const bytes = await pdf.save();
  recordAgendaCampaignAudit(session.tenantId, "PDF 보고서 내보내기", "안건 현황", campaignId, "단지 관리자", reasonKo);
  return new Response(Buffer.from(bytes), { headers: { "content-type": "application/pdf", "content-disposition": "attachment; filename*=UTF-8''HION-%EA%B2%B0%EA%B3%BC-%EC%9A%94%EC%95%BD.pdf", "cache-control": "no-store" } });
}
