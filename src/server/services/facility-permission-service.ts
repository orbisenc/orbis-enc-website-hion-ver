import type { FacilityRole, WorkOrder } from "@/types/facility";

export type FacilityAction = "자산조회" | "자산편집" | "점검수행" | "작업지시편집" | "예산승인" | "공개정보조회";

const roleActions: Record<FacilityRole, FacilityAction[]> = {
  "플랫폼 관리자": ["자산조회", "자산편집", "점검수행", "작업지시편집", "예산승인", "공개정보조회"],
  "관리사무소 책임자": ["자산조회", "자산편집", "점검수행", "작업지시편집", "예산승인", "공개정보조회"],
  "시설 담당자": ["자산조회", "자산편집", "점검수행", "작업지시편집", "공개정보조회"],
  "입주자대표회의": ["자산조회", "공개정보조회"],
  "협력업체": ["자산조회", "작업지시편집"],
  "입주민": ["공개정보조회"],
};

export function canFacilityAction(role: FacilityRole, action: FacilityAction) {
  return roleActions[role].includes(action);
}

export function scopeWorkOrdersForActor(orders: WorkOrder[], actor: { tenantId: string; role: FacilityRole; name: string }) {
  const tenantOrders = orders.filter((order) => order.tenantId === actor.tenantId);
  if (actor.role === "협력업체") return tenantOrders.filter((order) => order.vendor === actor.name);
  if (actor.role === "시설 담당자") return tenantOrders.filter((order) => order.assignee === actor.name || !order.assignee);
  if (actor.role === "입주자대표회의" || actor.role === "입주민") return [];
  return tenantOrders;
}
