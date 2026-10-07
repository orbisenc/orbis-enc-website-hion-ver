import { afterEach, describe, expect, it } from "vitest";
import { inquirySchema } from "@/lib/validation/inquiry";
import { submitInquiry } from "@/server/services/inquiry-service";

const validInquiry = {
  inquiryType: "HiON 도입",
  organization: "테스트 교육기관",
  name: "홍길동",
  department: "시설팀",
  email: "tester@example.com",
  phone: "010-1234-5678",
  facilityType: "학교·교육시설",
  facilityScale: "3개 동",
  desiredTiming: "검토 중",
  message: "학교 시설자산 관리 체계 도입 범위에 관해 상담을 요청합니다.",
  privacyConsent: true,
  website: "",
} as const;

const previousWebhookUrl = process.env.INQUIRY_WEBHOOK_URL;
const previousWebhookToken = process.env.INQUIRY_WEBHOOK_TOKEN;

afterEach(() => {
  if (previousWebhookUrl === undefined) delete process.env.INQUIRY_WEBHOOK_URL;
  else process.env.INQUIRY_WEBHOOK_URL = previousWebhookUrl;
  if (previousWebhookToken === undefined) delete process.env.INQUIRY_WEBHOOK_TOKEN;
  else process.env.INQUIRY_WEBHOOK_TOKEN = previousWebhookToken;
});

describe("공식 웹사이트 문의 검증", () => {
  it("필수 항목과 동의 여부를 검증한다", () => {
    const result = inquirySchema.safeParse({ ...validInquiry, email: "invalid", privacyConsent: false });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(["email", "privacyConsent"]));
  });

  it("문의 내용 없이도 정상적인 문의를 허용한다", () => {
    const withoutMessage: Omit<typeof validInquiry, "message"> & { message?: never } = { ...validInquiry };
    delete withoutMessage.message;
    expect(inquirySchema.safeParse(withoutMessage).success).toBe(true);
  });

  it("정상적인 학교시설 문의를 허용한다", () => {
    expect(inquirySchema.safeParse(validInquiry).success).toBe(true);
  });

  it("전달 어댑터가 없으면 성공으로 응답하지 않는다", async () => {
    delete process.env.INQUIRY_WEBHOOK_URL;
    delete process.env.INQUIRY_WEBHOOK_TOKEN;
    const result = await submitInquiry(validInquiry);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("미설정 어댑터가 성공으로 처리되었습니다.");
    expect(result.status).toBe(503);
    expect(result.code).toBe("not_configured");
  });

  it("허니팟 값이 있으면 요청을 거부한다", () => {
    expect(inquirySchema.safeParse({ ...validInquiry, website: "bot.example" }).success).toBe(false);
  });
});
