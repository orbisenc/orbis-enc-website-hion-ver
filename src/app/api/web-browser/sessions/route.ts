import { NextResponse } from "next/server";
import { createRemoteBrowserSessionSchema } from "@/lib/remote-browser/contracts";
import { createBrowserSession } from "@/server/services/remote-browser-service";
import { assertSameOrigin } from "@/server/security/csrf";
import { checkRateLimit } from "@/server/security/rate-limit";
import { remoteBrowserApiError } from "../_shared";

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!checkRateLimit(`remote-browser-create:${ip}`, 10, 10 * 60_000)) {
      return NextResponse.json({ error: "브라우저 생성 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
    }
    const parsed = createRemoteBrowserSessionSchema.safeParse(await request.json().catch(() => ({})));
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "화면 크기를 확인해 주세요." }, { status: 400 });
    return NextResponse.json(await createBrowserSession(parsed.data.width, parsed.data.height), { headers: { "cache-control": "no-store" } });
  } catch (error) {
    return remoteBrowserApiError(error);
  }
}
