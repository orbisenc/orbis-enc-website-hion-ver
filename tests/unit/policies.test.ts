import { describe, expect, it } from "vitest";
import { assertAgendaMutable, assertTenantScope, calculateQuorum, canTransitionCampaign, deadlineStatus } from "@/server/policies/campaign";
import { maskKoreanName, maskPhone } from "@/lib/format/ko";
import { normalizeForEvidence, sha256 } from "@/lib/security/hash";
import { assertSafeProductionConfiguration } from "@/server/security/runtime";
describe("핵심 정책",()=>{
  it("테넌트가 다르면 존재 여부를 드러내지 않고 거부한다",()=>expect(()=>assertTenantScope("가","나")).toThrow("권한"));
  it("캠페인 상태 전이를 제한한다",()=>{expect(canTransitionCampaign("OPEN","CLOSED")).toBe(true);expect(canTransitionCampaign("FINALIZED","OPEN")).toBe(false);});
  it("게시된 안건 변경을 거부한다",()=>expect(()=>assertAgendaMutable("PUBLISHED")).toThrow("새 버전"));
  it("정족수를 계산한다",()=>expect(calculateQuorum(2000,1000,.5)).toEqual({ratio:.5,requiredRatio:.5,met:true}));
  it("한국어 이름과 전화번호를 가린다",()=>{expect(maskKoreanName("홍길동")).toBe("홍*동");expect(maskPhone("010-1234-5678")).toBe("010-****-5678");});
  it("정규화된 동의·콘텐츠 해시를 만든다",()=>{expect(sha256("동의\r\n내용 ")).toBe(sha256("동의\n내용"));expect(normalizeForEvidence({b:2,a:1})).toBe('{"a":1,"b":2}');});
  it("서버 마감 시각을 판정한다",()=>{const start=new Date("2026-01-01");const end=new Date("2026-01-02");expect(deadlineStatus(new Date("2025-12-31"),start,end)).toBe("BEFORE");expect(deadlineStatus(new Date("2026-01-03"),start,end)).toBe("ENDED");});
  it("개발 모드에서는 모의 공급자 검사를 통과한다",()=>expect(()=>assertSafeProductionConfiguration()).not.toThrow());
});
