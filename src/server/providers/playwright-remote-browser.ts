import { randomUUID } from "node:crypto";
import type { Browser, BrowserContext, CDPSession, Page } from "playwright";
import type { RemoteBrowserAction, RemoteBrowserState } from "@/lib/remote-browser/contracts";
import { assertPublicBrowserRequestUrl, normalizeRemoteBrowserUrl, RemoteBrowserPolicyError } from "@/server/services/remote-browser-url-policy";

export class RemoteBrowserProviderError extends Error {
  constructor(message: string, public readonly status = 500) {
    super(message);
    this.name = "RemoteBrowserProviderError";
  }
}

interface BrowserSession {
  id: string;
  context: BrowserContext;
  page: Page;
  width: number;
  height: number;
  createdAt: Date;
  lastAccessedAt: Date;
  queue: Promise<void>;
  cdp: CDPSession;
  frame?: Buffer;
  frameVersion: number;
  frameWaiters: Set<() => void>;
}

const sessions = new Map<string, BrowserSession>();
let browserPromise: Promise<Browser> | undefined;

function numberFromEnv(name: string, fallback: number) {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const maxSessions = () => numberFromEnv("REMOTE_BROWSER_MAX_SESSIONS", 6);
const idleTimeoutMs = () => numberFromEnv("REMOTE_BROWSER_IDLE_TIMEOUT_MS", 10 * 60_000);

async function launchBrowser() {
  const { chromium } = await import("playwright");
  const cdpUrl = process.env.REMOTE_BROWSER_CDP_URL?.trim();
  if (cdpUrl) return chromium.connectOverCDP(cdpUrl);
  const configuredChannel = process.env.REMOTE_BROWSER_CHANNEL?.trim();
  const options = {
    headless: true,
    channel: configuredChannel && configuredChannel !== "chromium" ? configuredChannel : undefined,
    args: ["--disable-dev-shm-usage", "--disable-background-networking", "--disable-blink-features=AutomationControlled", "--no-first-run"],
  };
  try {
    return await chromium.launch(options);
  } catch (error) {
    if (configuredChannel) throw error;
    return chromium.launch({ ...options, channel: "chrome" });
  }
}

async function getBrowser() {
  browserPromise ??= launchBrowser().catch((error) => {
    browserPromise = undefined;
    throw new RemoteBrowserProviderError(`원격 브라우저를 시작할 수 없습니다. Chromium 또는 Chrome 설치를 확인해 주세요. (${error instanceof Error ? error.message : "알 수 없는 오류"})`, 503);
  });
  return browserPromise;
}

function getSession(id: string) {
  const session = sessions.get(id);
  if (!session) throw new RemoteBrowserProviderError("브라우저 세션이 만료되었거나 존재하지 않습니다.", 404);
  session.lastAccessedAt = new Date();
  return session;
}

async function enqueue<T>(session: BrowserSession, operation: () => Promise<T>) {
  const result = session.queue.then(operation, operation);
  session.queue = result.then(() => undefined, () => undefined);
  return result;
}

async function configureContext(context: BrowserContext, sessionRef: { current?: BrowserSession }) {
  await context.route("**/*", async (route) => {
    try {
      await assertPublicBrowserRequestUrl(route.request().url());
      await route.continue();
    } catch {
      await route.abort("blockedbyclient");
    }
  });
  context.on("page", (page) => {
    page.on("dialog", (dialog) => void dialog.dismiss());
    page.on("download", (download) => void download.cancel());
    if (sessionRef.current) void activateSessionPage(sessionRef.current, page);
  });
}

function receiveScreencastFrames(session: BrowserSession, cdp: CDPSession) {
  cdp.on("Page.screencastFrame", (event: { data: string; sessionId: number }) => {
    if (session.cdp !== cdp) return;
    session.frame = Buffer.from(event.data, "base64");
    session.frameVersion += 1;
    for (const notify of session.frameWaiters) notify();
    session.frameWaiters.clear();
    void cdp.send("Page.screencastFrameAck", { sessionId: event.sessionId }).catch(() => undefined);
  });
}

async function startScreencast(session: BrowserSession, cdp: CDPSession) {
  receiveScreencastFrames(session, cdp);
  await cdp.send("Page.startScreencast", {
    format: "jpeg",
    quality: 88,
    maxWidth: session.width,
    maxHeight: session.height,
    everyNthFrame: 1,
  });
}

async function activateSessionPage(session: BrowserSession, page: Page) {
  if (session.page === page) return;
  const previousCdp = session.cdp;
  const nextCdp = await session.context.newCDPSession(page);
  session.page = page;
  session.cdp = nextCdp;
  session.frame = undefined;
  await startScreencast(session, nextCdp);
  await previousCdp.send("Page.stopScreencast").catch(() => undefined);
  await previousCdp.detach().catch(() => undefined);
}

export async function createRemoteBrowserSession(width: number, height: number) {
  if (sessions.size >= maxSessions()) {
    const staleSession = [...sessions.values()].sort((left, right) => left.lastAccessedAt.getTime() - right.lastAccessedAt.getTime())[0];
    if (staleSession && Date.now() - staleSession.lastAccessedAt.getTime() > 20_000) await closeRemoteBrowserSession(staleSession.id);
  }
  if (sessions.size >= maxSessions()) throw new RemoteBrowserProviderError("현재 사용 가능한 브라우저 세션이 없습니다. 잠시 후 다시 시도해 주세요.", 503);
  const browser = await getBrowser();
  const chromeVersion = browser.version().match(/\d+(?:\.\d+){0,3}/)?.[0] ?? "140.0.0.0";
  const context = await browser.newContext({
    viewport: { width, height },
    acceptDownloads: false,
    serviceWorkers: "block",
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${chromeVersion} Safari/537.36`,
    extraHTTPHeaders: { DNT: "1" },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { configurable: true, get: () => undefined });
  });
  const sessionRef: { current?: BrowserSession } = {};
  await configureContext(context, sessionRef);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  const now = new Date();
  const session: BrowserSession = {
    id: randomUUID(), context, page, width, height, createdAt: now, lastAccessedAt: now,
    queue: Promise.resolve(), cdp, frameVersion: 0, frameWaiters: new Set(),
  };
  sessionRef.current = session;
  sessions.set(session.id, session);
  await startScreencast(session, cdp);
  return remoteBrowserState(session);
}

async function remoteBrowserState(session: BrowserSession): Promise<RemoteBrowserState> {
  const page = session.page;
  return {
    id: session.id,
    url: page.url(),
    title: await page.title().catch(() => ""),
    canGoBack: await page.evaluate(() => history.length > 1).catch(() => false),
    canGoForward: false,
    createdAt: session.createdAt.toISOString(),
    lastAccessedAt: session.lastAccessedAt.toISOString(),
  };
}

export async function getRemoteBrowserState(id: string) {
  const session = getSession(id);
  return enqueue(session, () => remoteBrowserState(session));
}

export async function captureRemoteBrowserFrame(id: string) {
  const session = getSession(id);
  if (session.frame) return session.frame;
  return session.page.screenshot({ type: "jpeg", quality: 88, timeout: 8_000 });
}

export async function waitForRemoteBrowserFrame(id: string, afterVersion: number, timeoutMs = 5_000) {
  const session = getSession(id);
  if (session.frame && session.frameVersion > afterVersion) return { data: session.frame, version: session.frameVersion };
  await new Promise<void>((resolve) => {
    const notify = () => {
      clearTimeout(timer);
      resolve();
    };
    const timer = setTimeout(() => {
      session.frameWaiters.delete(notify);
      resolve();
    }, timeoutMs);
    session.frameWaiters.add(notify);
  });
  if (!session.frame) session.frame = await session.page.screenshot({ type: "jpeg", quality: 88, timeout: 8_000 });
  return { data: session.frame, version: session.frameVersion };
}

export async function performRemoteBrowserAction(id: string, action: RemoteBrowserAction, includeState = true) {
  const session = getSession(id);
  return enqueue(session, async () => {
    const page = session.page;
    try {
      switch (action.type) {
        case "navigate": {
          const url = normalizeRemoteBrowserUrl(action.url);
          await assertPublicBrowserRequestUrl(url.toString());
          await page.goto(url.toString(), { waitUntil: "commit", timeout: 15_000 });
          break;
        }
        case "back": await page.goBack({ waitUntil: "commit", timeout: 10_000 }); break;
        case "forward": await page.goForward({ waitUntil: "commit", timeout: 10_000 }); break;
        case "reload": await page.reload({ waitUntil: "commit", timeout: 10_000 }); break;
        case "pointer": {
          const x = Math.min(session.width - 1, action.x);
          const y = Math.min(session.height - 1, action.y);
          await page.mouse.move(x, y);
          if (action.phase === "down") await page.mouse.down({ button: action.button });
          if (action.phase === "up") await page.mouse.up({ button: action.button });
          break;
        }
        case "click":
          await page.mouse.click(Math.min(session.width - 1, action.x), Math.min(session.height - 1, action.y), { button: action.button });
          break;
        case "scroll":
          await page.mouse.move(Math.min(session.width - 1, action.x), Math.min(session.height - 1, action.y));
          await page.mouse.wheel(action.deltaX, action.deltaY);
          break;
        case "key": await page.keyboard.press(action.key); break;
        case "type": await page.keyboard.insertText(action.text); break;
        case "composition":
          if (action.phase === "update") {
            await session.cdp.send("Input.imeSetComposition", {
              text: action.text,
              selectionStart: action.text.length,
              selectionEnd: action.text.length,
            });
          } else {
            await session.cdp.send("Input.insertText", { text: action.text });
          }
          break;
      }
    } catch (error) {
      if (error instanceof RemoteBrowserPolicyError) throw error;
      throw new RemoteBrowserProviderError(`웹사이트 작업을 완료하지 못했습니다. ${error instanceof Error ? error.message : "다시 시도해 주세요."}`, 502);
    }
    return includeState ? remoteBrowserState(session) : null;
  });
}

export async function closeRemoteBrowserSession(id: string) {
  const session = sessions.get(id);
  if (!session) return;
  sessions.delete(id);
  for (const notify of session.frameWaiters) notify();
  session.frameWaiters.clear();
  await session.cdp.send("Page.stopScreencast").catch(() => undefined);
  await session.cdp.detach().catch(() => undefined);
  await session.context.close().catch(() => undefined);
}

export async function closeAllRemoteBrowserSessions() {
  await Promise.all([...sessions.keys()].map(closeRemoteBrowserSession));
  const browser = await browserPromise?.catch(() => undefined);
  browserPromise = undefined;
  await browser?.close().catch(() => undefined);
}

const cleanupTimer = setInterval(() => {
  const cutoff = Date.now() - idleTimeoutMs();
  for (const session of sessions.values()) if (session.lastAccessedAt.getTime() < cutoff) void closeRemoteBrowserSession(session.id);
}, 30_000);
cleanupTimer.unref();
