import { readFile } from "node:fs/promises";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { formatPercentFromBasisPoints, formatReferenceMonth, formatSeoulDateTime, formatWon } from "@/lib/format/ko";
import { feePeriodStateKo } from "@/lib/fees/presentation";
import { FEE_DEMO_COMPLEX_NAME, FEE_REFERENCE_MONTH, getApprovedAgendaCostImpact, getFeeDashboard, recordFeeAudit } from "@/server/demo/fee-store";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

async function koreanFont() {
  const candidates = [process.env.KOREAN_PDF_FONT_PATH, "C:\\Windows\\Fonts\\malgun.ttf", "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"].filter(Boolean) as string[];
  for (const path of candidates) { try { return await readFile(path); } catch {} }
  return null;
}

export async function GET(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return new Response("로그인이 필요합니다.", { status: 401 });
  try { assertFeeAccess(context, context.tenantId, "REPORT"); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "권한이 없습니다." }, { status: 403 }); }
  const fontBytes = await koreanFont();
  if (!fontBytes) return Response.json({ error: "한국어 PDF 글꼴이 없습니다. KOREAN_PDF_FONT_PATH를 설정해 주세요." }, { status: 503 });
  const url = new URL(request.url);
  const referenceMonth = url.searchParams.get("referenceMonth") ?? FEE_REFERENCE_MONTH;
  const dashboard = getFeeDashboard(context.tenantId, referenceMonth);
  const pdf = await PDFDocument.create(); pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, { subset: true });
  const page = pdf.addPage([595, 842]);
  page.drawText("HION 관리비 월간 보고서", { x: 48, y: 790, size: 20, font, color: rgb(.04, .16, .33) });
  const lines = [
    `${FEE_DEMO_COMPLEX_NAME} · ${formatReferenceMonth(referenceMonth)}`,
    `데이터 상태: ${feePeriodStateKo(dashboard.period.state)} · 생성 시각: ${formatSeoulDateTime(new Date())}`,
    `총 부과액 ${formatWon(dashboard.period.finalAssessment)}`,
    `총 수납액 ${formatWon(dashboard.period.netCollected)}`,
    `총 미납액 ${formatWon(dashboard.period.outstanding)} · 수납률 ${formatPercentFromBasisPoints(dashboard.period.collectionRateBasisPoints)}`,
    `3개월 이상 장기 미납액 ${formatWon(dashboard.longTermOverdue)}`,
    dashboard.period.state === "CLOSED" ? `마감 스냅샷: ${dashboard.period.closingSnapshotHash ?? "확인 필요"}` : "이 보고서는 확정 전 변경될 수 있는 잠정 자료입니다.",
  ];
  lines.forEach((line, index) => page.drawText(line, { x: 48, y: 745 - index * 32, size: index < 2 ? 11 : 12, font }));
  page.drawText("항목별 구성", { x: 48, y: 500, size: 14, font, color: rgb(.04, .16, .33) });
  dashboard.categories.slice(0, 8).forEach((item, index) => page.drawText(`${item.nameKo}  ${formatWon(item.amount)}`, { x: 58, y: 470 - index * 24, size: 10, font }));
  const impact=getApprovedAgendaCostImpact(context.tenantId); if(impact) page.drawText(`안건 비용 영향: 총사업비 ${formatWon(impact.estimatedProjectCost)} · 세대당 예상 ${formatWon(impact.estimatedAmountPerUnit)}`,{x:48,y:260,size:9,font});
  page.drawText("개인 이름과 연락처는 포함하지 않았습니다. 세대별 자료는 권한과 내보내기 정책에 따라 마스킹됩니다.", { x: 48, y: 240, size: 8, font });
  const bytes = await pdf.save();
  recordFeeAudit({ tenantId: context.tenantId, actionKo: "관리비 PDF 보고서 생성", objectTypeKo: "관리비 보고서", objectId: referenceMonth, actorKo: "회계 담당자", reasonKo: url.searchParams.get("reason") ?? null, metadata: { 기준월: referenceMonth, 페이지수: 1 } });
  return new Response(Buffer.from(bytes), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(`HION-${referenceMonth}-관리비-보고서.pdf`)}` } });
}
