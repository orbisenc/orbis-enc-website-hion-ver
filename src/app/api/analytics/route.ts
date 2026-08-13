import { NextResponse } from "next/server";
import { z } from "zod";
import { recordEvent } from "@/server/demo/store";
const schema=z.object({eventName:z.enum(["agenda_section_viewed","video_started","video_completed","viewer_interacted","hotspot_opened","response_started","receipt_viewed"])});
export async function POST(request:Request){const parsed=schema.safeParse(await request.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"분석 이벤트 형식이 올바르지 않습니다."},{status:400});recordEvent(parsed.data.eventName);return NextResponse.json({ok:true});}

