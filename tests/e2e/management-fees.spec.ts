import { expect, test } from "@playwright/test";

test("회계 관리자의 관리비 등록·조정·마감·보고서 흐름",async({page},testInfo)=>{
  test.skip(testInfo.project.name!=="데스크톱","관리비 전체 업무 흐름은 데스크톱 관리자 화면에서 한 번 검증합니다.");
  await page.goto("/admin/login");await page.getByRole("button",{name:"로그인"}).click();await page.waitForURL("**/admin");await page.goto("/admin/fees");
  await expect(page.getByRole("heading",{name:"관리비 대시보드"})).toBeVisible();await expect(page.getByText("총 부과액").first()).toBeVisible();await expect(page.getByRole("heading",{name:"관리자 확인 필요 항목"})).toBeVisible();

  await page.goto("/admin/fees/imports");const templateDownload=page.waitForEvent("download");await page.getByRole("link",{name:"한국어 CSV 양식 내려받기"}).click();expect((await templateDownload).suggestedFilename()).toContain("관리비-부과");
  const assessment="단지코드,기준월,동,호,항목코드,부과액,외부행ID,원본합계\nHAEOREUM,2026-07,101,1203,GENERAL,10000,E2E-ASSESSMENT-1,10000\n";
  await page.locator('#fee-csv').setInputFiles({name:"관리비-부과-E2E.csv",mimeType:"text/csv",buffer:Buffer.from(assessment)});await page.getByRole("button",{name:"업로드하고 검증"}).click();await expect(page.getByRole("heading",{name:"미리보기와 합계 대사"})).toBeVisible();await expect(page.getByText("검증 완료",{exact:true})).toBeVisible();await page.getByRole("button",{name:"검증 결과 확인 후 등록 확정"}).click();await expect(page.getByText("관리비 데이터를 불변 등록 내역으로 확정했습니다.")).toBeVisible();
  await page.getByLabel("등록 유형").selectOption("COLLECTION");const collection="단지코드,기준월,동,호,거래유형,금액,거래일,외부거래번호,원본합계\nHAEOREUM,2026-07,101,1203,수납,10000,2026-07-10,E2E-PAYMENT-1,10000\n";await page.locator('#fee-csv').setInputFiles({name:"관리비-수납-E2E.csv",mimeType:"text/csv",buffer:Buffer.from(collection)});await page.getByRole("button",{name:"업로드하고 검증"}).click();await page.getByRole("button",{name:"검증 결과 확인 후 등록 확정"}).click();await expect(page.getByText("관리비 데이터를 불변 등록 내역으로 확정했습니다.")).toBeVisible();

  await page.goto("/admin/fees/units");await page.locator('select[name="building"]').selectOption("101");await page.locator('select[name="state"]').selectOption("미납");await page.getByRole("button",{name:"조회"}).click();await expect(page.getByText(/총 \d+세대/)).toBeVisible();await expect(page.locator("tbody tr").first()).toContainText("101동");

  await page.goto("/admin/fees/monthly/fee-period-2026-07");await page.getByRole("button",{name:"조정 등록"}).click();await expect(page.getByText("추가 전용 조정 내역을 등록했습니다.")).toBeVisible();await page.getByRole("button",{name:"방금 등록한 조정 승인"}).click();await expect(page.getByText("조정 내역을 승인했습니다.")).toBeVisible();await page.getByRole("button",{name:"기준월 확정"}).click();await expect(page.getByText("기준월을 확정했습니다.")).toBeVisible();page.once("dialog",dialog=>dialog.accept("부과·수납 대사 확인 완료"));await page.getByRole("button",{name:"기준월 마감"}).click();await expect(page.getByText("불변 스냅샷을 만들고 기준월을 마감했습니다.")).toBeVisible();
  const rejected=await page.evaluate(async()=>{const response=await fetch("/api/admin/fees/adjustments",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({periodId:"fee-period-2026-07",unitKey:"101동 1203호",amount:"1000",reasonKo:"마감 뒤 직접 수정 시도",idempotencyKey:crypto.randomUUID()})});return {status:response.status,body:await response.json() as {error?:string}};});expect(rejected.status).toBe(409);expect(rejected.body.error).toContain("직접 조정");

  await page.reload();await expect(page.getByText("관리비 기준월 마감")).toBeVisible();await page.goto("/admin/fees/reports");const csvDownload=page.waitForEvent("download");await page.getByRole("link",{name:"CSV 내려받기"}).first().click();expect((await csvDownload).suggestedFilename()).toContain("관리비");const pdfDownload=page.waitForEvent("download");await page.getByRole("link",{name:"PDF 내려받기"}).click();expect((await pdfDownload).suggestedFilename()).toContain("관리비");

  await page.goto("/admin/agendas/demo-agenda");await page.getByRole("button",{name:"비용 영향 계산·저장"}).click();await expect(page.getByText(/비용 계산 스냅샷 \d+판을 저장했습니다/)).toBeVisible();
});
