import { timingSafeEqual } from "node:crypto";
import { createServer, request as httpRequest } from "node:http";
import { connect } from "node:net";

const host = "127.0.0.1";
const port = Number(process.env.REMOTE_BROWSER_PREVIEW_PORT || 3200);
const upstreamPort = Number(process.env.REMOTE_BROWSER_PREVIEW_UPSTREAM_PORT || 3000);
const configuredToken = process.env.REMOTE_BROWSER_PREVIEW_TOKEN?.trim();
const cookieName = "hion_remote_browser_preview";

if (!configuredToken || configuredToken.length < 32) throw new Error("REMOTE_BROWSER_PREVIEW_TOKEN은 32자 이상의 무작위 값이어야 합니다.");
const token = configuredToken;

function secureEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function cookieToken(cookieHeader: string | undefined) {
  if (!cookieHeader) return "";
  for (const item of cookieHeader.split(";")) {
    const [name, ...value] = item.trim().split("=");
    if (name === cookieName) return decodeURIComponent(value.join("="));
  }
  return "";
}

function isAuthorized(cookieHeader: string | undefined) {
  const candidate = cookieToken(cookieHeader);
  return candidate ? secureEqual(candidate, token) : false;
}

function notFound(response: import("node:http").ServerResponse) {
  response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", "x-content-type-options": "nosniff" });
  response.end("요청한 페이지를 찾을 수 없습니다.");
}

const server = createServer((incoming, outgoing) => {
  const url = new URL(incoming.url || "/", `http://${incoming.headers.host || "preview.local"}`);
  const openPrefix = "/open/";
  if (incoming.method === "GET" && url.pathname.startsWith(openPrefix) && secureEqual(decodeURIComponent(url.pathname.slice(openPrefix.length)), token)) {
    outgoing.writeHead(302, {
      location: "/web-browser",
      "cache-control": "no-store",
      "set-cookie": `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=86400; Partitioned`,
    });
    outgoing.end();
    return;
  }

  const publicAsset = incoming.method === "GET" && (url.pathname.startsWith("/_next/static/") || url.pathname === "/favicon.svg");
  const protectedRoute = url.pathname === "/web-browser" || url.pathname.startsWith("/api/web-browser/") || url.pathname.startsWith("/_next/");
  if (!publicAsset && (!protectedRoute || !isAuthorized(incoming.headers.cookie))) {
    notFound(outgoing);
    return;
  }

  const headers = { ...incoming.headers };
  delete headers.connection;
  delete headers["content-length"];
  headers.host = `127.0.0.1:${upstreamPort}`;
  headers["x-forwarded-host"] = incoming.headers.host || "";
  headers["x-forwarded-proto"] = incoming.headers["x-forwarded-proto"] || "https";

  const upstream = httpRequest({ host: "127.0.0.1", port: upstreamPort, method: incoming.method, path: incoming.url, headers }, (response) => {
    const responseHeaders = { ...response.headers };
    delete responseHeaders.connection;
    outgoing.writeHead(response.statusCode || 502, responseHeaders);
    response.pipe(outgoing);
  });
  upstream.on("error", () => {
    if (!outgoing.headersSent) outgoing.writeHead(502, { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" });
    outgoing.end("미리보기 앱에 연결할 수 없습니다.");
  });
  incoming.pipe(upstream);
});

server.listen(port, host, () => {
  process.stdout.write(`보호된 원격 브라우저 미리보기 프록시가 http://${host}:${port} 에서 실행 중입니다.\n`);
});

server.on("upgrade", (incoming, socket, head) => {
  const url = new URL(incoming.url || "/", `http://${incoming.headers.host || "preview.local"}`);
  const isBrowserChannel = url.pathname.startsWith("/api/web-browser/control/") || url.pathname.startsWith("/api/web-browser/frames/");
  if ((!isBrowserChannel && url.pathname !== "/_next/webpack-hmr") || !isAuthorized(incoming.headers.cookie)) {
    socket.write("HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n");
    socket.destroy();
    return;
  }

  const targetPort = isBrowserChannel ? 3100 : upstreamPort;
  const upstream = connect(targetPort, "127.0.0.1", () => {
    const forwardedHeaders = { ...incoming.headers };
    forwardedHeaders.host = `127.0.0.1:${targetPort}`;
    forwardedHeaders["x-forwarded-host"] = incoming.headers.host || "";
    forwardedHeaders["x-forwarded-proto"] = incoming.headers["x-forwarded-proto"] || "https";
    const headerLines = Object.entries(forwardedHeaders).flatMap(([name, value]) => {
      if (value === undefined) return [];
      return Array.isArray(value) ? value.map((item) => `${name}: ${item}`) : [`${name}: ${value}`];
    });
    upstream.write(`${incoming.method || "GET"} ${incoming.url || "/"} HTTP/${incoming.httpVersion}\r\n${headerLines.join("\r\n")}\r\n\r\n`);
    if (head.length) upstream.write(head);
    socket.pipe(upstream).pipe(socket);
  });
  upstream.on("error", () => socket.destroy());
  socket.on("error", () => upstream.destroy());
});
