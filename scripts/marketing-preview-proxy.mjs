import http from "node:http";

const upstream = new URL(process.env.MARKETING_UPSTREAM ?? "http://127.0.0.1:8787");
const port = Number(process.env.MARKETING_PREVIEW_PORT ?? 8788);
const publicPages = new Set(["/", "/hion", "/solutions", "/industries/education", "/company", "/contact", "/privacy", "/robots.txt", "/sitemap.xml"]);
const publicPrefixes = ["/_next/", "/images/", "/favicon", "/orbis-"];

function isAllowed(method, pathname) {
  if ((method === "GET" || method === "HEAD") && (publicPages.has(pathname) || publicPrefixes.some((prefix) => pathname.startsWith(prefix)))) return true;
  return method === "POST" && pathname === "/api/inquiries";
}

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  if (!isAllowed(request.method ?? "GET", requestUrl.pathname)) {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex" });
    response.end("페이지를 찾을 수 없습니다.");
    return;
  }

  const headers = { ...request.headers, host: upstream.host };
  delete headers["x-forwarded-host"];
  const proxy = http.request({
    protocol: upstream.protocol,
    hostname: upstream.hostname,
    port: upstream.port,
    method: request.method,
    path: `${requestUrl.pathname}${requestUrl.search}`,
    headers,
  }, (upstreamResponse) => {
    response.writeHead(upstreamResponse.statusCode ?? 502, upstreamResponse.headers);
    upstreamResponse.pipe(response);
  });
  proxy.on("error", () => {
    if (!response.headersSent) response.writeHead(502, { "content-type": "text/plain; charset=utf-8" });
    response.end("웹사이트 서버에 연결할 수 없습니다.");
  });
  request.pipe(proxy);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Marketing preview proxy: http://127.0.0.1:${port}`);
});
