import { NextResponse } from "next/server";
import { RemoteBrowserGatewayError } from "@/server/providers/remote-browser-gateway";
import { RemoteBrowserServiceError } from "@/server/services/remote-browser-service";

export function remoteBrowserApiError(error: unknown) {
  if (error instanceof RemoteBrowserGatewayError || error instanceof RemoteBrowserServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: "원격 브라우저 요청을 처리하지 못했습니다." }, { status: 500 });
}
