import type { WorkOrder, WorkOrderStatus } from "@/types/facility";

export const workOrderTransitions: Record<WorkOrderStatus, WorkOrderStatus[]> = {
  "접수": ["분류", "취소"],
  "분류": ["승인대기", "배정", "보류", "취소"],
  "승인대기": ["배정", "보류", "취소"],
  "배정": ["진행", "보류", "취소"],
  "진행": ["검수요청", "보류"],
  "검수요청": ["완료", "진행"],
  "완료": ["종료"],
  "종료": [],
  "보류": ["분류", "배정", "진행", "취소"],
  "취소": [],
};

export function canTransitionWorkOrder(current: WorkOrderStatus, next: WorkOrderStatus) {
  return workOrderTransitions[current].includes(next);
}

export function validateWorkOrderTransition(order: WorkOrder, next: WorkOrderStatus) {
  if (!canTransitionWorkOrder(order.status, next)) throw new Error(`${order.status} 상태에서 ${next} 상태로 변경할 수 없습니다.`);
  if (next === "진행" && !order.assignee.trim() && !order.vendor?.trim()) throw new Error("담당자 또는 협력업체를 먼저 배정해 주세요.");
  if (next === "검수요청" && order.evidence.length === 0) throw new Error("검수 요청 전 작업 증빙을 한 건 이상 등록해 주세요.");
  if (next === "완료") {
    if (!order.completionSummary?.trim()) throw new Error("완료 요약을 입력해 주세요.");
    if (!order.evidence.some((item) => item.phase === "작업 후")) throw new Error("완료 처리에는 작업 후 증빙이 필요합니다.");
  }
}

export function transitionWorkOrder(order: WorkOrder, next: WorkOrderStatus, now = "2026.07.21 15:30"): WorkOrder {
  validateWorkOrderTransition(order, next);
  return { ...order, status: next, updatedAt: now };
}
