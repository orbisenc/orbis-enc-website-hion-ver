import { NextResponse } from "next/server";
import { remoteBrowserActionSchema, remoteBrowserSessionIdSchema } from "@/lib/remote-browser/contracts";
import { executeBrowserAction } from "@/server/services/remote-browser-service";
import { assertSameOrigin } from "@/server/security/csrf";
import { remoteBrowserApiError } from "../../../_shared";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const sessionId = remoteBrowserSessionIdSchema.safeParse((await context.params).sessionId);
    const action = remoteBrowserActionSchema.safeParse(await request.json().catch(() => null));
    if (!sessionId.success || !action.success) {
      return NextResponse.json({ error: sessionId.error?.issues[0]?.message ?? action.error?.issues[0]?.message ?? "브라우저 입력을 확인해 주세요." }, { status: 400 });
    }
    return NextResponse.json(await executeBrowserAction(sessionId.data, action.data), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return remoteBrowserApiError(error);
  }
}
