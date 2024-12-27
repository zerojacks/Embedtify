export interface TestStepReport {
    stepId: string;
    name: string;
    status: string;
    sendData?: string;
    receiveData?: string;
    expectedData?: string;
    port?: string;
    time?: string;
    errmsg?: string;
}

export interface TestUseCaseReport {
    useCaseId: string;
    name: string;
    status: string;
    steps: TestStepReport[];
    passCount: number;
    failCount: number;
    totalCount: number;
    successRate: number;
}

export interface TestSchemeReport {
    schemeId: string;
    name: string;
    useCases: TestUseCaseReport[];
    passCount: number;
    failCount: number;
    totalCount: number;
    successRate: number;
}

export interface TestReport {
    id: string;
    testPlanId: string;
    testPlanName: string;
    executionDate: string;
    duration: string;
    environment: string;
    executor: string;
    schemes: TestSchemeReport[];
    summary: {
        totalUseCases: number;
        totalSteps: number;
        passedSteps: number;
        failedSteps: number;
        successRate: number;
        status: string;
    }
}