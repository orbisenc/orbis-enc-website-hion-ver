import { cookies } from "next/headers";
import { safeEqual, signValue } from "@/lib/security/hash";
import type { FacilityRole } from "@/types/facility";

const COOKIE_NAME = "hion_admin_session";
const FACILITY_COOKIE_NAME = "hion_facility_session";
const developmentSecret = "개발에서만-사용하는-HION-세션-비밀";
function secret() {
  if (process.env.NODE_ENV === "production" && !process.env.SESSION_SECRET) throw new Error("운영 세션 비밀이 설정되지 않았습니다.");
  return process.env.SESSION_SECRET ?? developmentSecret;
}
export async function createAdminSession() {
  const payload = Buffer.from(JSON.stringify({ tenantId: "hion-demo", role: "COMPLEX_ADMIN", roles: ["COMPLEX_ADMIN", "ACCOUNTING_MANAGER", "APPROVER", "CONTENT_EDITOR"], exp: Date.now() + 8 * 60 * 60_000 })).toString("base64url");
  const token = `${payload}.${signValue(payload, secret())}`;
  const embeddedPublicDemo = process.env.NODE_ENV === "production" && process.env.ENABLE_PUBLIC_DEMO === "true";
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: embeddedPublicDemo ? "none" : "lax", path: "/", maxAge: 8 * 60 * 60 });
}
export async function readAdminSession() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signValue(payload, secret()), signature)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as { tenantId: string; role: string; roles?: string[]; exp: number };
    return data.exp > Date.now() ? { ...data, roles: data.roles ?? [data.role] } : null;
  } catch { return null; }
}
export async function clearAdminSession() { (await cookies()).delete(COOKIE_NAME); }

export interface FacilitySession { tenantId: string; complexId: string; userId: string; name: string; role: FacilityRole; exp: number }

export async function createFacilitySession(input: Omit<FacilitySession, "tenantId" | "complexId" | "exp">) {
  const payloadData: FacilitySession = { ...input, tenantId: "hion-demo", complexId: "hsp01", exp: Date.now() + 8 * 60 * 60_000 };
  const payload = Buffer.from(JSON.stringify(payloadData)).toString("base64url");
  const token = `${payload}.${signValue(payload, secret())}`;
  (await cookies()).set(FACILITY_COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 8 * 60 * 60 });
}

export async function readFacilitySession(): Promise<FacilitySession | null> {
  const token = (await cookies()).get(FACILITY_COOKIE_NAME)?.value;
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(signValue(payload, secret()), signature)) return null;
  try { const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as FacilitySession; return data.exp > Date.now() && data.tenantId === "hion-demo" && data.complexId === "hsp01" ? data : null; } catch { return null; }
}

export async function clearFacilitySession() { (await cookies()).delete(FACILITY_COOKIE_NAME); }
