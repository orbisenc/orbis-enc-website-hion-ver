import { expect, test } from "@playwright/test";

test("점검 등록부터 수정·진행·완료·복제·삭제까지 동작한다", async ({ page }, testInfo) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") browserErrors.push(message.text()); });
  await page.goto("/inspections");

  await expect(page.getByRole("heading", { name: "점검 관리" })).toBeVisible();
  await page.getByRole("button", { name: "새 점검 등록" }).click();
  const createDialog = page.getByRole("dialog", { name: "새 점검 등록" });
  await expect(createDialog).toBeVisible();
  await page.screenshot({ path: `test-results/inspection-form-${testInfo.project.name}.png`, fullPage: false });
  await createDialog.getByText("점검 등록", { exact: true }).click();
  await expect(createDialog.getByRole("alert")).toContainText("입력 내용을 확인");
  await createDialog.getByLabel(/점검명/).fill("체육관 비상유도등 특별점검");
  await createDialog.getByLabel(/대상 객체/).selectOption({ label: "놀이터 시설 PL-01 · 중앙광장" });
  await createDialog.getByLabel(/예정일/).fill("2026-08-12");
  await createDialog.getByLabel(/담당자/).selectOption("안전관리팀");
  await createDialog.getByLabel(/점검 항목/).fill("점등 상태\n축전지 전압\n유도 방향 표시");
  await createDialog.getByLabel("관리 메모").fill("체육관 사용 종료 후 점검합니다.");
  await createDialog.getByRole("button", { name: "점검 등록" }).click();

  let detail = page.getByRole("dialog", { name: "점검 상세" });
  await expect(detail.getByRole("heading", { name: "체육관 비상유도등 특별점검" })).toBeVisible();
  await expect(detail.getByText("체육관 사용 종료 후 점검합니다.")).toBeVisible();
  await page.screenshot({ path: `test-results/inspection-detail-${testInfo.project.name}.png`, fullPage: false });
  await detail.getByRole("button", { name: "수정" }).click();
  const editDialog = page.getByRole("dialog", { name: "점검 일정 수정" });
  await editDialog.getByLabel(/점검명/).fill("체육관 비상유도등 야간점검");
  await editDialog.getByRole("button", { name: "변경사항 저장" }).click();

  detail = page.getByRole("dialog", { name: "점검 상세" });
  await expect(detail.getByRole("heading", { name: "체육관 비상유도등 야간점검" })).toBeVisible();
  await detail.getByRole("button", { name: "점검 시작" }).click();
  await expect(detail.getByText("진행", { exact: true }).first()).toBeVisible();
  await detail.getByRole("button", { name: "완료 처리" }).click();
  await detail.getByLabel(/점검 결과/).fill("점등과 축전지 전압이 모두 정상입니다.");
  await detail.getByRole("button", { name: "완료 저장" }).click();
  await expect(detail.getByText("점등과 축전지 전압이 모두 정상입니다.")).toBeVisible();
  await expect(detail.getByText("완료", { exact: true }).first()).toBeVisible();

  await detail.getByRole("button", { name: "일정 복제" }).click();
  const duplicateDialog = page.getByRole("dialog", { name: "점검 일정 복제" });
  await duplicateDialog.getByLabel(/점검명/).fill("체육관 비상유도등 재점검");
  await duplicateDialog.getByRole("button", { name: "복제 일정 등록" }).click();
  detail = page.getByRole("dialog", { name: "점검 상세" });
  await expect(detail.getByRole("heading", { name: "체육관 비상유도등 재점검" })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await detail.getByRole("button", { name: "삭제" }).click();
  await expect(detail).toBeHidden();

  await page.getByPlaceholder("점검명, 객체, 위치, 담당자 검색").fill("야간점검");
  await expect(page.getByRole("row", { name: /체육관 비상유도등 야간점검/ })).toBeVisible();
  await page.screenshot({ path: `test-results/inspection-management-${testInfo.project.name}.png`, fullPage: true });
  expect(browserErrors).toEqual([]);
});

test("대시보드 정기점검 일정에서 상세 관리 화면을 연다", async ({ page }) => {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /지하주차장 배수펌프 P-02 성능점검/ }).click();
  const detail = page.getByRole("dialog", { name: "점검 상세" });
  await expect(detail.getByRole("heading", { name: "지하주차장 배수펌프 P-02 성능점검" })).toBeVisible();
  await expect(detail.getByText("계측값 허용 범위")).toBeVisible();
  await detail.getByRole("button", { name: "수정" }).click();
  await expect(page).toHaveURL(/\/inspections\?action=edit&inspectionId=inspection-1/);
  await expect(page.getByRole("dialog", { name: "점검 일정 수정" })).toBeVisible();
});
