"use client";

import { initialInsights, initialWorkOrders } from "@/data/apartmentOperations";
import { transitionWorkOrder } from "@/server/services/facility-work-order-service";
import type { AIInsight, WorkOrder, WorkOrderEvidence, WorkOrderStatus } from "@/types/facility";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface FacilityAuditEntry {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId: string;
  previousValue: string;
  newValue: string;
  reason: string;
  occurredAt: string;
}

interface ApartmentOperationsState {
  workOrders: WorkOrder[];
  insights: AIInsight[];
  auditLog: FacilityAuditEntry[];
  transitionOrder(id: string, next: WorkOrderStatus, reason?: string): void;
  updateOrderExecution(id: string, input: { assignee?: string; vendor?: string; actualCostWon?: number; completionSummary?: string }): void;
  addEvidence(id: string, evidence: Omit<WorkOrderEvidence, "id" | "recordedAt">): void;
  setInsightStatus(id: string, status: AIInsight["status"]): void;
  resetDemo(): void;
}

const storage = createJSONStorage(() => ({
  getItem: (name: string) => typeof window === "undefined" ? null : localStorage.getItem(name),
  setItem: (name: string, value: string) => { if (typeof window !== "undefined") localStorage.setItem(name, value); },
  removeItem: (name: string) => { if (typeof window !== "undefined") localStorage.removeItem(name); },
}));

const now = () => new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date()).replace(/\. /g, ".").replace(". ", " ");
const newId = (prefix: string) => `${prefix}-${typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Date.now()}`;

export const useApartmentOperationsStore = create<ApartmentOperationsState>()(persist((set) => ({
  workOrders: structuredClone(initialWorkOrders),
  insights: structuredClone(initialInsights),
  auditLog: [],
  transitionOrder: (id, next, reason = "작업 상태 변경") => set((state) => {
    const current = state.workOrders.find((order) => order.id === id);
    if (!current) throw new Error("작업지시를 찾을 수 없습니다.");
    const changed = transitionWorkOrder(current, next, now());
    return {
      workOrders: state.workOrders.map((order) => order.id === id ? changed : order),
      auditLog: [{ id: newId("audit"), actor: "김관리", action: "작업지시 상태 변경", entityType: "WorkOrder", entityId: id, previousValue: current.status, newValue: next, reason, occurredAt: now() }, ...state.auditLog],
    };
  }),
  updateOrderExecution: (id, input) => set((state) => ({
    workOrders: state.workOrders.map((order) => order.id === id ? { ...order, ...input, updatedAt: now() } : order),
    auditLog: [{ id: newId("audit"), actor: "김관리", action: "작업지시 실행정보 변경", entityType: "WorkOrder", entityId: id, previousValue: "기존 실행정보", newValue: "담당·비용·완료요약 갱신", reason: "현장 작업 기록", occurredAt: now() }, ...state.auditLog],
  })),
  addEvidence: (id, evidence) => set((state) => ({
    workOrders: state.workOrders.map((order) => order.id === id ? { ...order, evidence: [...order.evidence, { ...evidence, id: newId("evidence"), recordedAt: now() }], updatedAt: now() } : order),
    auditLog: [{ id: newId("audit"), actor: "김관리", action: "작업 증빙 추가", entityType: "WorkOrder", entityId: id, previousValue: "", newValue: evidence.filename, reason: evidence.phase, occurredAt: now() }, ...state.auditLog],
  })),
  setInsightStatus: (id, status) => set((state) => ({ insights: state.insights.map((insight) => insight.id === id ? { ...insight, status } : insight) })),
  resetDemo: () => set({ workOrders: structuredClone(initialWorkOrders), insights: structuredClone(initialInsights), auditLog: [] }),
}), { name: "hion-apartment-operations-v1", version: 1, storage, skipHydration: true }));
