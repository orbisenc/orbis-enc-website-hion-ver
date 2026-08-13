import { describe, expect, it } from "vitest";
import { allocateByUnitArea, allocateEqualAmount, calculateFeeLedger, changeRateBasisPoints, classifyOverdueAging, detectCategoryIncrease, sumWon } from "@/server/services/management-fee-ledger";

describe("관리비 원화 원장 계산", () => {
  it("원 부과·조정·수납·환급을 원 단위로 계산한다", () => {
    const result=calculateFeeLedger({originalAssessments:[100_001n,49_999n],adjustments:[-5_000n,1_000n],payments:[120_000n,20_000n],refunds:[10_000n],assessedActiveUnitCount:2});
    expect(result).toMatchObject({originalAssessment:150_000n,adjustmentAmount:-4_000n,finalAssessment:146_000n,netCollected:130_000n,appliedCollection:130_000n,outstanding:16_000n,overpayment:0n,averagePerUnit:73_000n});
    expect(result.collectionRateBasisPoints).toBe(8904);
  });
  it("0원 부과와 0세대 분모를 안전하게 처리한다",()=>expect(calculateFeeLedger({originalAssessments:[],adjustments:[],payments:[],refunds:[],assessedActiveUnitCount:0})).toMatchObject({collectionRateBasisPoints:null,averagePerUnit:0n,outstanding:0n}));
  it("부분납·환급·과납을 구분한다",()=>{const partial=calculateFeeLedger({originalAssessments:[200_000n],adjustments:[],payments:[100_000n],refunds:[10_000n],assessedActiveUnitCount:1});expect(partial.outstanding).toBe(110_000n);const over=calculateFeeLedger({originalAssessments:[200_000n],adjustments:[],payments:[230_000n],refunds:[],assessedActiveUnitCount:1});expect(over.overpayment).toBe(30_000n);expect(over.collectionRateBasisPoints).toBe(10_000);});
  it("전월·전년 대비와 0원 분모를 처리한다",()=>{expect(changeRateBasisPoints(120n,100n)).toBe(2000);expect(changeRateBasisPoints(80n,100n)).toBe(-2000);expect(changeRateBasisPoints(1n,0n)).toBeNull();});
  it("미납 기간을 분류한다",()=>{expect(classifyOverdueAging(0)).toBe("해당 없음");expect(classifyOverdueAging(1)).toBe("1개월");expect(classifyOverdueAging(2)).toBe("2개월");expect(classifyOverdueAging(8)).toBe("3개월 이상");});
  it("균등 배분의 나머지 1원을 보존한다",()=>{const values=allocateEqualAmount(10n,3);expect(values).toEqual([4n,3n,3n]);expect(sumWon(values)).toBe(10n);});
  it("면적 배분의 총액을 정확히 보존한다",()=>{const values=allocateByUnitArea(100_001n,[59,84,101]);expect(sumWon(values)).toBe(100_001n);expect(values[2]).toBeGreaterThan(values[0]!);});
  it("설정 기준을 넘은 항목 증가만 한국어로 설명한다",()=>{expect(detectCategoryIncrease({categoryNameKo:"공동전기료",currentAmount:118_400n,previousAmount:100_000n,thresholdBasisPoints:1500})).toContain("18.4%");expect(detectCategoryIncrease({categoryNameKo:"청소비",currentAmount:105n,previousAmount:100n,thresholdBasisPoints:1500})).toBeNull();});
});
