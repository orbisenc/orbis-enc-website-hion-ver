import { NextResponse } from "next/server";
import { remoteBrowserSessionIdSchema } from "@/lib/remote-browser/contracts";
import { destroyBrowserSession, readBrowserSession } from "@/server/services/remote-browser-service";
import { assertSameOrigin } from "@/server/security/csrf";
import { remoteBrowserApiError } from "../../_shared";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const parsed = remoteBrowserSessionIdSchema.safeParse((await context.params).sessionId);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    return NextResponse.json(await readBrowserSession(parsed.data), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return remoteBrowserApiError(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    assertSameOrigin(request);
    const parsed = remoteBrowserSessionIdSchema.safeParse((await context.params).sessionId);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    await destroyBrowserSession(parsed.data);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return remoteBrowserApiError(error);
  }
}
