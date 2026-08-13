import { koreanFeeCsvTemplate } from "@/server/services/management-fee-import";
import { assertFeeAccess } from "@/server/services/management-fee-auth";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export async function GET(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return new Response("로그인이 필요합니다.", { status: 401 });
  try { assertFeeAccess(context, context.tenantId, "IMPORT"); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "권한이 없습니다." }, { status: 403 }); }
  const type = new URL(request.url).searchParams.get("type") === "COLLECTION" ? "COLLECTION" : "ASSESSMENT";
  const csv = koreanFeeCsvTemplate(type);
  const name = type === "ASSESSMENT" ? "관리비-부과-등록-양식.csv" : "관리비-수납-환급-등록-양식.csv";
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`, "x-content-type-options": "nosniff" } });
}
