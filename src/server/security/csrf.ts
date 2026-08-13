export function assertSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) {
    if (process.env.NODE_ENV === "production") throw new Error("요청 출처를 확인할 수 없습니다.");
    return;
  }
  const originUrl = new URL(origin);
  const requestUrl = new URL(request.url);
  const expectedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() || request.headers.get("host") || requestUrl.host;
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const expectedProtocol = forwardedProtocol ? `${forwardedProtocol}:` : requestUrl.protocol;
  if (expectedHost !== originUrl.host || expectedProtocol !== originUrl.protocol) throw new Error("허용되지 않은 요청 출처입니다.");
}
