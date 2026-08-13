import type { RemoteBrowserAction, RemoteBrowserState } from "@/lib/remote-browser/contracts";

export class RemoteBrowserGatewayError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "RemoteBrowserGatewayError";
  }
}

function gatewayUrl(path: string) {
  const baseUrl = process.env.REMOTE_BROWSER_GATEWAY_URL?.trim() || "http://127.0.0.1:3100";
  return new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
}

function gatewayHeaders(json = false) {
  const headers = new Headers();
  if (json) headers.set("content-type", "application/json");
  const token = process.env.REMOTE_BROWSER_GATEWAY_TOKEN?.trim();
  if (token) headers.set("authorization", `Bearer ${token}`);
  return headers;
}

async function parseGatewayError(response: Response) {
  const payload = await response.json().catch(() => null) as { error?: unknown } | null;
  return typeof payload?.error === "string" ? payload.error : "원격 브라우저 게이트웨이에 연결할 수 없습니다.";
}

async function gatewayJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(gatewayUrl(path), { ...init, headers: init?.headers ?? gatewayHeaders(Boolean(init?.body)), cache: "no-store", signal: AbortSignal.timeout(35_000) });
  } catch {
    throw new RemoteBrowserGatewayError("원격 브라우저 게이트웨이가 실행 중인지 확인해 주세요.", 503);
  }
  if (!response.ok) throw new RemoteBrowserGatewayError(await parseGatewayError(response), response.status);
  return response.json() as Promise<T>;
}

export function createGatewayBrowserSession(width: number, height: number) {
  return gatewayJson<RemoteBrowserState>("sessions", { method: "POST", headers: gatewayHeaders(true), body: JSON.stringify({ width, height }) });
}

export function getGatewayBrowserState(id: string) {
  return gatewayJson<RemoteBrowserState>(`sessions/${encodeURIComponent(id)}`);
}

export function performGatewayBrowserAction(id: string, action: RemoteBrowserAction) {
  return gatewayJson<RemoteBrowserState>(`sessions/${encodeURIComponent(id)}/actions`, { method: "POST", headers: gatewayHeaders(true), body: JSON.stringify(action) });
}

export async function captureGatewayBrowserFrame(id: string) {
  let response: Response;
  try {
    response = await fetch(gatewayUrl(`sessions/${encodeURIComponent(id)}/frame`), { headers: gatewayHeaders(), cache: "no-store", signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new RemoteBrowserGatewayError("원격 브라우저 화면을 가져오지 못했습니다.", 503);
  }
  if (!response.ok) throw new RemoteBrowserGatewayError(await parseGatewayError(response), response.status);
  return { data: await response.arrayBuffer(), contentType: response.headers.get("content-type") || "image/jpeg" };
}

export async function streamGatewayBrowserFrames(id: string, signal: AbortSignal) {
  let response: Response;
  try {
    response = await fetch(gatewayUrl(`sessions/${encodeURIComponent(id)}/stream`), {
      headers: gatewayHeaders(),
      cache: "no-store",
      signal,
    });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new RemoteBrowserGatewayError("원격 브라우저 화면 스트림에 연결하지 못했습니다.", 503);
  }
  if (!response.ok) throw new RemoteBrowserGatewayError(await parseGatewayError(response), response.status);
  if (!response.body) throw new RemoteBrowserGatewayError("원격 브라우저 화면 스트림이 비어 있습니다.", 502);
  return {
    body: response.body,
    contentType: response.headers.get("content-type") || "multipart/x-mixed-replace; boundary=frame",
  };
}

export async function closeGatewayBrowserSession(id: string) {
  let response: Response;
  try {
    response = await fetch(gatewayUrl(`sessions/${encodeURIComponent(id)}`), { method: "DELETE", headers: gatewayHeaders(), cache: "no-store", signal: AbortSignal.timeout(10_000) });
  } catch {
    return;
  }
  if (!response.ok && response.status !== 404) throw new RemoteBrowserGatewayError(await parseGatewayError(response), response.status);
}
