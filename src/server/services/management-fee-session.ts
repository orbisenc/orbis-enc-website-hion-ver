import { readAdminSession } from "@/server/auth/session";
import type { FeeAccessContext } from "./management-fee-auth";

export async function readFeeAccessContext(): Promise<FeeAccessContext | null> {
  const session = await readAdminSession();
  if (!session) return null;
  return { tenantId: session.tenantId, roles: session.roles };
}
