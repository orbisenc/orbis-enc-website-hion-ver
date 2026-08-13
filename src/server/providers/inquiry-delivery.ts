import type { InquiryInput } from "@/lib/validation/inquiry";

export type InquiryDeliveryResult = { delivered: true } | { delivered: false; reason: "not_configured" | "delivery_failed" };

export interface InquiryDeliveryProvider {
  deliver(input: InquiryInput): Promise<InquiryDeliveryResult>;
}

class UnavailableInquiryProvider implements InquiryDeliveryProvider {
  async deliver(): Promise<InquiryDeliveryResult> { return { delivered: false, reason: "not_configured" }; }
}

class WebhookInquiryProvider implements InquiryDeliveryProvider {
  constructor(private readonly url: string, private readonly token: string) {}
  async deliver(input: InquiryInput): Promise<InquiryDeliveryResult> {
    try {
      const response = await fetch(this.url, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${this.token}` },
        body: JSON.stringify({ ...input, website: undefined, submittedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(8_000),
        cache: "no-store",
      });
      return response.ok ? { delivered: true } : { delivered: false, reason: "delivery_failed" };
    } catch { return { delivered: false, reason: "delivery_failed" }; }
  }
}

export function getInquiryDeliveryProvider(): InquiryDeliveryProvider {
  const url = process.env.INQUIRY_WEBHOOK_URL;
  const token = process.env.INQUIRY_WEBHOOK_TOKEN;
  if (!url || !token) return new UnavailableInquiryProvider();
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:") return new UnavailableInquiryProvider();
    return new WebhookInquiryProvider(parsedUrl.toString(), token);
  } catch { return new UnavailableInquiryProvider(); }
}
