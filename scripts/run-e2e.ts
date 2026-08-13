import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const nextBin = resolve("node_modules", "next", "dist", "bin", "next");
const playwrightBin = resolve("node_modules", "@playwright", "test", "cli.js");
const server = spawn(process.execPath, [nextBin, "dev", "-H", "127.0.0.1"], {
  stdio: ["ignore", "pipe", "pipe"],
  env: { ...process.env, NODE_ENV: "development" },
});

let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += String(chunk); });
server.stderr.on("data", (chunk) => { serverLog += String(chunk); });

async function waitForServer() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`개발 서버가 종료되었습니다.\n${serverLog}`);
    try { const response = await fetch("http://127.0.0.1:3000"); if (response.ok) return; } catch {}
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 500));
  }
  throw new Error(`개발 서버 준비 시간이 초과되었습니다.\n${serverLog}`);
}

function stopTree(pid: number | undefined) {
  if (!pid) return;
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", timeout: 5_000 });
  else process.kill(pid, "SIGTERM");
}

function runPlaywright() {
  return new Promise<number>((resolvePromise) => {
    const resultPath = resolve(".playwright-result.json");
    rmSync(resultPath, { force: true });
    const runner = spawn(process.execPath, [playwrightBin, "test", ...process.argv.slice(2)], { stdio: ["ignore", "pipe", "pipe"], env: process.env });
    let settled = false;
    const consume = (chunk: Buffer, target: NodeJS.WriteStream) => {
      target.write(String(chunk));
    };
    runner.stdout.on("data", (chunk: Buffer) => consume(chunk, process.stdout));
    runner.stderr.on("data", (chunk: Buffer) => consume(chunk, process.stderr));
    const poll = setInterval(() => {
      if (!existsSync(resultPath) || settled) return;
      const result = JSON.parse(readFileSync(resultPath, "utf8")) as { status: string };
      settled = true; clearInterval(poll); stopTree(runner.pid); runner.stdout.destroy(); runner.stderr.destroy(); runner.unref(); resolvePromise(result.status === "passed" ? 0 : 1);
    }, 100);
    runner.on("exit", (code) => { if (!settled) { settled = true; clearInterval(poll); resolvePromise(code ?? 1); } });
  });
}

async function main() {
  try {
    await waitForServer();
    process.exitCode = await runPlaywright();
  } finally {
    stopTree(server.pid);
    server.stdout.destroy(); server.stderr.destroy(); server.unref();
  }
}

void main();
