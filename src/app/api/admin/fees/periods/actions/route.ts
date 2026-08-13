import { feePeriodActionSchema } from "@/lib/validation/contracts";
import { assertSameOrigin } from "@/server/security/csrf";
import { checkRateLimit } from "@/server/security/rate-limit";
import { closeFeePeriod, confirmFeePeriod, periodForClient, reopenFeePeriod } from "@/server/services/management-fee-lifecycle";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export async function POST(request: Request) {
  const context = await readFeeAccessContext();
  if (!context) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  if (!checkRateLimit(`fee-period-action:${context.tenantId}`, 20)) return Response.json({ error: "기준월 처리 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  const parsed = feePeriodActionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const period = parsed.data.action === "CONFIRM" ? confirmFeePeriod(context, parsed.data.periodId) : parsed.data.action === "CLOSE" ? closeFeePeriod(context, parsed.data.periodId, parsed.data.reasonKo ?? "") : reopenFeePeriod(context, parsed.data.periodId, parsed.data.reasonKo ?? "");
    return Response.json({ period: periodForClient(period) });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "관리비 기준월 상태를 변경하지 못했습니다." }, { status: 409 }); }
}
