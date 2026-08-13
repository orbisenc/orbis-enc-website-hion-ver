export function isPublicDemoMode() {
  return process.env.ENABLE_PUBLIC_DEMO === "true";
}

export function canUseDemoProviders() {
  return process.env.NODE_ENV !== "production" || isPublicDemoMode();
}

export function assertSafeProductionConfiguration() {
  if (process.env.NODE_ENV !== "production") return;
  if (isPublicDemoMode()) return;
  const unsafe = process.env.ENABLE_DEVELOPMENT_MOCKS === "true" || process.env.IDENTITY_PROVIDER === "mock" ||
    !process.env.SESSION_SECRET || process.env.SESSION_SECRET.includes("개발");
  if (unsafe) throw new Error("운영 환경에서는 모의 공급자와 기본 개발 비밀을 사용할 수 없습니다.");
}

export function canEnableLegalConsent() {
  return process.env.ENABLE_LEGAL_CONSENT === "true" && Boolean(process.env.IDENTITY_PROVIDER && process.env.IDENTITY_PROVIDER !== "mock") &&
    Boolean(process.env.ELECTRONIC_SIGNATURE_PROVIDER && process.env.ELECTRONIC_SIGNATURE_PROVIDER !== "disabled");
}
