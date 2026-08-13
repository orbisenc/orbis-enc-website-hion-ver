import { expect, test } from "@playwright/test";

const routes = ["/", "/hion", "/solutions", "/industries/education", "/company", "/contact", "/privacy"];

test.describe("ORBIS D&C 공식 웹사이트", () => {
  for (const route of routes) {
    test(`${route} 직접 접근과 반응형 레이아웃`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
      const response = await page.goto(route);
      expect(response?.ok()).toBe(true);
      await expect(page.locator("html")).toHaveAttribute("lang", "ko");
      await expect(page.locator("h1")).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
      expect(consoleErrors).toEqual([]);
    });
  }

  test("모바일 메뉴는 열리고 Escape로 닫힌다", async ({ page, isMobile }) => {
    test.skip(!isMobile, "모바일 프로젝트에서만 실행");
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "메뉴 열기" });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "모바일 메뉴" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "모바일 메뉴" })).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("문의는 클라이언트 검증 후 미설정 어댑터를 성공으로 처리하지 않는다", async ({ page }) => {
    await page.goto("/contact?type=education");
    await expect(page.locator("#facilityType")).toHaveValue("학교·교육시설");
    await page.locator("#organization").fill("테스트 교육기관");
    await page.locator("#name").fill("홍길동");
    await page.locator("#email").fill("tester@example.com");
    await page.locator("#phone").fill("010-1234-5678");
    await page.locator("#message").fill("학교 시설자산 관리 체계 도입 범위를 상담하고 싶습니다.");
    await page.locator("#privacyConsent").check();
    await page.getByRole("button", { name: "상담 요청 보내기" }).click();
    await expect(page.locator(".form-status[role='alert']")).toContainText("현재 온라인 문의 접수 서비스가 준비되지 않았습니다");
    await expect(page.getByRole("status")).toHaveCount(0);
  });
});
