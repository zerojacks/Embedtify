import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { TestScheme, TestUseCase, TestStep } from '../types/scheme';

interface SchemeState {
    useCases: any;
    schemes: TestScheme[];
    currentScheme: TestScheme | null;
    selectedSteps: string[];
    // Actions
    setSchemes: (schemes: TestScheme[]) => void;
    addScheme: (scheme: TestScheme) => void;
    updateScheme: (scheme: TestScheme) => void;
    deleteScheme: (schemeId: string) => void;
    setCurrentScheme: (scheme: TestScheme | null) => void;
    toggleStepSelection: (stepId: string) => void;
    reorderUseCases: (dragIndex: number, dropIndex: number) => void;
    reorderSteps: (useCaseId: string, dragIndex: number, dropIndex: number) => void;
}

export const useSchemeStore = create<SchemeState>()(
    devtools(
        persist(
            (set, get) => ({
                schemes: [],
                currentScheme: null,
                selectedSteps: [],
                useCases: [],

                setSchemes: (schemes) => set({ schemes }),

                addScheme: (scheme) => set((state) => ({
                    schemes: [...state.schemes, scheme]
                })),

                updateScheme: (scheme) => set((state) => ({
                    schemes: state.schemes.map((s) =>
                        s.id === scheme.id ? scheme : s
                    ),
                    currentScheme: state.currentScheme?.id === scheme.id
                        ? scheme
                        : state.currentScheme
                })),

                deleteScheme: (schemeId) => set((state) => ({
                    schemes: state.schemes.filter((s) => s.id !== schemeId),
                    currentScheme: state.currentScheme?.id === schemeId
                        ? null
                        : state.currentScheme
                })),

                setCurrentScheme: (scheme) => set({ currentScheme: scheme }),

                toggleStepSelection: (stepId) => set((state) => ({
                    selectedSteps: state.selectedSteps.includes(stepId)
                        ? state.selectedSteps.filter(id => id !== stepId)
                        : [...state.selectedSteps, stepId]
                })),

                reorderUseCases: (dragIndex, dropIndex) => set((state) => {
                    if (!state.currentScheme) return state;

                    const newUseCases = [...state.currentScheme.usecases];
                    const [removed] = newUseCases.splice(dragIndex, 1);
                    newUseCases.splice(dropIndex, 0, removed);

                    const newScheme = {
                        ...state.currentScheme,
                        usecases: newUseCases
                    };

                    return {
                        currentScheme: newScheme,
                        schemes: state.schemes.map((s) =>
                            s.id === newScheme.id ? newScheme : s
                        )
                    };
                }),

                reorderSteps: (useCaseId, dragIndex, dropIndex) => set((state) => {
                    if (!state.currentScheme) return state;

                    const newUseCases = state.currentScheme.usecases.map(useCase => {
                        if (useCase.id !== useCaseId) return useCase;

                        const newSteps = [...useCase.steps];
                        const [removed] = newSteps.splice(dragIndex, 1);
                        newSteps.splice(dropIndex, 0, removed);

                        return { ...useCase, steps: newSteps };
                    });

                    const newScheme = {
                        ...state.currentScheme,
                        usecases: newUseCases
                    };

                    return {
                        currentScheme: newScheme,
                        schemes: state.schemes.map((s) =>
                            s.id === newScheme.id ? newScheme : s
                        )
                    };
                })
            }),
            {
                name: 'scheme-storage',
                partialize: (state) => ({
                    schemes: state.schemes
                })
            }
        )
    )
);