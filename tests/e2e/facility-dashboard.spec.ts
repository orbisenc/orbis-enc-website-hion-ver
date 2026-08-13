import { expect, test } from "@playwright/test";

test("아파트 시설 대시보드의 핵심 상호작용이 동작한다", async ({ page }) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
  await page.setViewportSize({ width: 1680, height: 945 });
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "HION 스마트파크 시설운영 대시보드" })).toBeVisible();
  await expect(page.locator(".facility-kpi")).toHaveCount(4);
  await expect(page.locator(".facility-kpi small").filter({ hasText: /긴급 이슈|교체 검토|점검 완료율|예산 집행률/ })).toHaveCount(4);
  await expect(page.getByRole("img", { name: "HION 스마트파크 시설 배치 대체 이미지" })).toBeVisible();
  await page.getByRole("button", { name: "지하주차장 배수펌프 P-02 상세 열기" }).click();
  await expect(page.getByLabel("지하주차장 배수펌프 P-02 상세 정보")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "3D 입체 보기" }).click();
  await expect(page.getByRole("region", { name: "HION 스마트파크 시설 3D 모델 보기" })).toBeVisible();
  await expect(page.getByRole("button", { name: "3D 시점 초기화" })).toBeVisible();
  await page.getByRole("button", { name: "2D 이미지 보기" }).click();
  await page.getByRole("button", { name: "알림 3개" }).click();
  await page.getByRole("button", { name: "모두 읽음 처리" }).click();
  await expect(page.getByRole("button", { name: "알림 0개" })).toBeVisible();
  await page.screenshot({ path: "test-results/hion-apartment-dashboard-1680x945.png", fullPage: false });
  expect(browserErrors).toEqual([]);
});
