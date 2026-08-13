import { expect, test } from "@playwright/test";

test("안건 제작부터 현황 운영까지 모든 관리 동작이 연결된다", async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), "상태를 변경하는 시나리오는 공유 시연 저장소 충돌을 막기 위해 데스크톱에서 한 번 검증합니다.");
  await page.goto("/admin/login");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByRole("heading", { name: "안건 현황" })).toBeVisible();

  await page.goto("/admin/agendas/demo-agenda");
  await expect(page.getByRole("heading", { name: /지하주차장 방화문/ })).toBeVisible();
  await expect(page.getByText("게시 준비 점검")).toBeVisible();
  await page.getByRole("button", { name: "새 버전 만들기" }).click();
  await expect(page.getByText("새 안건 버전 초안을 만들었습니다.")).toBeVisible();
  await page.getByLabel("한 줄 요약").fill("방화문 통행 안전과 주차 편의를 함께 개선하는 수정 제안입니다.");
  await page.getByRole("button", { name: "초안 저장" }).click();
  await expect(page.getByText("안건 초안을 저장했습니다.")).toBeVisible();
  await page.locator('input[name="file"]').setInputFiles({ name: "검토용-배치도.pdf", mimeType: "application/pdf", buffer: Buffer.from("%PDF-1.4\n% agenda workflow\n") });
  await page.locator('input[name="altTextKo"]').fill("검토용 변경 전후 배치도");
  await page.getByRole("button", { name: "안건에 첨부" }).click();
  await expect(page.getByText("첨부 자료가 안건에 저장되어 입주민 화면에 공개됩니다.")).toBeVisible();
  await page.getByRole("button", { name: "검토 요청" }).click();
  await expect(page.getByText("승인 관리자에게 검토를 요청했습니다.")).toBeVisible();
  await page.getByRole("button", { name: "승인", exact: true }).click();
  await expect(page.getByText("안건을 승인했습니다.")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "입주민 게시" }).click();
  await expect(page.getByText("승인된 안건을 입주민용 게시본으로 확정했습니다.")).toBeVisible();

  await page.goto("/admin/agendas/demo-agenda/viewer");
  await page.getByRole("button", { name: "새 장면 버전 저장" }).click();
  await expect(page.getByText(/장면 구성을 저장했습니다/)).toBeVisible();

  await page.goto("/admin/campaigns/demo-campaign");
  await expect(page.getByRole("heading", { name: "2026년 주차 환경 개선" })).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept("운영 설정 점검을 위해 일시중지"));
  await page.getByRole("button", { name: "일시중지" }).click();
  await expect(page.getByText("일시중지 처리가 완료됐습니다.")).toBeVisible();
  await page.getByLabel("응답 정족수").fill("55");
  await page.getByRole("button", { name: "운영 설정 저장" }).click();
  await expect(page.getByText("기간·대상·응답 정책을 저장했습니다.")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept("설정 검토를 마치고 진행 재개"));
  await page.getByRole("button", { name: "진행 재개" }).click();
  await expect(page.getByText("진행 재개 처리가 완료됐습니다.")).toBeVisible();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "선택 대상에게 재안내" }).click();
  await expect(page.getByText(/미응답 .*명에게 한국어 재안내를 저장했습니다/)).toBeVisible();

  await page.goto("/admin/campaigns/demo-campaign/reports");
  await expect(page.getByRole("heading", { name: "결과·증거 보고서" })).toBeVisible();
  await expect(page.getByText(/응답 정족수/).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "증거 명세 JSON" })).toHaveAttribute("href", /reasonKo=/);
});
