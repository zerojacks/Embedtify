import { TestPlanScheme, TestPlan, TestScheme } from "../models/test-scheme.model";
import { FileParseManager } from "../managers/file-parse.manager";
import { v4 as uuidv4 } from 'uuid';

export class PlanPraseService {
    private fileParseManager: FileParseManager;

    constructor() {
        this.fileParseManager = new FileParseManager();
    }

    async parsePlan(plan: TestPlanScheme): Promise<{id: string, plan: TestPlan}> {
        const testPlan: TestPlan = {
            id: plan.id,
            name: plan.name,
            createdAt: plan.createdAt,
            updatedAt: plan.updatedAt,
            deviceinfo: {
                id: '',
                name: '',
                type: '',
                protocol: '',
                config: {
                    timeout: 0,
                    retry: 0
                },
                status: {},
                createdAt: '',
                updatedAt: ''
            },
            schemes: [],
            status: 'unknown'
        };

        const schemePromises = plan.filepath.map((filepath, index) => 
            this.fileParseManager.parseFile(filepath, index)
        );

        testPlan.schemes = await Promise.all(schemePromises);
        console.log("testPlan", testPlan);
        return {id: uuidv4(), plan: testPlan};
    }
}