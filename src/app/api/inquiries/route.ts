import { NextResponse } from "next/server";
import { submitInquiry } from "@/server/services/inquiry-service";
import { checkRateLimit } from "@/server/security/rate-limit";

export async function POST(request: Request) {
  const clientKey = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRateLimit(`inquiry:${clientKey}`, 4, 10 * 60_000)) {
    return NextResponse.json({ ok: false, message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }
  const body = await request.json().catch(() => null);
  const result = await submitInquiry(body);
  return NextResponse.json(result, { status: result.status });
}
