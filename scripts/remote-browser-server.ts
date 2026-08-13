import { createHash, timingSafeEqual } from "node:crypto";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createRemoteBrowserSessionSchema, remoteBrowserActionSchema, remoteBrowserSessionIdSchema } from "../src/lib/remote-browser/contracts";
import {
  captureRemoteBrowserFrame,
  closeAllRemoteBrowserSessions,
  closeRemoteBrowserSession,
  createRemoteBrowserSession,
  getRemoteBrowserState,
  performRemoteBrowserAction,
  RemoteBrowserProviderError,
  waitForRemoteBrowserFrame,
} from "../src/server/providers/playwright-remote-browser";
import { RemoteBrowserPolicyError } from "../src/server/services/remote-browser-url-policy";

const host = process.env.REMOTE_BROWSER_GATEWAY_HOST?.trim() || "127.0.0.1";
const port = Number(process.env.REMOTE_BROWSER_GATEWAY_PORT || 3100);
const token = process.env.REMOTE_BROWSER_GATEWAY_TOKEN?.trim();
const loopbackHosts = new Set(["127.0.0.1", "::1", "localhost"]);

if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("REMOTE_BROWSER_GATEWAY_PORT 값이 올바르지 않습니다.");
if (!loopbackHosts.has(host) && !token) throw new Error("외부 주소에 게이트웨이를 열려면 REMOTE_BROWSER_GATEWAY_TOKEN이 필요합니다.");

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function isAuthorized(request: IncomingMessage) {
  if (!token) return loopbackHosts.has(host);
  const authorization = request.headers.authorization;
  return typeof authorization === "string" && authorization.startsWith("Bearer ") && constantTimeEqual(authorization.slice(7), token);
}

function setSecurityHeaders(response: ServerResponse) {
  response.setHeader("x-content-type-options", "nosniff");
  response.setHeader("cache-control", "no-store");
  response.setHeader("referrer-policy", "no-referrer");
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  setSecurityHeaders(response);
  response.statusCode = status;
  response.setHeader("content-type", "application/json; charset=utf-8");
  response.end(JSON.stringify(payload));
}

async function readJson(request: IncomingMessage) {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > 64 * 1024) throw new RemoteBrowserProviderError("요청 본문이 너무 큽니다.", 413);
    chunks.push(buffer);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new RemoteBrowserProviderError("요청 형식이 올바르지 않습니다.", 400);
  }
}

function errorResponse(response: ServerResponse, error: unknown) {
  if (error instanceof RemoteBrowserProviderError) return sendJson(response, error.status, { error: error.message });
  if (error instanceof RemoteBrowserPolicyError) return sendJson(response, 400, { error: error.message });
  const message = process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "원격 브라우저 요청을 처리하지 못했습니다.";
  return sendJson(response, 500, { error: message });
}

function waitForWritable(response: ServerResponse) {
  return new Promise<void>((resolve) => {
    const finish = () => {
      response.off("drain", finish);
      response.off("close", finish);
      resolve();
    };
    response.once("drain", finish);
    response.once("close", finish);
  });
}

async function streamFrames(sessionId: string, response: ServerResponse) {
  const boundary = "remote-browser-frame";
  setSecurityHeaders(response);
  response.statusCode = 200;
  response.setHeader("content-type", `multipart/x-mixed-replace; boundary=${boundary}`);
  response.setHeader("connection", "keep-alive");
  response.setHeader("x-accel-buffering", "no");
  response.flushHeaders();

  let version = -1;
  try {
    while (!response.destroyed) {
      const frame = await waitForRemoteBrowserFrame(sessionId, version);
      version = frame.version;
      if (response.destroyed) break;
      const header = Buffer.from(`--${boundary}\r\nContent-Type: image/jpeg\r\nContent-Length: ${frame.data.length}\r\n\r\n`);
      const chunk = Buffer.concat([header, frame.data, Buffer.from("\r\n")]);
      if (!response.write(chunk)) await waitForWritable(response);
    }
  } catch {
    if (!response.destroyed) response.end();
  }
}

const server = createServer(async (request, response) => {
  try {
    if (!isAuthorized(request)) return sendJson(response, 401, { error: "게이트웨이 인증에 실패했습니다." });
    const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
    const segments = url.pathname.split("/").filter(Boolean);

    if (request.method === "GET" && url.pathname === "/health") return sendJson(response, 200, { ok: true });

    if (request.method === "POST" && url.pathname === "/sessions") {
      const parsed = createRemoteBrowserSessionSchema.safeParse(await readJson(request));
      if (!parsed.success) return sendJson(response, 400, { error: parsed.error.issues[0]?.message ?? "화면 크기를 확인해 주세요." });
      return sendJson(response, 201, await createRemoteBrowserSession(parsed.data.width, parsed.data.height));
    }

    if (segments[0] === "sessions" && segments[1]) {
      const sessionId = remoteBrowserSessionIdSchema.safeParse(segments[1]);
      if (!sessionId.success) return sendJson(response, 400, { error: sessionId.error.issues[0]?.message });
      if (request.method === "GET" && segments.length === 2) return sendJson(response, 200, await getRemoteBrowserState(sessionId.data));
      if (request.method === "DELETE" && segments.length === 2) {
        await closeRemoteBrowserSession(sessionId.data);
        setSecurityHeaders(response);
        response.statusCode = 204;
        return response.end();
      }
      if (request.method === "GET" && segments[2] === "frame" && segments.length === 3) {
        const frame = await captureRemoteBrowserFrame(sessionId.data);
        setSecurityHeaders(response);
        response.statusCode = 200;
        response.setHeader("content-type", "image/jpeg");
        return response.end(frame);
      }
      if (request.method === "GET" && segments[2] === "stream" && segments.length === 3) {
        await streamFrames(sessionId.data, response);
        return;
      }
      if (request.method === "POST" && segments[2] === "actions" && segments.length === 3) {
        const action = remoteBrowserActionSchema.safeParse(await readJson(request));
        if (!action.success) return sendJson(response, 400, { error: action.error.issues[0]?.message ?? "브라우저 입력을 확인해 주세요." });
        return sendJson(response, 200, await performRemoteBrowserAction(sessionId.data, action.data));
      }
    }

    return sendJson(response, 404, { error: "게이트웨이 경로를 찾을 수 없습니다." });
  } catch (error) {
    return errorResponse(response, error);
  }
});

