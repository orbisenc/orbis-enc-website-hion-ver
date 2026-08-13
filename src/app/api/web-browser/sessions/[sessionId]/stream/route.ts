import { NextResponse } from "next/server";
import { remoteBrowserSessionIdSchema } from "@/lib/remote-browser/contracts";
import { streamBrowserFrames } from "@/server/services/remote-browser-service";
import { remoteBrowserApiError } from "../../../_shared";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(request: Request, context: RouteContext) {
  try {
    const parsed = remoteBrowserSessionIdSchema.safeParse((await context.params).sessionId);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    const stream = await streamBrowserFrames(parsed.data, request.signal);
    return new Response(stream.body, {
      headers: {
        "content-type": stream.contentType,
        "cache-control": "no-store, max-age=0",
        "x-content-type-options": "nosniff",
        "x-accel-buffering": "no",
      },
    });
  } catch (error) {
    return remoteBrowserApiError(error);
  }
}
