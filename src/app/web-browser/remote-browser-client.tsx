"use client";
/* eslint-disable @next/next/no-img-element -- 실시간 MJPEG 스트림은 Next 이미지 최적화 대상이 아닙니다. */

import { useCallback, useEffect, useRef, useState, type FormEvent, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent, type WheelEvent } from "react";
import type { RemoteBrowserAction, RemoteBrowserState } from "@/lib/remote-browser/contracts";
import styles from "./remote-browser.module.css";

const STATE_INTERVAL_MS = 600;
const MAX_VIEWPORT_WIDTH = 1440;
const MAX_VIEWPORT_HEIGHT = 900;
const QUICK_SITES = [
  { label: "Google", url: "https://www.google.com" },
  { label: "네이버", url: "https://www.naver.com" },
  { label: "Wikipedia", url: "https://www.wikipedia.org" },
  { label: "GitHub", url: "https://github.com" },
  { label: "다음", url: "https://www.daum.net" },
];

type ConnectionState = "connecting" | "ready" | "error";

async function readError(response: Response) {
  const data = await response.json().catch(() => null) as { error?: unknown } | null;
  return typeof data?.error === "string" ? data.error : "요청을 처리하지 못했습니다.";
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = 20_000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw new Error("서버 응답 시간이 초과되었습니다. 다시 시도해 주세요.");
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

export function RemoteBrowserClient() {
  const [session, setSession] = useState<RemoteBrowserState | null>(null);
  const [connection, setConnection] = useState<ConnectionState>("connecting");
  const [address, setAddress] = useState("");
  const [frameReady, setFrameReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const sessionIdRef = useRef<string | null>(null);
  const controlSocketRef = useRef<WebSocket | null>(null);
  const frameSocketRef = useRef<WebSocket | null>(null);
  const frameObjectUrlRef = useRef<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportSizeRef = useRef({ width: MAX_VIEWPORT_WIDTH, height: MAX_VIEWPORT_HEIGHT });
  const keyboardRef = useRef<HTMLTextAreaElement>(null);
  const pointerDownRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number; button: "left" | "middle" | "right" } | null>(null);
  const dragStartedRef = useRef(false);
  const suppressClickRef = useRef(false);
  const composingRef = useRef(false);
  const ignoreCommittedInputRef = useRef("");
  const pendingTextRef = useRef("");
  const textFlushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moveSentAtRef = useRef(0);
  const actionQueueRef = useRef<Promise<RemoteBrowserState | null>>(Promise.resolve(null));

  const sendAction = useCallback((action: RemoteBrowserAction, showBusy = false) => {
    const realtimeInput = action.type === "pointer" || action.type === "click" || action.type === "scroll" || action.type === "key" || action.type === "type" || action.type === "composition";
    const controlSocket = controlSocketRef.current;
    if (realtimeInput && controlSocket?.readyState === WebSocket.OPEN) {
      controlSocket.send(JSON.stringify(action));
      return Promise.resolve(null);
    }
    const execute = async () => {
      const id = sessionIdRef.current;
      if (!id) return null;
      if (showBusy) setBusy(true);
      try {
        const response = await fetchWithTimeout(`/api/web-browser/sessions/${id}/actions`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(action),
        }, 35_000);
        if (!response.ok) throw new Error(await readError(response));
        const state = await response.json() as RemoteBrowserState;
        setSession(state);
        if (state.url !== "about:blank") setAddress(state.url);
        setError("");
        return state;
      } catch (actionError) {
        setError(actionError instanceof Error ? actionError.message : "브라우저 입력을 전달하지 못했습니다.");
        return null;
      } finally {
        if (showBusy) setBusy(false);
      }
    };
    const queued = actionQueueRef.current.then(execute, execute);
    actionQueueRef.current = queued;
    return queued;
  }, []);

  const flushKeyboardText = useCallback(() => {
    if (textFlushTimerRef.current) clearTimeout(textFlushTimerRef.current);
    textFlushTimerRef.current = null;
    const text = pendingTextRef.current;
    pendingTextRef.current = "";
    for (let offset = 0; offset < text.length; offset += 1000) {
      void sendAction({ type: "type", text: text.slice(offset, offset + 1000) });
    }
  }, [sendAction]);

  const queueKeyboardText = (text: string) => {
    if (!text) return;
    if (controlSocketRef.current?.readyState === WebSocket.OPEN) {
      void sendAction({ type: "type", text });
      return;
    }
    pendingTextRef.current += text;
    if (textFlushTimerRef.current) clearTimeout(textFlushTimerRef.current);
    textFlushTimerRef.current = setTimeout(flushKeyboardText, 55);
  };

  useEffect(() => {
    let cancelled = false;

    async function createSession() {
      try {
        const viewportRect = viewportRef.current?.getBoundingClientRect();
        const availableWidth = Math.max(720, viewportRect?.width ?? MAX_VIEWPORT_WIDTH);
        const availableHeight = Math.max(480, viewportRect?.height ?? MAX_VIEWPORT_HEIGHT);
        const viewportScale = Math.min(1, MAX_VIEWPORT_WIDTH / availableWidth, MAX_VIEWPORT_HEIGHT / availableHeight);
        const remoteViewport = {
          width: Math.round(availableWidth * viewportScale),
          height: Math.round(availableHeight * viewportScale),
        };
        viewportSizeRef.current = remoteViewport;
        const response = await fetchWithTimeout("/api/web-browser/sessions", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(remoteViewport),
        });
        if (!response.ok) throw new Error(await readError(response));
        const state = await response.json() as RemoteBrowserState;
        if (cancelled) {
          void fetch(`/api/web-browser/sessions/${state.id}`, { method: "DELETE", keepalive: true });
          return;
        }
        sessionIdRef.current = state.id;
        const websocketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const controlSocket = new WebSocket(`${websocketProtocol}//${window.location.host}/api/web-browser/control/${state.id}`);
        controlSocket.onmessage = (event) => {
          try {
            const payload = JSON.parse(String(event.data)) as { error?: unknown };
            if (typeof payload.error === "string") setError(payload.error);
          } catch {
            // 제어 채널의 알 수 없는 메시지는 무시합니다.
          }
        };
        controlSocketRef.current = controlSocket;
        const frameSocket = new WebSocket(`${websocketProtocol}//${window.location.host}/api/web-browser/frames/${state.id}`);
        frameSocket.binaryType = "blob";
        frameSocket.onmessage = (event) => {
          if (cancelled || !(event.data instanceof Blob) || !imageRef.current) return;
          const nextUrl = URL.createObjectURL(event.data);
          const previousUrl = frameObjectUrlRef.current;
          frameObjectUrlRef.current = nextUrl;
          imageRef.current.onload = () => {
            setFrameReady(true);
          };
          imageRef.current.src = nextUrl;
          if (previousUrl) window.setTimeout(() => URL.revokeObjectURL(previousUrl), 0);
        };
        const useHttpStreamFallback = () => {
          if (cancelled || frameSocketRef.current !== frameSocket || !imageRef.current) return;
          imageRef.current.src = `/api/web-browser/sessions/${state.id}/stream`;
          setFrameReady(true);
        };
        frameSocket.onerror = useHttpStreamFallback;
        frameSocket.onclose = useHttpStreamFallback;
        frameSocketRef.current = frameSocket;
        setSession(state);
        setConnection("ready");
        const initialUrl = new URLSearchParams(window.location.search).get("url");
        if (initialUrl) {
          setAddress(initialUrl);
          await sendAction({ type: "navigate", url: initialUrl }, true);
        }
      } catch (sessionError) {
        if (!cancelled) {
          setConnection("error");
          setError(sessionError instanceof Error ? sessionError.message : "브라우저 세션을 만들지 못했습니다.");
        }
      }
    }

    void createSession();
    return () => {
      cancelled = true;
      const id = sessionIdRef.current;
      sessionIdRef.current = null;
      controlSocketRef.current?.close();
      controlSocketRef.current = null;
      frameSocketRef.current?.close();
      frameSocketRef.current = null;
      if (frameObjectUrlRef.current) URL.revokeObjectURL(frameObjectUrlRef.current);
      frameObjectUrlRef.current = null;
      if (id) void fetch(`/api/web-browser/sessions/${id}`, { method: "DELETE", keepalive: true });
      if (textFlushTimerRef.current) clearTimeout(textFlushTimerRef.current);
      pendingTextRef.current = "";
    };
  }, [flushKeyboardText, retryKey, sendAction]);

  useEffect(() => {
    const releaseSession = (event: PageTransitionEvent) => {
      if (event.persisted) return;
      const id = sessionIdRef.current;
      if (id) void fetch(`/api/web-browser/sessions/${id}`, { method: "DELETE", keepalive: true });
    };
    window.addEventListener("pagehide", releaseSession);
    return () => window.removeEventListener("pagehide", releaseSession);
  }, []);

  useEffect(() => {
    if (!session?.id) return;
    let stopped = false;
    let stateTimer: ReturnType<typeof setTimeout> | undefined;

    async function refreshState() {
      if (stopped || !sessionIdRef.current) return;
      try {
        const response = await fetchWithTimeout(`/api/web-browser/sessions/${sessionIdRef.current}`, { cache: "no-store" }, 12_000);
        if (response.ok) {
          const state = await response.json() as RemoteBrowserState;
          setSession(state);
          if (document.activeElement?.getAttribute("data-address-input") !== "true" && state.url !== "about:blank") setAddress(state.url);
        }
      } finally {
        if (!stopped) stateTimer = setTimeout(refreshState, STATE_INTERVAL_MS);
      }
    }

    void refreshState();
    return () => {
      stopped = true;
      if (stateTimer) clearTimeout(stateTimer);
    };
  }, [session?.id]);

  const navigateTo = async (url: string) => {
    const nextAddress = url.trim();
    if (!nextAddress) return;
    setAddress(nextAddress);
    await sendAction({ type: "navigate", url: nextAddress }, true);
  };

  const navigate = async (event: FormEvent) => {
    event.preventDefault();
    await navigateTo(address);
  };

  const coordinates = (event: { clientX: number; clientY: number }) => {
    const image = imageRef.current;
    if (!image) return null;
    const rect = image.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const { width: viewportWidth, height: viewportHeight } = viewportSizeRef.current;
    const sourceAspect = viewportWidth / viewportHeight;
    const targetAspect = rect.width / rect.height;
    const contentWidth = targetAspect > sourceAspect ? rect.height * sourceAspect : rect.width;
    const contentHeight = targetAspect > sourceAspect ? rect.height : rect.width / sourceAspect;
    const contentLeft = rect.left + (rect.width - contentWidth) / 2;
    const contentTop = rect.top + (rect.height - contentHeight) / 2;
    if (event.clientX < contentLeft || event.clientX > contentLeft + contentWidth || event.clientY < contentTop || event.clientY > contentTop + contentHeight) return null;
    return {
      x: Math.max(0, Math.min(viewportWidth - 1, ((event.clientX - contentLeft) / contentWidth) * viewportWidth)),
      y: Math.max(0, Math.min(viewportHeight - 1, ((event.clientY - contentTop) / contentHeight) * viewportHeight)),
    };
  };

  const handlePointer = (phase: "down" | "move" | "up", event: ReactPointerEvent<HTMLImageElement>) => {
    const point = coordinates(event);
    if (!point) return;
    const eventButton = event.button === 1 ? "middle" : event.button === 2 ? "right" : "left";
    if (phase === "down") {
      pointerDownRef.current = true;
      pointerStartRef.current = { ...point, button: eventButton };
      dragStartedRef.current = false;
      event.currentTarget.setPointerCapture(event.pointerId);
      keyboardRef.current?.focus({ preventScroll: true });
      return;
    }
    if (phase === "move" && Date.now() - moveSentAtRef.current < 16) return;
    if (phase === "move" && !pointerDownRef.current) {
      moveSentAtRef.current = Date.now();
      void sendAction({ type: "pointer", phase: "move", ...point, button: "left" });
      return;
    }
    const start = pointerStartRef.current;
    if (!start) return;
    if (phase === "move") {
      moveSentAtRef.current = Date.now();
      const moved = Math.hypot(point.x - start.x, point.y - start.y) > 5;
      if (!dragStartedRef.current && moved) {
        dragStartedRef.current = true;
        void sendAction({ type: "pointer", phase: "down", x: start.x, y: start.y, button: start.button });
      }
      if (dragStartedRef.current) void sendAction({ type: "pointer", phase: "move", ...point, button: start.button });
      return;
    }
    pointerDownRef.current = false;
    pointerStartRef.current = null;
    if (dragStartedRef.current) {
      suppressClickRef.current = true;
      void sendAction({ type: "pointer", phase: "up", ...point, button: start.button });
    }
    dragStartedRef.current = false;
  };

  const handleClick = (event: ReactMouseEvent<HTMLImageElement>) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    const point = coordinates(event);
    if (!point) return;
    const button = event.button === 1 ? "middle" : event.button === 2 ? "right" : "left";
    flushKeyboardText();
    void sendAction({ type: "click", ...point, button });
    keyboardRef.current?.focus({ preventScroll: true });
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLImageElement>) => {
    const point = coordinates(event);
    const start = pointerStartRef.current;
    if (dragStartedRef.current && point && start) void sendAction({ type: "pointer", phase: "up", ...point, button: start.button });
    pointerDownRef.current = false;
    pointerStartRef.current = null;
    dragStartedRef.current = false;
  };

  const handleWheel = (event: WheelEvent<HTMLImageElement>) => {
    event.preventDefault();
    const point = coordinates(event);
    if (point) void sendAction({ type: "scroll", ...point, deltaX: event.deltaX, deltaY: event.deltaY });
  };

  const forwardKeyboardText = (event: FormEvent<HTMLTextAreaElement>) => {
    if (composingRef.current) return;
    const text = event.currentTarget.value;
    if (!text) return;
    event.currentTarget.value = "";
    if (ignoreCommittedInputRef.current === text) {
      ignoreCommittedInputRef.current = "";
      return;
    }
    ignoreCommittedInputRef.current = "";
    queueKeyboardText(text);
  };

  const supportedKeys = new Set(["Backspace", "Delete", "Enter", "Escape", "Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End", "PageUp", "PageDown"]);
  const connectionLabel = connection === "ready" ? "연결됨" : connection === "error" ? "연결 실패" : "연결 중";
  const retryConnection = () => {
    setConnection("connecting");
    setError("");
    setSession(null);
    setFrameReady(false);
    setBusy(false);
    setRetryKey((value) => value + 1);
  };

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>H</span>
          <div><strong>격리 웹 브라우저</strong><small>외부 웹을 안전한 원격 세션에서 실행합니다</small></div>
        </div>
        <span className={`${styles.connection} ${styles[connection]}`}>{connectionLabel}</span>
      </header>

      <section className={styles.browser} aria-label="원격 웹 브라우저">
        <div className={styles.toolbar}>
          <div className={styles.navigationButtons}>
            <button type="button" aria-label="뒤로" title="뒤로" disabled={!session || busy} onClick={() => void sendAction({ type: "back" }, true)}>←</button>
            <button type="button" aria-label="앞으로" title="앞으로" disabled={!session || busy} onClick={() => void sendAction({ type: "forward" }, true)}>→</button>
            <button type="button" aria-label="새로고침" title="새로고침" disabled={!session || busy} onClick={() => void sendAction({ type: "reload" }, true)}>↻</button>
          </div>
          <form className={styles.addressForm} onSubmit={navigate}>
            <span aria-hidden="true" className={styles.securityDot} />
            <label className="sr-only" htmlFor="remote-address">웹 주소</label>
            <input id="remote-address" data-address-input="true" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="웹 주소 또는 도메인 입력 · 예: google.com" autoComplete="off" spellCheck={false} disabled={!session} />
            <button type="submit" disabled={!session || busy || !address.trim()}>이동</button>
          </form>
        </div>

        {error && connection !== "error" && <div className={styles.errorBanner} role="alert"><span>{error}</span><button type="button" onClick={() => setError("")}>닫기</button></div>}

        <div ref={viewportRef} className={styles.viewport} aria-busy={busy || connection === "connecting"}>
          <img
            ref={imageRef}
            alt={session?.title ? `${session.title} 원격 화면` : "원격 웹사이트 화면"}
            draggable={false}
            onError={() => setError("원격 화면 스트림 연결이 끊어졌습니다. 다시 연결해 주세요.")}
            onPointerDown={(event) => handlePointer("down", event)}
            onPointerMove={(event) => handlePointer("move", event)}
            onPointerUp={(event) => handlePointer("up", event)}
            onPointerCancel={handlePointerCancel}
            onMouseDown={(event) => event.preventDefault()}
            onClick={handleClick}
            onWheel={handleWheel}
            onContextMenu={(event) => event.preventDefault()}
          />

          {connection === "connecting" && <div className={styles.connectionPanel}>
            <span className={styles.largeSpinner} />
            <strong>보안 브라우저를 시작하고 있습니다</strong>
            <p>격리된 세션과 화면 스트림을 연결하는 중입니다.</p>
          </div>}

          {connection === "error" && <div className={styles.connectionPanel} role="alert">
            <span className={styles.failureMark}>!</span>
            <strong>브라우저 연결에 실패했습니다</strong>
            <p>{error || "잠시 후 다시 시도해 주세요."}</p>
            <button type="button" className={styles.retryButton} onClick={retryConnection}>다시 연결</button>
          </div>}

          {connection === "ready" && !frameReady && <div className={styles.connectionPanel}>
            <span className={styles.largeSpinner} />
            <strong>첫 화면을 가져오고 있습니다</strong>
            <p>잠시만 기다려 주세요.</p>
          </div>}

          {session?.url === "about:blank" && frameReady && <div className={styles.emptyHint}>
            <span className={styles.emptyIcon}>⌕</span>
            <strong>어떤 웹사이트를 열까요?</strong>
            <p>위 주소창에 공개 웹 주소를 입력하거나 아래 바로가기를 선택하세요.</p>
            <div className={styles.quickLinks}>{QUICK_SITES.map((site) => <button type="button" key={site.url} onClick={() => void navigateTo(site.url)}>{site.label}</button>)}</div>
            <small className={styles.quickNote}>바로가기는 예시이며 목록에 없는 공개 HTTP/HTTPS 사이트도 열 수 있습니다.</small>
          </div>}

          {busy && session && <div className={styles.loading}><span />페이지를 여는 중</div>}

          <textarea
            ref={keyboardRef}
            className={styles.keyboardCapture}
            aria-label="원격 브라우저 키보드 입력"
            defaultValue=""
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            onInput={forwardKeyboardText}
            onCompositionStart={() => { composingRef.current = true; }}
            onCompositionUpdate={(event) => {
              if (event.data && controlSocketRef.current?.readyState === WebSocket.OPEN) {
                void sendAction({ type: "composition", phase: "update", text: event.data });
              }
            }}
            onCompositionEnd={(event) => {
              composingRef.current = false;
              const text = event.data || event.currentTarget.value;
              event.currentTarget.value = "";
              if (!text) return;
              if (controlSocketRef.current?.readyState === WebSocket.OPEN) {
                ignoreCommittedInputRef.current = text;
                void sendAction({ type: "composition", phase: "commit", text });
              } else {
                queueKeyboardText(text);
              }
            }}
            onPaste={(event) => { event.preventDefault(); event.currentTarget.value = ""; queueKeyboardText(event.clipboardData.getData("text")); }}
            onKeyDown={(event) => {
              if (event.nativeEvent.isComposing || composingRef.current) return;
              if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "a") { event.preventDefault(); flushKeyboardText(); void sendAction({ type: "key", key: "Control+A" }); return; }
              if (supportedKeys.has(event.key)) { event.preventDefault(); flushKeyboardText(); void sendAction({ type: "key", key: event.key as "Enter" }); }
            }}
          />
        </div>

        <footer className={styles.statusbar}>
          <span title={session?.url}>{session?.title || (session ? "새 탭" : connectionLabel)}</span>
          <span>공개 HTTP/HTTPS · 다운로드 차단 · 세션 자동 폐기</span>
        </footer>
      </section>
    </main>
  );
}
