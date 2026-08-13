import { expect, test, type Page } from "@playwright/test";

async function loginAs(page: Page, role: string) {
  await page.goto("/login");
  await page.getByRole("button", { name: new RegExp(role) }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("관리사무소 책임자가 대시보드와 3D 자산 상세를 연다", async ({ page }) => {
  await loginAs(page, "관리사무소 책임자");
  await expect(page.getByRole("heading", { name: "HION 스마트파크 시설운영 대시보드" })).toBeVisible();
  await expect(page.getByText("점검 완료율")).toBeVisible();
  await page.goto("/asset-map");
  await page.getByRole("button", { name: "지하주차장 배수펌프 P-02 상세 열기" }).click();
  await expect(page.getByLabel("지하주차장 배수펌프 P-02 상세 정보")).toBeVisible();
  await expect(page).toHaveURL(/assetId=HION-HSP01-/);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "3D 입체 보기" }).click();
  await expect(page.getByRole("region", { name: "HION 스마트파크 시설 3D 모델 보기" })).toBeVisible();
});

test("작업지시는 완료 요약과 작업 후 증빙 없이는 완료되지 않는다", async ({ page }) => {
  await loginAs(page, "관리사무소 책임자");
  await page.goto("/work-orders?orderId=WO-2026-0721-001");
  const drawer = page.getByLabel("배수펌프 P-02 진동 기준 초과 조치 상세");
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: "검수요청" }).click();
  await drawer.getByRole("button", { name: "완료" }).click();
  await expect(drawer).toContainText("완료 요약을 입력해 주세요.");
  await drawer.getByLabel("완료 요약").fill("베어링 교체와 축 정렬 후 진동값이 4.1mm/s로 정상 범위입니다.");
  await drawer.getByRole("button", { name: "실행 정보 저장" }).click();
  await drawer.getByPlaceholder("예: P-02_작업후.jpg").fill("P-02_작업후.jpg");
  await drawer.getByRole("button", { name: "작업 후 증빙 추가" }).click();
  await drawer.getByRole("button", { name: "완료" }).click();
  await expect(drawer).toContainText("완료 상태로 변경했습니다.");
});

test("교체 검토에서 위험점수 근거와 세 가지 시나리오를 비교한다", async ({ page }) => {
  await loginAs(page, "관리사무소 책임자");
  await page.goto("/replacement");
  await expect(page.getByRole("heading", { name: "교체·장기수선 검토" })).toBeVisible();
  await expect(page.getByText("건전도 저하 25%")) .toBeVisible();
  await expect(page.getByRole("heading", { name: "유지" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "부분보수" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "전면교체" })).toBeVisible();
});

test("위원회와 협력업체의 작업지시 범위를 역할별로 제한한다", async ({ page }) => {
  await loginAs(page, "입주자대표회의");
  await page.goto("/work-orders");
  await expect(page.getByText("0건")).toBeVisible();
  await expect(page.locator(".facility-work-card")).toHaveCount(0);
  await page.goto("/login");
  await page.getByRole("button", { name: /협력업체/ }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/work-orders");
  await expect(page.locator(".facility-work-card")).toHaveCount(2);
  await expect(page.getByText("스마트원")).toHaveCount(0);
});
