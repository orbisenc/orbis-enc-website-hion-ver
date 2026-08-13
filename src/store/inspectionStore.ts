"use client";

import { mockDashboardData } from "@/data/mockDashboard";
import { canTransitionInspection, inspectionDraftSchema, toDisplayDate, type InspectionDraft } from "@/lib/validation/inspection";
import type { Inspection, InspectionStatus } from "@/types/facility";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const browserStorage = createJSONStorage(() => ({
  getItem: (name: string) => typeof window === "undefined" ? null : window.localStorage.getItem(name),
  setItem: (name: string, value: string) => { if (typeof window !== "undefined") window.localStorage.setItem(name, value); },
  removeItem: (name: string) => { if (typeof window !== "undefined") window.localStorage.removeItem(name); },
}));

interface InspectionState {
  inspections: Inspection[];
  createInspection(draft: InspectionDraft): string;
  updateInspection(id: string, draft: InspectionDraft): void;
  transitionInspection(id: string, status: InspectionStatus, result?: string): void;
  deleteInspection(id: string): void;
  resetInspections(): void;
}

function timestamp() {
  const parts = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}.${value("month")}.${value("day")} ${value("hour")}:${value("minute")}`;
}

function newId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto ? `inspection-${crypto.randomUUID()}` : `inspection-${Date.now()}`;
}

export const useInspectionStore = create<InspectionState>()(persist((set) => ({
  inspections: structuredClone(mockDashboardData.inspections),
  createInspection: (input) => {
    const draft = inspectionDraftSchema.parse(input);
    const id = newId();
    const now = timestamp();
    set((state) => ({
      inspections: [...state.inspections, {
        ...draft,
        id,
        scheduledAt: toDisplayDate(draft.scheduledAt),
        status: "예정" as const,
        memo: draft.memo || undefined,
        createdAt: now,
        updatedAt: now,
      }].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    }));
    return id;
  },
  updateInspection: (id, input) => {
    const draft = inspectionDraftSchema.parse(input);
    set((state) => ({
      inspections: state.inspections.map((item) => item.id === id ? {
        ...item,
        ...draft,
        scheduledAt: toDisplayDate(draft.scheduledAt),
        memo: draft.memo || undefined,
        updatedAt: timestamp(),
      } : item).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt)),
    }));
  },
  transitionInspection: (id, status, result) => set((state) => ({
    inspections: state.inspections.map((item) => {
      if (item.id !== id) return item;
      if (!canTransitionInspection(item.status, status)) throw new Error(`${item.status} 상태에서 ${status} 상태로 변경할 수 없습니다.`);
      if (status === "완료" && !result?.trim()) throw new Error("완료 결과를 입력해 주세요.");
      return {
        ...item,
        status,
        result: status === "완료" ? result?.trim() : item.result,
        completedAt: status === "완료" ? timestamp() : item.completedAt,
        updatedAt: timestamp(),
      };
    }),
  })),
  deleteInspection: (id) => set((state) => ({ inspections: state.inspections.filter((item) => item.id !== id) })),
  resetInspections: () => set({ inspections: structuredClone(mockDashboardData.inspections) }),
}), {
  name: "hion-facility-inspections-v1",
  version: 1,
  storage: browserStorage,
  partialize: (state) => ({ inspections: state.inspections }),
  skipHydration: true,
}));

export function useHydrateInspectionStore() {
  const [hydrated, setHydrated] = useState(() => useInspectionStore.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useInspectionStore.persist.onFinishHydration(() => setHydrated(true));
    const rehydration = useInspectionStore.persist.rehydrate();
    if (rehydration instanceof Promise) void rehydration.then(() => setHydrated(true));
    else queueMicrotask(() => setHydrated(true));
    return unsubscribe;
  }, []);
  return hydrated;
}
