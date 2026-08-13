import { feeImportConfirmSchema } from "@/lib/validation/contracts";
import { assertSameOrigin } from "@/server/security/csrf";
import { checkRateLimit } from "@/server/security/rate-limit";
import { confirmImportBatch } from "@/server/services/management-fee-lifecycle";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export async function POST(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  if (!checkRateLimit(`fee-import-confirm:${context.tenantId}`, 20)) return Response.json({ error: "등록 확정 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  const parsed = feeImportConfirmSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const batch = confirmImportBatch(context, parsed.data.batchId, parsed.data.idempotencyKey, parsed.data.warningReasonKo);
    return Response.json({ batch: { id: batch.id, status: batch.status, confirmedBy: batch.confirmedBy, confirmedAt: batch.confirmedAt } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "관리비 등록을 확정하지 못했습니다." }, { status: 409 }); }
}
