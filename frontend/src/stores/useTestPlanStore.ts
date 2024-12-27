import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { TestScheme, TestUseCase, TestStep } from '@/types/scheme';
import { TestPlan } from '@/types/testplan';
import { produce } from 'immer';

interface TestPlanState {
    testPlans: Record<string, TestPlan>;
    updateTestStep: (stepData: TestStep) => void;
    addTestPlan: (testPlan: TestPlan) => void;
}

export const useTestPlanStore = create<TestPlanState>()(
    immer((set) => ({
        testPlans: {},

        addTestPlan: (testPlan) => {
            set((state) => {
                state.testPlans[testPlan.id] = testPlan;
            });
        },

        updateTestStep: (stepData) => {
            set((state) => {
                const plans = Object.values(state.testPlans);

                for (const plan of plans) {
                    const [schemeId, useCaseId, stepId] = stepData.id.split('-');
                    const schemeIndex = plan.schemes.findIndex(s => s.id === schemeId);

                    if (schemeIndex !== -1) {
                        const useCaseIndex = plan.schemes[schemeIndex].usecases.findIndex(
                            uc => uc.id === `${schemeId}-${useCaseId}`
                        );

                        if (useCaseIndex !== -1) {
                            const stepIndex = plan.schemes[schemeIndex].usecases[useCaseIndex].steps.findIndex(
                                step => step.id === stepData.id
                            );

                            if (stepIndex !== -1) {
                                // 直接更新单个步骤
                                const updatedPlan = produce(plan, draft => {
                                    const currentStep = draft.schemes[schemeIndex].usecases[useCaseIndex].steps[stepIndex];
                                    Object.assign(currentStep, stepData);

                                    // 实时更新用例和方案状态
                                    const useCase = draft.schemes[schemeIndex].usecases[useCaseIndex];
                                    const scheme = draft.schemes[schemeIndex];

                                    // 检查用例所有步骤状态
                                    const allStepsCompleted = useCase.steps.every(
                                        step => step.status === 'success' || step.status === 'failure'
                                    );

                                    useCase.status = allStepsCompleted
                                        ? (useCase.steps.some(step => step.status === 'failure') ? 'failure' : 'success')
                                        : 'progress';

                                    // 检查方案所有用例状态  
                                    const allUseCasesCompleted = scheme.usecases.every(
                                        uc => uc.status === 'success' || uc.status === 'failure'
                                    );

                                    scheme.status = allUseCasesCompleted
                                        ? (scheme.usecases.some(uc => uc.status === 'failure') ? 'failure' : 'success')
                                        : 'progress';
                                });

                                // 更新对应的测试计划
                                state.testPlans[plan.id] = updatedPlan;
                                break; // 找到并更新后立即退出循环
                            }
                        }
                    }
                }
            });
        }
    }))
);