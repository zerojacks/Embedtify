import { create } from "zustand";
import { TestPlanScheme } from "@/types/testplan";

interface SchemePlanStore {
    isView: boolean;
    setIsView: (isView: boolean) => void;
    schemePlan: TestPlanScheme[];
    setSchemePlan: (schemePlan: TestPlanScheme[]) => void;
    addSchemePlan: (schemePlan: TestPlanScheme) => void;
    deleteSchemePlan: (id: string) => void;
}

export const useSchemePlanStore = create<SchemePlanStore>((set) => ({
    isView: false,
    setIsView: (isView) => set({ isView }),
    schemePlan: [],
    setSchemePlan: (schemePlan) => set({ schemePlan }),
    addSchemePlan: (schemePlan) => set((state) => ({ schemePlan: [...state.schemePlan, schemePlan] })),
    deleteSchemePlan: (id) => set((state) => ({ schemePlan: state.schemePlan.filter((plan) => plan.id !== id) })),
}));