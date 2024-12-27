import { TestScheme, TestStep, TestUseCase } from '@/types/scheme';
import { TestplanData, TestPlanScheme } from '@/types/testplan';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TestPlan } from '@/types/testplan';

interface TestPlanObject {
    [id: string]: TestplanData;
}
interface TestingStore {
    testPlans: TestPlanObject;
    setTestPlans: (testPlans: TestPlanObject) => void;
    addTestPlan: (id: string, testPlan: TestplanData) => void;
    updateTestPlan: (id: string, plandata: TestPlan) => void;
    getTestPlan: (id: string) => TestplanData | undefined;
    resetPlanStatus: (id: string) => void;
}

export const useTestingStore = create<TestingStore>()(
    persist(
        (set, get) => ({
            testPlans: {},
            setTestPlans: (testPlans: TestPlanObject) => set({ testPlans }),
            addTestPlan: (id: string, testPlan: TestplanData) =>
                set((state: any) => ({ testPlans: { ...state.testPlans, [id]: testPlan } })),
            updateTestPlan: (id: string, plandata: TestPlan) =>
                set((state: any) => {
                    const currentPlan = state.testPlans[id];
                    if (!currentPlan) return state;

                    currentPlan.plan = plandata;
                    return { testPlans: { ...state.testPlans, [id]: currentPlan } };
                }),
            getTestPlan: (id: string) => get().testPlans[id] as TestplanData | undefined,
            resetPlanStatus: (id: string) =>
                set((state: any) => {
                    const currentPlan = state.testPlans[id];
                    if (!currentPlan) return state;

                    const plandata = currentPlan.plan;
                    plandata.status = 'unknown';
                    plandata.schemes.forEach((scheme: TestScheme) => {
                        scheme.usecases.forEach((usecase: TestUseCase) => {
                            usecase.steps.forEach((step: TestStep) => {
                                step.status = 'unknown';
                            });
                            usecase.status = 'unknown';
                        });
                        scheme.status = 'unknown';
                    });
                    return { testPlans: { ...state.testPlans, [id]: currentPlan } };
                }),
        }),
        {
            name: 'testing-store', // unique name for the store
            storage: createJSONStorage(() => sessionStorage), // (optional) by default the 'localStorage' is used
        }
    )
);