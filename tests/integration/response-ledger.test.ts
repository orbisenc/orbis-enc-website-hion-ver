import { describe, expect, it } from "vitest";
import { ResponseLedger } from "@/server/services/response-ledger";
const campaign=(allowResponseChange=false)=>new ResponseLedger({tenantId:"가",startsAt:new Date("2026-01-01"),endsAt:new Date("2026-12-31"),allowResponseChange});
const input=(key:string,option="동의")=>({tenantId:"가",targetId:"대상-1",option,idempotencyKey:key,now:new Date("2026-07-15")});
describe("응답 원장",()=>{
  it("일반 응답을 저장한다",async()=>expect((await campaign().submit(input(crypto.randomUUID()))).state).toBe("ACTIVE"));
  it("같은 멱등 키에는 같은 응답을 반환한다",async()=>{const l=campaign(), key=crypto.randomUUID();const a=await l.submit(input(key));const b=await l.submit(input(key));expect(b.id).toBe(a.id);expect(l.responses).toHaveLength(1);});
  it("서로 다른 탭의 동시 제출에도 활성 응답은 하나다",async()=>{const l=campaign();await Promise.all([l.submit(input(crypto.randomUUID())),l.submit(input(crypto.randomUUID(),"반대"))]);expect(l.responses.filter(r=>r.state==="ACTIVE")).toHaveLength(1);});
  it("변경 금지 시 기존 응답을 돌려준다",async()=>{const l=campaign();const a=await l.submit(input(crypto.randomUUID()));const b=await l.submit(input(crypto.randomUUID(),"반대"));expect(b.id).toBe(a.id);});
  it("변경 허용 시 이전 응답을 대체한다",async()=>{const l=campaign(true);const a=await l.submit(input(crypto.randomUUID()));const b=await l.submit(input(crypto.randomUUID(),"반대"));expect(a.state).toBe("SUPERSEDED");expect(b.previousId).toBe(a.id);});
  it("마감 뒤 제출을 거부한다",async()=>{const l=campaign();await expect(l.submit({...input(crypto.randomUUID()),now:new Date("2027-01-01")})).rejects.toThrow("기간");});
  it("다른 테넌트를 거부한다",async()=>{const l=campaign();await expect(l.submit({...input(crypto.randomUUID()),tenantId:"나"})).rejects.toThrow("권한");});
});

