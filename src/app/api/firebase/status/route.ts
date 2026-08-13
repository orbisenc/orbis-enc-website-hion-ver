import { NextResponse } from "next/server";
import { readAdminSession } from "@/server/auth/session";
import { getFirebaseBackendStatus } from "@/server/providers/firebase";

export async function GET() {
  if (!(await readAdminSession())) {
    return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  }
  return NextResponse.json(getFirebaseBackendStatus());
}
