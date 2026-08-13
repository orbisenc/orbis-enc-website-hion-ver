import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function normalizeForEvidence(value: unknown): string {
  if (typeof value === "string") return value.normalize("NFC").replace(/\r\n/g, "\n").trim();
  if (Array.isArray(value)) return `[${value.map(normalizeForEvidence).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${normalizeForEvidence(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function sha256(value: unknown): string {
  return createHash("sha256").update(normalizeForEvidence(value)).digest("hex");
}

export function signValue(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value).digest("base64url");
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left); const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
