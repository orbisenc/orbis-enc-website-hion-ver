export type MarketingEvent =
  | "contact_cta_clicked"
  | "contact_form_started"
  | "contact_form_submitted";

export type MarketingEventPayload = {
  event: MarketingEvent;
  page: string;
};

export function trackMarketingEvent(payload: MarketingEventPayload) {
  // 분석 도구가 승인된 뒤 이 경계에서 연결합니다. 현재는 개인정보를 수집하거나 전송하지 않습니다.
  void payload;
}
