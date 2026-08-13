import { expect, test } from "@playwright/test";

test("관리자 세션에서 HION Consent Firebase 연결 상태를 확인한다", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const status = await page.evaluate(async () => {
    const response = await fetch("/api/firebase/status");
    return { status: response.status, body: await response.json() };
  });

  expect(status.status).toBe(200);
  expect(status.body).toMatchObject({
    configured: true,
    projectId: "orbis-gantt-chart-e6363",
    appId: "1:952441003780:web:9a2eaa71bdd5cb1910fa51",
    databaseRegion: "asia-northeast3",
  });
});
