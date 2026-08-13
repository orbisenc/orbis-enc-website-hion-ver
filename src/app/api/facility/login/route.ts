import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { facilityDemoUsers } from "@/data/facilityDemoUsers";
import { createFacilitySession } from "@/server/auth/session";
import { checkRateLimit } from "@/server/security/rate-limit";
import { canUseDemoProviders } from "@/server/security/runtime";

const schema = z.object({ email: z.string().email("올바른 이메일 주소를 입력해 주세요."), password: z.string().min(8, "비밀번호는 8자 이상이어야 합니다.") });
const demoPasswordHash = "$2b$10$Pi5SngXrNvTNLxRMRnzc/O7SJsNWm0bJc/iy9wmwJuarRZPC.b.X.";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!checkRateLimit(`facility-login:${ip}`, 10)) return NextResponse.json({ error: "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  if (!canUseDemoProviders()) return NextResponse.json({ error: "운영 환경에서는 데모 계정 로그인을 사용할 수 없습니다." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." }, { status: 400 });
  const user = facilityDemoUsers.find((item) => item.email === parsed.data.email.toLowerCase());
  if (!user || !(await bcrypt.compare(parsed.data.password, demoPasswordHash))) return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  await createFacilitySession({ userId: user.id, name: user.name, role: user.role });
  return NextResponse.json({ ok: true, role: user.role, redirectTo: "/dashboard" });
}
