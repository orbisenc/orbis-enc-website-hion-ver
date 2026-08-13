import { afterEach, describe, expect, it } from "vitest";
import { isBlockedIpAddress, normalizeRemoteBrowserUrl } from "@/server/services/remote-browser-url-policy";

const originalPorts = process.env.REMOTE_BROWSER_ALLOWED_PORTS;

afterEach(() => {
  if (originalPorts === undefined) delete process.env.REMOTE_BROWSER_ALLOWED_PORTS;
  else process.env.REMOTE_BROWSER_ALLOWED_PORTS = originalPorts;
});

describe("원격 브라우저 URL 정책", () => {
  it("프로토콜이 없는 공개 웹 주소에는 HTTPS를 적용한다", () => {
    expect(normalizeRemoteBrowserUrl("www.google.com/search?q=hion").toString()).toBe("https://www.google.com/search?q=hion");
  });

  it.each([
    "http://localhost",
    "http://127.0.0.1",
    "http://10.10.10.10",
    "http://172.16.0.1",
    "http://192.168.0.1",
    "http://169.254.169.254/latest/meta-data",
    "http://[::1]",
    "http://service.internal",
  ])("내부 네트워크 주소 %s 를 차단한다", (url) => {
    expect(() => normalizeRemoteBrowserUrl(url)).toThrow(/내부|특수/);
  });

  it("HTTP와 HTTPS 이외의 프로토콜을 차단한다", () => {
    expect(() => normalizeRemoteBrowserUrl("file:///etc/passwd")).toThrow("HTTP 또는 HTTPS");
  });

  it("주소에 포함된 사용자 정보를 차단한다", () => {
    expect(() => normalizeRemoteBrowserUrl("https://user:secret@example.com")).toThrow("사용자 정보");
  });

  it("기본값으로 80과 443 포트만 허용한다", () => {
    expect(normalizeRemoteBrowserUrl("https://example.com").port).toBe("");
    expect(() => normalizeRemoteBrowserUrl("https://example.com:8443")).toThrow("허용되지 않은 포트");
  });

  it("명시적으로 설정한 공개 웹 포트를 허용한다", () => {
    process.env.REMOTE_BROWSER_ALLOWED_PORTS = "80,443,8443";
    expect(normalizeRemoteBrowserUrl("https://example.com:8443").port).toBe("8443");
  });

  it("공개 IP와 사설 IP를 구분한다", () => {
    expect(isBlockedIpAddress("8.8.8.8")).toBe(false);
    expect(isBlockedIpAddress("192.0.43.8")).toBe(false);
    expect(isBlockedIpAddress("192.0.0.8")).toBe(true);
    expect(isBlockedIpAddress("100.64.0.1")).toBe(true);
    expect(isBlockedIpAddress("fc00::1")).toBe(true);
  });
});