function websocketFrame(payload: string | Buffer, opcode = 0x1) {
  const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload);
  if (data.length < 126) return Buffer.concat([Buffer.from([0x80 | opcode, data.length]), data]);
  if (data.length <= 0xffff) {
    const header = Buffer.allocUnsafe(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(data.length, 2);
    return Buffer.concat([header, data]);
  }
  const header = Buffer.alloc(10);
  header[0] = 0x80 | opcode;
  header[1] = 127;
  header.writeBigUInt64BE(BigInt(data.length), 2);
  return Buffer.concat([header, data]);
}

server.on("upgrade", (request, socket, head) => {
  socket.on("error", () => socket.destroy());
  if (!isAuthorized(request)) return socket.destroy();
  const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
  const controlMatch = url.pathname.match(/^\/api\/web-browser\/control\/([^/]+)$/);
  const framesMatch = url.pathname.match(/^\/api\/web-browser\/frames\/([^/]+)$/);
  const sessionId = remoteBrowserSessionIdSchema.safeParse(controlMatch?.[1] ?? framesMatch?.[1]);
  const websocketKey = request.headers["sec-websocket-key"];
  if (!sessionId.success || typeof websocketKey !== "string") {
    socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
    return socket.destroy();
  }
  try {
    getRemoteBrowserState(sessionId.data).catch(() => socket.destroy());
  } catch {
    return socket.destroy();
  }
  const accept = createHash("sha1").update(`${websocketKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64");
  socket.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${accept}\r\n\r\n`);

  if (framesMatch) {
    let version = -1;
    void (async () => {
      try {
        while (!socket.destroyed) {
          const frame = await waitForRemoteBrowserFrame(sessionId.data, version);
          version = frame.version;
          if (socket.destroyed) break;
          if (!socket.write(websocketFrame(frame.data, 0x2))) await new Promise<void>((resolve) => socket.once("drain", resolve));
        }
      } catch {
        socket.destroy();
      }
    })();
    socket.on("data", (chunk) => {
      if (chunk.length && (chunk[0] & 0x0f) === 0x8) socket.end(websocketFrame("", 0x8));
    });
    return;
  }

  let pending = head.length ? Buffer.from(head) : Buffer.alloc(0);
  let actionQueue = Promise.resolve();
  const processFrames = () => {
    while (pending.length >= 2) {
      const opcode = pending[0] & 0x0f;
      const masked = Boolean(pending[1] & 0x80);
      let length = pending[1] & 0x7f;
      let offset = 2;
      if (length === 126) {
        if (pending.length < 4) return;
        length = pending.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        socket.destroy();
        return;
      }
      const maskLength = masked ? 4 : 0;
      if (pending.length < offset + maskLength + length) return;
      const mask = masked ? pending.subarray(offset, offset + 4) : undefined;
      const payload = Buffer.from(pending.subarray(offset + maskLength, offset + maskLength + length));
      pending = pending.subarray(offset + maskLength + length);
      if (mask) for (let index = 0; index < payload.length; index += 1) payload[index] ^= mask[index % 4];
      if (opcode === 0x8) return socket.end(websocketFrame("", 0x8));
      if (opcode === 0x9) {
        socket.write(websocketFrame(payload.toString("utf8"), 0xA));
        continue;
      }
      if (opcode !== 0x1) continue;
      actionQueue = actionQueue.then(async () => {
        const action = remoteBrowserActionSchema.safeParse(JSON.parse(payload.toString("utf8")) as unknown);
        if (!action.success) throw new RemoteBrowserProviderError(action.error.issues[0]?.message ?? "브라우저 입력을 확인해 주세요.", 400);
        await performRemoteBrowserAction(sessionId.data, action.data, false);
      }).catch((error: unknown) => {
        if (!socket.destroyed) socket.write(websocketFrame(JSON.stringify({ error: error instanceof Error ? error.message : "입력 전달에 실패했습니다." })));
      });
    }
  };
  socket.on("data", (chunk) => {
    pending = Buffer.concat([pending, chunk]);
    processFrames();
  });
  processFrames();
});

server.listen(port, host, () => {
  process.stdout.write(`원격 브라우저 게이트웨이가 http://${host}:${port} 에서 실행 중입니다.\n`);
});

async function shutdown() {
  server.close();
  await closeAllRemoteBrowserSessions();
  process.exit(0);
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
