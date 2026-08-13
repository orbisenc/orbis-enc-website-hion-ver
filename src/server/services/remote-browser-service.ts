import type { RemoteBrowserAction } from "@/lib/remote-browser/contracts";
import {
  captureGatewayBrowserFrame,
  closeGatewayBrowserSession,
  createGatewayBrowserSession,
  getGatewayBrowserState,
  performGatewayBrowserAction,
  streamGatewayBrowserFrames,
} from "@/server/providers/remote-browser-gateway";

export class RemoteBrowserServiceError extends Error {
  constructor(message: string, public readonly status = 500) {
    super(message);
    this.name = "RemoteBrowserServiceError";
  }
}

export function assertRemoteBrowserEnabled() {
  if (process.env.NODE_ENV === "production" && process.env.ENABLE_REMOTE_BROWSER !== "true") {
    throw new RemoteBrowserServiceError("원격 웹 브라우저 기능이 활성화되지 않았습니다.", 403);
  }
}

export async function createBrowserSession(width: number, height: number) {
  assertRemoteBrowserEnabled();
  return createGatewayBrowserSession(width, height);
}

export async function readBrowserSession(id: string) {
  assertRemoteBrowserEnabled();
  return getGatewayBrowserState(id);
}

export async function readBrowserFrame(id: string) {
  assertRemoteBrowserEnabled();
  return captureGatewayBrowserFrame(id);
}

export async function streamBrowserFrames(id: string, signal: AbortSignal) {
  assertRemoteBrowserEnabled();
  return streamGatewayBrowserFrames(id, signal);
}

export async function executeBrowserAction(id: string, action: RemoteBrowserAction) {
  assertRemoteBrowserEnabled();
  return performGatewayBrowserAction(id, action);
}

export async function destroyBrowserSession(id: string) {
  assertRemoteBrowserEnabled();
  await closeGatewayBrowserSession(id);
}
