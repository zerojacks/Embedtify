import { TestScheme } from "@/types/scheme";
import { TimelineType } from "@/components/Timeline";
import { DeviceInfo } from "@/types/device";

export interface TestPlanScheme {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    filepath: string[];
    attachments?: string[];
}

export interface TestPlan {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    deviceinfo: DeviceInfo;
    schemes: TestScheme[];
    status?: TimelineType;
}

export interface TestplanData {
    plan: TestPlan;
    planscheme: TestPlanScheme;
}

export interface ExectestPlan {
    id: string;
    data: TestplanData;
    createdAt: string;
    updatedAt: string;
    status: TimelineType;
}

export interface ExecTestedPlanData {
    data: ExectestPlan[];
    total: number;
}
