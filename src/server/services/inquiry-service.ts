import { inquirySchema } from "@/lib/validation/inquiry";
import { getInquiryDeliveryProvider } from "@/server/providers/inquiry-delivery";

export async function submitInquiry(value: unknown) {
  const parsed = inquirySchema.safeParse(value);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fields[key] ??= issue.message;
    }
    return { ok: false as const, status: 400, code: "invalid" as const, fields };
  }
  const result = await getInquiryDeliveryProvider().deliver(parsed.data);
  if (!result.delivered) {
    return {
      ok: false as const,
      status: 503,
      code: result.reason,
      message: result.reason === "not_configured"
        ? "현재 온라인 문의 접수 서비스가 준비되지 않았습니다. 아래 대표전화로 문의해 주세요."
        : "문의 전달 중 문제가 발생했습니다. 잠시 후 다시 시도하거나 대표전화로 문의해 주세요.",
    };
  }
  return { ok: true as const, status: 201, message: "문의가 접수되었습니다. 담당자가 확인 후 연락드리겠습니다." };
}
