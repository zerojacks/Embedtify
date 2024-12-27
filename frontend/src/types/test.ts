import { TimelineType } from "@/components/Timeline";

export interface TestStatus {
    running: boolean;
    currentUseCase: string | null;
    currentStep: string | null;
    progress: number;
    results: TestResult[];
}

export interface TestedResult {
    id: string;
    test_plan_id: string;
}


export interface TestResult {
    senddata: string;
    receivedata: string;
    expecteddata: string;
    errmsg?: string;
    time: string;
    port: string;
    type: string;
    status?: TimelineType;
}

export interface PlanTestResult {
    id: string;
    test_plan_id: string;
    test_scheme_id: string;
    use_case_id: string;
    step_id: string;
    result: TestResult;
    executed_at: string;
}