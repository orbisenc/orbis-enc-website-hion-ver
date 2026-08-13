import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export class RemoteBrowserPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RemoteBrowserPolicyError";
  }
}

function parseAllowedPorts() {
  const configured = process.env.REMOTE_BROWSER_ALLOWED_PORTS ?? "80,443";
  return new Set(configured.split(",").map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value > 0 && value <= 65535));
}

function isBlockedIpv4(address: string) {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true;
  const [a, b, c] = parts;
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0 && (c === 0 || c === 2)) ||
    (a === 192 && b === 88 && c === 99) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113);
}

export function isBlockedIpAddress(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  const version = isIP(normalized);
  if (version === 4) return isBlockedIpv4(normalized);
  if (version !== 6) return true;
  if (normalized === "::" || normalized === "::1" || normalized.startsWith("fc") || normalized.startsWith("fd") ||
    normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb") ||
    normalized.startsWith("2001:db8:")) return true;
  const mappedIpv4 = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];
  return mappedIpv4 ? isBlockedIpv4(mappedIpv4) : false;
}

export function normalizeRemoteBrowserUrl(input: string) {
  const trimmed = input.trim();
  const withProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  let url: URL;
  try {
    url = new URL(withProtocol);
  } catch {
    throw new RemoteBrowserPolicyError("올바른 웹 주소를 입력해 주세요.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new RemoteBrowserPolicyError("HTTP 또는 HTTPS 주소만 열 수 있습니다.");
  if (url.username || url.password) throw new RemoteBrowserPolicyError("사용자 정보가 포함된 주소는 열 수 없습니다.");
  assertSafeHostname(url.hostname);
  const port = Number(url.port || (url.protocol === "https:" ? 443 : 80));
  if (!parseAllowedPorts().has(port)) throw new RemoteBrowserPolicyError(`허용되지 않은 포트입니다: ${port}`);
  return url;
}

export function assertSafeHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  if (!normalized || normalized === "localhost" || normalized.endsWith(".localhost") || normalized.endsWith(".local") ||
    normalized.endsWith(".internal") || normalized.endsWith(".home") || normalized.endsWith(".lan")) {
    throw new RemoteBrowserPolicyError("내부 네트워크 주소는 열 수 없습니다.");
  }
  if (isIP(normalized) && isBlockedIpAddress(normalized)) throw new RemoteBrowserPolicyError("내부 또는 특수 목적 IP 주소는 열 수 없습니다.");
}

const dnsCache = new Map<string, { expiresAt: number; addresses: string[] }>();

async function resolvePublicAddresses(hostname: string) {
  if (isIP(hostname)) return [hostname];
  const cached = dnsCache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) return cached.addresses;
  let records: Array<{ address: string; family: number }>;
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new RemoteBrowserPolicyError("웹사이트 주소를 찾을 수 없습니다.");
  }
  const addresses = records.map((record) => record.address);
  if (!addresses.length || addresses.some(isBlockedIpAddress)) throw new RemoteBrowserPolicyError("내부 네트워크로 연결되는 주소는 열 수 없습니다.");
  dnsCache.set(hostname, { expiresAt: Date.now() + 60_000, addresses });
  return addresses;
}

export async function assertPublicBrowserRequestUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  if (["about:", "blob:", "data:"].includes(url.protocol)) return;
  if (!["http:", "https:", "ws:", "wss:"].includes(url.protocol)) throw new RemoteBrowserPolicyError("지원하지 않는 네트워크 요청입니다.");
  assertSafeHostname(url.hostname);
  const secure = url.protocol === "https:" || url.protocol === "wss:";
  const port = Number(url.port || (secure ? 443 : 80));
  if (!parseAllowedPorts().has(port)) throw new RemoteBrowserPolicyError("허용되지 않은 네트워크 포트입니다.");
  await resolvePublicAddresses(url.hostname.replace(/^\[|\]$/g, ""));
}
