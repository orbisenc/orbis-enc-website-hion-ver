export type FeeRole = "ACCOUNTING_MANAGER" | "COMPLEX_ADMIN" | "APPROVER" | "AUDITOR" | "CONTENT_EDITOR" | "PLATFORM_ADMIN";
export type FeePermission = "VIEW" | "IMPORT" | "ADJUST" | "REPORT" | "SETTINGS" | "CONFIRM" | "CLOSE" | "REOPEN" | "AGENDA_COST" | "AUDIT";

const permissions: Record<FeeRole, readonly FeePermission[]> = {
  ACCOUNTING_MANAGER: ["VIEW", "IMPORT", "ADJUST", "REPORT"],
  COMPLEX_ADMIN: ["VIEW", "REPORT", "SETTINGS"],
  APPROVER: ["VIEW", "REPORT", "CONFIRM", "CLOSE", "REOPEN", "AUDIT"],
  AUDITOR: ["VIEW", "REPORT", "AUDIT"],
  CONTENT_EDITOR: ["AGENDA_COST"],
  PLATFORM_ADMIN: [],
};

export interface FeeAccessContext {
  tenantId: string;
  roles: readonly string[];
  supportGrantActive?: boolean;
}

export function hasFeePermission(context: FeeAccessContext, permission: FeePermission) {
  if (context.roles.includes("PLATFORM_ADMIN")) return Boolean(context.supportGrantActive && (["VIEW", "REPORT", "AUDIT"] as FeePermission[]).includes(permission));
  return context.roles.some((role) => role in permissions && permissions[role as FeeRole].includes(permission));
}

export function assertFeeAccess(context: FeeAccessContext, targetTenantId: string, permission: FeePermission) {
  if (context.tenantId !== targetTenantId) throw new Error("다른 단지의 관리비 정보에 접근할 수 없습니다.");
  if (!hasFeePermission(context, permission)) throw new Error("이 관리비 작업을 수행할 권한이 없습니다.");
}
