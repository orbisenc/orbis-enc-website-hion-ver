import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation/contracts";
import { createAdminSession } from "@/server/auth/session";
import { checkRateLimit } from "@/server/security/rate-limit";
import { canUseDemoProviders } from "@/server/security/runtime";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!checkRateLimit(`admin:${ip}`, 8)) return NextResponse.json({ error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  const parsed = adminLoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." }, { status: 400 });
  const { email, password, mfaCode } = parsed.data;
  const valid = canUseDemoProviders() && email === "admin@hion.local" && password === "Hion!2026dev" && mfaCode === "000000";
  if (!valid) return NextResponse.json({ error: "계정 정보 또는 인증번호가 올바르지 않습니다." }, { status: 401 });
  await createAdminSession();
  return NextResponse.json({ ok: true });
}
