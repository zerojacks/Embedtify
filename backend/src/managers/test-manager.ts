// 测试管理器
import { WebSocketService } from '../websocket';
import { getWebSocketService } from '../websocketGlobal';
import { TestExecutionService } from '../services/test-execution.service';
import { TestPlan, TestPlanScheme } from '../models/test-scheme.model';
import { ExectestService } from '../services/exectest.service';
import { v4 as uuidv4 } from 'uuid';
import { DeviceService } from '../services/device.service';

export class TestManager {
    private testServers: Map<string, TestExecutionService>;
    private planPraseService = new Map<string, TestPlanScheme>;
    private testExecutionService = new Map<string, TestPlan>;
    private exectestService = new ExectestService();
    private deviceService = new DeviceService();

    constructor() {
        this.testServers = new Map<string, TestExecutionService>();
        this.planPraseService = new Map<string, TestPlanScheme>();
        this.testExecutionService = new Map<string, TestPlan>();
    }

    async startTestPlan(id: string, testPlan: TestPlan, planscheme: TestPlanScheme): Promise<{ id: string, success: boolean }> {
        const testExecutionService = new TestExecutionService();
        this.planPraseService.set(id, planscheme);
        this.testExecutionService.set(id, testPlan);
        this.testServers.set(id, testExecutionService);
        
        const exectestPlan = await this.exectestService.create({
            id: id,
            data: {
                planscheme: planscheme,
                plan: testPlan
            },
            status: 'progress',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });
        if (!exectestPlan.success) {
            return { id: id, success: false };
        }
        this.executeTestPlanInBackground(testExecutionService, exectestPlan.id, planscheme, testPlan);
        return { id: id, success: true };
    }

    private async executeTestPlanInBackground(
        testExecutionService: TestExecutionService,
        exectestPlanId: string,
        planscheme: TestPlanScheme,
        testPlan: TestPlan
    ): Promise<void> {
        try {
            await this.deviceService.setTesting(testPlan.deviceinfo.id, true);
            const success = await testExecutionService.executeTestPlan(exectestPlanId, planscheme, testPlan);
            await this.deviceService.setTesting(testPlan.deviceinfo.id, false);
            // 更新测试计划状态
            await this.exectestService.update(exectestPlanId, {
                status: success ? 'success' : 'failure',
                updatedAt: new Date().toISOString()
            });
        } catch (error) {
            // 处理错误情况
            console.error('Error executing test plan:', error);
            await this.exectestService.update(exectestPlanId, {
                status: 'failure',
                updatedAt: new Date().toISOString()
            });
        } finally {
            console.log('delete test server', exectestPlanId);
            this.testServers.delete(exectestPlanId);
            this.planPraseService.delete(exectestPlanId);
            this.testExecutionService.delete(exectestPlanId);
            await this.deviceService.setTesting(testPlan.deviceinfo.id, false);
        }
    }

    async stopTestPlan(testPlanId: string):Promise<{id: string, success: boolean}> {
        const testExecutionService = this.testServers.get(testPlanId);
        if (testExecutionService) {
            testExecutionService.stopTestPlan();
        }
        return { id: testPlanId, success: true };
    }

    async getTestPlanStatus(testPlanId: string) {
        const testExecutionService = this.testServers.get(testPlanId);
        return testExecutionService?.getTestPlanStatus();
    }

    async getTestPlans() {
        return this.testServers.values();
    }
}
