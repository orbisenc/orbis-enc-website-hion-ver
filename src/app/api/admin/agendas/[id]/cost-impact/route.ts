import { agendaCostImpactSchema } from "@/lib/validation/contracts";
import { assertSameOrigin } from "@/server/security/csrf";
import { checkRateLimit } from "@/server/security/rate-limit";
import { calculateAndSaveAgendaCostImpact } from "@/server/services/agenda-cost-impact-service";
import { readFeeAccessContext } from "@/server/services/management-fee-session";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await readFeeAccessContext();
  if (!context) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  const { id } = await params;
  if (id !== "demo-agenda") return Response.json({ error: "안건을 찾을 수 없습니다." }, { status: 404 });
  try { assertSameOrigin(request); } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "요청 출처를 확인할 수 없습니다." }, { status: 403 }); }
  if (!checkRateLimit(`agenda-cost:${context.tenantId}`, 20)) return Response.json({ error: "비용 영향 저장 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  const parsed = agendaCostImpactSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const impact = calculateAndSaveAgendaCostImpact(context, {
      ...parsed.data,
      estimatedProjectCost: BigInt(parsed.data.estimatedProjectCost),
      actualProjectCost: parsed.data.actualProjectCost ? BigInt(parsed.data.actualProjectCost) : null,
      additionalFeeTotal: BigInt(parsed.data.additionalFeeTotal),
    });
    return Response.json({ impact: { ...impact, estimatedProjectCost: impact.estimatedProjectCost.toString(), actualProjectCost: impact.actualProjectCost?.toString() ?? null, estimatedAmountPerUnit: impact.estimatedAmountPerUnit.toString() } });
  } catch (error) { return Response.json({ error: error instanceof Error ? error.message : "안건 비용 영향을 저장하지 못했습니다." }, { status: 409 }); }
}
