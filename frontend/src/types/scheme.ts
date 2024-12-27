import { TimelineType } from '@/components/Timeline';

export interface TestScheme {
    id: string;
    name: string;
    filepath: string;
    default: DefaultConfig;
    usecases: TestUseCase[];
    createdAt: string;
    updatedAt: string;
    status?: TimelineType;
}

export interface DefaultConfig {
    type: string;
    port: string;
    sloop: number;
    timeout: number;
    format: string;
    relation: string;
    uloop: number;
    check: string;
}

export interface TestUseCase {
    id: string;
    name: string;
    steps: TestStep[];
    selected?: boolean;
    status?: TimelineType;
}

export interface Content {
    type: string;
    port: string;
    content: string;
}

export interface Result {
    type: string;
    port: string;
    result: string;
}

export interface TestStep {
    id: string;
    stepid: string;
    dependencies?: string[];
    name: string;
    timeout: number;
    content: Content;
    result: Result;
    type?: string;
    port?: string;
    destination?: string;
    selected?: boolean;
    status?: TimelineType;
    testresult?: TestResult;
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
