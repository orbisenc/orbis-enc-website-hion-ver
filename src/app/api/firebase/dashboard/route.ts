import { NextResponse } from "next/server";
import { readAdminSession } from "@/server/auth/session";
import { FirebaseDashboardService } from "@/server/services/firebase-dashboard-service";

const campaignId = "demo-campaign";

async function adminContext() {
  const session = await readAdminSession();
  if (!session) return null;
  return { tenantId: session.tenantId };
}

export async function GET() {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const service = new FirebaseDashboardService();
  if (!service.isConfigured()) return NextResponse.json({ error: "Firebase 서버 자격 증명이 설정되지 않았습니다." }, { status: 503 });
  return NextResponse.json({ projection: await service.find(context.tenantId, campaignId) });
}

export async function POST() {
  const context = await adminContext();
  if (!context) return NextResponse.json({ error: "관리자 로그인이 필요합니다." }, { status: 401 });
  const service = new FirebaseDashboardService();
  if (!service.isConfigured()) return NextResponse.json({ error: "Firebase 서버 자격 증명이 설정되지 않았습니다." }, { status: 503 });
  return NextResponse.json({ projection: await service.sync(context.tenantId, campaignId) });
}
