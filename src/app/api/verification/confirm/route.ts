import { NextResponse } from "next/server";
import { verificationConfirmSchema } from "@/lib/validation/contracts";
import { confirmChallenge } from "@/server/demo/store";
export async function POST(request: Request) {
  const parsed=verificationConfirmSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"입력값을 확인해 주세요."},{status:400});
  const verificationId=confirmChallenge(parsed.data.transactionId,parsed.data.otp);
  if(!verificationId)return NextResponse.json({error:"인증번호가 올바르지 않거나 유효 시간이 지났습니다."},{status:401});
  return NextResponse.json({verificationId,eligibility:{building:"101동",unit:"1203호",rightType:"소유자 의결권 1개"}});
}

