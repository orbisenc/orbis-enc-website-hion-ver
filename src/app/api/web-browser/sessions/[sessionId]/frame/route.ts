import { NextResponse } from "next/server";
import { remoteBrowserSessionIdSchema } from "@/lib/remote-browser/contracts";
import { readBrowserFrame } from "@/server/services/remote-browser-service";
import { remoteBrowserApiError } from "../../../_shared";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const parsed = remoteBrowserSessionIdSchema.safeParse((await context.params).sessionId);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const frame = await readBrowserFrame(parsed.data);
    return new NextResponse(frame.data, { headers: { "content-type": frame.contentType, "cache-control": "no-store, max-age=0", "x-content-type-options": "nosniff" } });
  } catch (error) {
    return remoteBrowserApiError(error);
  }
}
