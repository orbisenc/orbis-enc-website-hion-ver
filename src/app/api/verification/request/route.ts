import { NextResponse } from "next/server";
import { verificationRequestSchema } from "@/lib/validation/contracts";
import { createChallenge, DEMO_PHONE, DEMO_TOKEN, recordEvent } from "@/server/demo/store";
import { checkRateLimit } from "@/server/security/rate-limit";
import { getDemoCampaignRecord } from "@/server/demo/agenda-campaign-store";

export async function POST(request: Request) {
  const parsed = verificationRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." }, { status: 400 });
  const { token, phone } = parsed.data;
  const campaign = getDemoCampaignRecord("hion-demo");
  const now = new Date();
  if (campaign.status !== "OPEN" || now < new Date(campaign.startsAt) || now > new Date(campaign.endsAt)) return NextResponse.json({ error: "현재 본인 확인을 진행할 수 없는 안건입니다." }, { status: 409 });
  if (!checkRateLimit(`otp:${token}`, 5, 10 * 60_000)) return NextResponse.json({ error: "인증번호 요청이 너무 많습니다. 10분 뒤 다시 시도해 주세요." }, { status: 429 });
  if (token !== DEMO_TOKEN || phone !== DEMO_PHONE) return NextResponse.json({ error: "초대 정보와 일치하지 않습니다. 관리사무소에 문의해 주세요." }, { status: 404 });
  recordEvent("verification_started");
  return NextResponse.json({ transactionId: createChallenge(token, phone), expiresInSeconds: 300 });
}
