import { NextResponse } from "next/server";
import { responseSchema } from "@/lib/validation/contracts";
import { ResponseService } from "@/server/services/response-service";
export async function POST(request: Request) {
  const parsed=responseSchema.safeParse(await request.json().catch(()=>null));
  if(!parsed.success)return NextResponse.json({error:parsed.error.issues[0]?.message??"입력값을 확인해 주세요."},{status:400});
  try { return NextResponse.json({receipt:await new ResponseService().submit(parsed.data)}); }
  catch(error){ return NextResponse.json({error:error instanceof Error?error.message:"응답을 제출하지 못했습니다."},{status:409}); }
}

