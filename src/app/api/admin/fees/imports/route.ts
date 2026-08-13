import { feeImportMetadataSchema } from "@/lib/validation/contracts";
import { assertSameOrigin } from "@/server/security/csrf";
import { checkRateLimit } from "@/server/security/rate-limit";
import { previewFeeImport } from "@/server/services/management-fee-import";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export async function POST(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  if (!checkRateLimit(`fee-import:${context.tenantId}`, 12)) return Response.json({ error: "관리비 파일 등록 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  const form = await request.formData();
  const parsed = feeImportMetadataSchema.safeParse({ periodId: form.get("periodId"), referenceMonth: form.get("referenceMonth"), type: form.get("type") });
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "등록할 CSV 파일을 선택해 주세요." }, { status: 400 });
  let columnMapping: Record<string, string> | undefined;
  try { const raw=form.get("columnMapping"); if(typeof raw==="string"&&raw) { const value=JSON.parse(raw) as unknown; if(!value||typeof value!=="object"||Array.isArray(value)||Object.values(value).some((item)=>typeof item!=="string")) throw new Error(); columnMapping=value as Record<string,string>; } } catch { return Response.json({error:"CSV 열 연결 정보를 확인해 주세요."},{status:400}); }
  try {
    const batch = await previewFeeImport(context, { ...parsed.data, filename: file.name, mimeType: file.type, data: new Uint8Array(await file.arrayBuffer()), columnMapping });
    return Response.json({ batch: { ...batch, sourceTotal: batch.sourceTotal.toString(), calculatedTotal: batch.calculatedTotal.toString(), records: batch.records.slice(0, 20) } }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "관리비 CSV를 검증하지 못했습니다." }, { status: 400 });
  }
}
