import { feeAdjustmentApprovalSchema, feeAdjustmentSchema } from "@/lib/validation/contracts";
import { assertSameOrigin } from "@/server/security/csrf";
import { checkRateLimit } from "@/server/security/rate-limit";
import { approveAdjustment, createFeeAdjustment } from "@/server/services/management-fee-lifecycle";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export async function POST(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  if (!checkRateLimit(`fee-adjustment:${context.tenantId}`, 30)) return Response.json({ error: "조정 등록 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  const parsed = feeAdjustmentSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const adjustment = createFeeAdjustment(context, { ...parsed.data, amount: BigInt(parsed.data.amount) });
    return Response.json({ adjustment: { ...adjustment, amount: adjustment.amount.toString() } }, { status: 201 });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "관리비 조정을 등록하지 못했습니다." }, { status: 409 }); }
}

export async function PATCH(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  const parsed = feeAdjustmentApprovalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const adjustment = approveAdjustment(context, parsed.data.adjustmentId);
    return Response.json({ adjustment: { ...adjustment, amount: adjustment.amount.toString() } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "관리비 조정을 승인하지 못했습니다." }, { status: 409 }); }
}
