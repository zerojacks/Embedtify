import { TestPlan, TestScheme, TestUseCase, TestStep, TestPlanScheme } from '../models/test-scheme.model';
import { CommunicationManager } from '../managers/communication-manager';
import { Logger } from '../utils/logger';
import { getWebSocketService } from '../websocketGlobal';
import { WebSocketService } from '../websocket';
import { ConnectionManager } from '../managers/ConnectionManager';
import { TestResultService } from './test-result.service';
import { ExectestService } from './exectest.service';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
interface ListenerInfo {
    stepId: string;
    expectedResult: string;
    receivedData?: Buffer;
    dependentStepIds: string[];
    port: string;
    timeout: number;
    step: TestStep;
    iscompleted: boolean;
}

interface ListenerGroup {
    listeners: ListenerInfo[];
    dependentSteps: TestStep[];
}

export class TestExecutionService {
    private communicationManager: CommunicationManager;
    private webSocketService: WebSocketService;
    private connectionManager: ConnectionManager;
    private plan_id: string;
    private test_plan_id: string;
    private testResultService: TestResultService;
    private testPlan: TestPlan | null;
    private schemetype: string;
    private schemetimeout: number;
    private activeListeners: Map<string, ListenerInfo>;

    constructor() {
        this.communicationManager = new CommunicationManager();
        this.webSocketService = getWebSocketService();
        this.connectionManager = new ConnectionManager();
        this.plan_id = "";
        this.test_plan_id = "";
        this.testResultService = new TestResultService();
        this.testPlan = null;
        this.schemetype = "";
        this.schemetimeout = 1000;
        this.activeListeners = new Map();
    }

    async executeTestPlan(exectestPlanId: string, planscheme: TestPlanScheme, testPlan: TestPlan): Promise<boolean> {
        this.plan_id = exectestPlanId;
        this.test_plan_id = testPlan.id;
        this.testPlan = testPlan;
        testPlan.status = 'progress';
        this.pushResultToFrontend({ type: 'plan', data: testPlan });
        const success = await this.executeTestSchemes(testPlan.schemes);
        await this.connectionManager.disconnectAll();
        for (const port in this.testPlan!.deviceinfo.status) {
            this.testPlan!.deviceinfo.status[port] = 'disconnected';
            this.pushResultToFrontend({ type: port, data: this.testPlan?.deviceinfo });
        }

        testPlan.status = success ? 'success' : 'failure';
        this.pushResultToFrontend({ type: 'plan', data: testPlan });
        return success;
    }

    async executeTestSchemes(testSchemes: TestScheme[]): Promise<boolean> {
        let schemeSuccess = true;
        for (const scheme of testSchemes) {
            scheme.status = 'progress';
            this.pushResultToFrontend({ type: 'scheme', data: scheme });
            const connectionType = scheme.default.port;
            const connectionParams = this.get_connect_param(connectionType);
            if (!connectionParams) {
                console.error("Connection parameters not found for type:", connectionType);
                scheme.status = 'failure';
                this.pushResultToFrontend({ type: 'scheme', data: scheme });
                schemeSuccess = false;
                continue;
            }

            if (await this.connectionManager.isConnectionExists(connectionType)) {
                console.log("Connection already exists for type:", connectionType);
            } else {
                const result = await this.connectionManager.addConnection(connectionType, connectionParams);
                this.testPlan!.deviceinfo.status[connectionType] = result ? 'connected' : 'disconnected';
                this.pushResultToFrontend({ type: connectionType, data: this.testPlan?.deviceinfo });
                if (!result) {
                    scheme.status = 'failure';
                    this.pushResultToFrontend({ type: 'scheme', data: scheme });
                    schemeSuccess = false;
                    continue;
                }
            }

            this.schemetype = connectionType;
            if (scheme.default.timeout) {
                this.schemetimeout = scheme.default.timeout;
            }
            let success = true;
            for (const useCase of scheme.usecases) {
                useCase.status = 'progress';
                this.pushResultToFrontend({ type: 'usecase', data: useCase });
                this.activeListeners.clear();
                const result = await this.executeUseCase(useCase, scheme.id);
                if (!result) {
                    success = false;
                }
                useCase.status = result ? 'success' : 'failure';
                this.pushResultToFrontend({ type: 'usecase', data: useCase });
            }
            scheme.status = success ? 'success' : 'failure';
            this.pushResultToFrontend({ type: 'scheme', data: scheme });
            if (scheme.status === 'failure') {
                schemeSuccess = false;
            }

        }
        return schemeSuccess;
    }

    private async executeUseCase(useCase: TestUseCase, schemeId: string): Promise<boolean> {
        try {
            // 按顺序执行每个步骤
            let group: ListenerGroup = {
                listeners: [],
                dependentSteps: []
            };
            let success = true;
            for (let i = 0; i < useCase.steps.length; i++) {
                const currentStep = useCase.steps[i];

                if (currentStep.type === 'listen' && group.listeners.some(listener => listener.stepId === currentStep.id)) {
                    continue;
                }
                if (group.dependentSteps.some(step => step.id === currentStep.id)) {
                    continue;
                }

                if (currentStep.type === 'listen') {
                    // 如果是监听步骤，找出所有相关的监听步骤和依赖步骤
                    group.listeners = [];
                    group.dependentSteps = [];
                    group = this.findRelatedListenersAndDependencies(currentStep, useCase.steps.slice(i));
                    console.log("group", group);
                    const result = await this.executeListenerGroup(group);
                    if (!result) {
                        success = false;
                    }
                } else {
                    // 普通步骤直接执行
                    console.log("executeNormalStep", currentStep);
                    const result = await this.executeNormalStep(currentStep);
                    if (!result) {
                        success = false;
                    }
                }
            }

            await this.saveResults(useCase, schemeId);
            return success;
        } finally {
            this.activeListeners.clear();
        }
    }

    private findRelatedListenersAndDependencies(
        currentListener: TestStep,
        remainingSteps: TestStep[]
    ): ListenerGroup {
        const group: ListenerGroup = {
            listeners: [],
            dependentSteps: []
        };

        // 添加当前监听器
        const currentListenerInfo: ListenerInfo = {
            stepId: currentListener.id,
            expectedResult: currentListener.result.result,
            dependentStepIds: currentListener.dependencies || [],
            port: currentListener.port || this.schemetype,
            timeout: currentListener.timeout || this.schemetimeout,
            step: currentListener,
            iscompleted: false
        };
        group.listeners.push(currentListenerInfo);

        console.log("currentListener", currentListener, currentListener.dependencies);
        // 获取当前监听器的所有依赖ID
        const currentDependencies = new Set(currentListener.dependencies || []);

        // 在剩余步骤中查找相关的监听器和依赖
        for (let i = 1; i < remainingSteps.length; i++) {
            const step = remainingSteps[i];
            console.log("step", step, currentListener.dependencies);

            if (step.type === 'listen') {
                // 检查是否有重叠的依赖
                const stepDependencies = Array.isArray(step.dependencies) ? step.dependencies : [];
                const hasOverlap = stepDependencies.some(depId => currentDependencies.has(depId));

                if (hasOverlap) {
                    // 添加到监听器组
                    const listenerInfo: ListenerInfo = {
                        stepId: step.id,
                        expectedResult: step.result.result,
                        dependentStepIds: stepDependencies,
                        port: step.port || this.schemetype,
                        timeout: step.timeout || this.schemetimeout,
                        step: step,
                        iscompleted: false
                    };
                    group.listeners.push(listenerInfo);

                    // 添加新的依赖ID到集合中
                    stepDependencies.forEach(depId => currentDependencies.add(depId));
                }
            }
        }
        console.log("currentDependencies", currentDependencies);
        // 查找所有依赖步骤
        remainingSteps.forEach(step => {
            if (currentDependencies.has(step.stepid)) {
                group.dependentSteps.push(step);
            }
        });

        // 按照原始步骤顺序排序依赖步骤
        group.dependentSteps.sort((a, b) =>
            remainingSteps.findIndex(s => s.id === a.id) -
            remainingSteps.findIndex(s => s.id === b.id)
        );

        return group;
    }

    private async executeNormalStep(step: TestStep): Promise<boolean> {
        step.status = 'progress';
        this.pushResultToFrontend({ type: 'step', data: step });

        const result = await this.executeTestStep(step);
        step.status = result ? 'success' : 'failure';
        this.pushResultToFrontend({ type: 'step', data: step });

        // 执行后短暂等待
        await new Promise(resolve => setTimeout(resolve, 1000));
        return result;
    }

    private async saveResults(useCase: TestUseCase, schemeId: string): Promise<void> {
        const savePromises = useCase.steps.map(step =>
            this.testResultService.create({
                id: this.plan_id,
                test_plan_id: this.test_plan_id,
                test_scheme_id: schemeId,
                use_case_id: useCase.id,
                step_id: step.id,
                result: step.testresult || {
                    senddata: '',
                    receivedata: '',
                    expecteddata: '',
                    time: new Date().toISOString(),
                    port: '',
                    type: '',
                    errmsg: ''
                },
                executed_at: new Date().toISOString()
            })
        );

        await Promise.all(savePromises);
    }

    private async executeListenerGroup(group: ListenerGroup): Promise<boolean> {
        let success = true;
        try {
            // 1. 设置所有监听器
            console.log('Setting up listeners:', group.listeners.map(l => l.stepId));
            group.listeners.forEach(listener => this.setupListener(listener));

            // 2. 执行所有依赖步骤
            console.log('Executing dependent steps:', group.dependentSteps.map(s => s.id));
            for (const step of group.dependentSteps) {
                const result = await this.executeNormalStep(step);
                if (!result) {
                    success = false;
                }
            }

            // 3. 等待最长超时时间
            const maxTimeout = Math.max(...group.listeners.map(l => l.timeout));
        
            await new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    console.log('Timeout reached without all listeners completing');
                    resolve(false);  // 超时情况下返回 false
                }, maxTimeout * 1000);
    
                const checkCompletion = () => {
                    const allCompleted = group.listeners.every(listener => listener.iscompleted);
                    if (allCompleted) {
                        clearTimeout(timer);
                        console.log('All listeners completed successfully');
                        resolve(true);
                        return;
                    }
                    // 如果还没有全部完成，继续检查
                    setTimeout(checkCompletion, 1000); // 每秒检查一次
                };
    
                checkCompletion();
            });

            // 4. 验证所有监听器结果
            console.log('Verifying listener results');
            for (const listener of group.listeners) {
                const result = await this.verifyListenerResult(listener.step, listener);
                if (!result) {
                    success = false;
                }
            }
        } catch (error) {
            console.error('Error in listener group execution:', error);
            // 将所有监听器标记为失败
            for (const listener of group.listeners) {
                this.markStepAsFailed(listener.step, listener);
            }
        } finally {
            // 清理监听器
            group.listeners.forEach(listener =>
                this.activeListeners.delete(listener.stepId)
            );
        }
        return success;
    }

    private async setupListener(listenerInfo: ListenerInfo) {
        try {
            this.activeListeners.set(listenerInfo.stepId, listenerInfo);
    
            listenerInfo.step.status = 'progress';
            this.pushResultToFrontend({ type: 'step', data: listenerInfo.step });
    
            await this.connectionManager.listen(
                listenerInfo.stepId,
                listenerInfo.port,
                listenerInfo.expectedResult,
                listenerInfo.timeout * 1000,
                (id: string, data: Buffer) => {
                    console.log("callback", id, data);
                    const listener = this.activeListeners.get(id);
                    if (listener) {
                        console.log("listener", listener);
                        listener.receivedData = data;
                        listener.iscompleted = true;
                        this.connectionManager.unlisten(listenerInfo.port, id);
                    }
                }
            );
            
            console.log("Listener setup completed successfully");
        } catch (error) {
            console.error(`Error setting up listener ${listenerInfo.stepId}:`, error);
            this.markStepAsFailed(listenerInfo.step, listenerInfo);
        }
    }

    private async verifyListenerResult(step: TestStep, listenerInfo: ListenerInfo): Promise<boolean> {
        step.testresult = {
            senddata: '',
            receivedata: listenerInfo.receivedData?.toString() || '',
            expecteddata: listenerInfo.port === "mqtt" ? this.cleanAndStandardizeJson(listenerInfo.expectedResult) : listenerInfo.expectedResult,
            time: new Date().toISOString(),
            port: listenerInfo.port,
            type: 'listen',
            status: 'failure'
        };
        console.log("verifyListenerResult", listenerInfo.receivedData, listenerInfo.expectedResult);
        if (listenerInfo.receivedData) {
            const [result, errmsg] = this.verifyResponse(
                listenerInfo.port,
                listenerInfo.receivedData,
                this.cleanAndStandardizeJson(listenerInfo.expectedResult)
            );

            step.status = result ? 'success' : 'failure';
            step.testresult.status = step.status;
            step.testresult.errmsg = errmsg;
        } else {
            step.status = 'failure';
            step.testresult.errmsg = 'No data received';
        }

        this.pushResultToFrontend({ type: 'step', data: step });
        return step.status === 'success';
    }

    private markStepAsFailed(step: TestStep, listenerInfo: ListenerInfo): void {
        step.status = 'failure';
        step.testresult = {
            senddata: '',
            receivedata: '',
            expecteddata: listenerInfo.port === "mqtt" ? this.cleanAndStandardizeJson(listenerInfo.expectedResult) : listenerInfo.expectedResult,
            time: new Date().toISOString(),
            port: listenerInfo.port,
            type: 'listen',
            status: 'failure',
            errmsg: 'No data received'
        };
        this.pushResultToFrontend({ type: 'step', data: step });
        listenerInfo.iscompleted = true;
    }

    private async executeTestStep(step: TestStep): Promise<boolean> {
        let port = step.port || this.schemetype;
        const type = step.type || this.schemetype;
        const timeout = (step.timeout || this.schemetimeout) * 1000;
        let senddata = step.content.content;

        try {
            let result = false;
            let response: Buffer | null = null;
            let errmsg = '';
            console.log("step-----", step, port, type, timeout, senddata);


            if (type === "wait") {
                await new Promise(resolve => setTimeout(resolve, timeout));
                result = true;
                response = Buffer.from('');
            } else {
                if (await this.connectionManager.isConnectionExists(port)) {
                    console.log("Connection already exists for type:", port);
                } else {
                    const result = await this.connectionManager.addConnection(port, this.get_connect_param(port));
                    this.testPlan!.deviceinfo.status[port] = result ? 'connected' : 'disconnected';
                    this.pushResultToFrontend({ type: port, data: this.testPlan?.deviceinfo });
                }

                console.log("port", port);

                if (port === "sftp" && type === "download") {
                    [result, errmsg] = await this.connectionManager.download(port, senddata, step.result.result);
                    response = Buffer.from('');
                } else if (port === "sftp" && type === "upload") {
                    const plandir = path.join(__dirname, '..', '..', '..', 'plans', this.test_plan_id);
                    const filePath = path.join(plandir, 'attachments', senddata);
                    const filename = path.basename(filePath);
                    const remotePath = step.destination || '/tmp/' + filename;
                    [result, errmsg] = await this.connectionManager.upload(port, filePath, remotePath);
                    response = Buffer.from('');
                    senddata = senddata + ' ' + remotePath;
                } else if (port === "ssh") {
                    response = await this.connectionManager.execute(port, senddata);
                    [result, errmsg] = this.verifyResponse(port, response, step.result.result);
                } else {
                    response = await this.connectionManager.sendAndReceive(port, senddata, timeout);
                    [result, errmsg] = this.verifyResponse(port, response, step.result.result);
                }

            }

            console.log("response", result, errmsg);

            if (response) {
                step.testresult = {
                    senddata: port === "mqtt" ? this.cleanAndStandardizeJson(senddata) : senddata,
                    receivedata: port === "mqtt" ? this.cleanAndStandardizeJson(response.toString()) : response.toString(),
                    expecteddata: port === "mqtt" ? this.cleanAndStandardizeJson(step.result.result) : step.result.result,
                    errmsg: errmsg,
                    time: new Date().toISOString(),
                    port: step.port || type,
                    type: type,
                    status: result ? 'success' : 'failure'
                };
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            return result;
        } catch (error) {
            Logger.error('Test step execution failed', new Error(error as string));
            step.testresult = {
                senddata: port === "mqtt" ? this.cleanAndStandardizeJson(step.content.content) : step.content.content,
                receivedata: '',
                expecteddata: port === "mqtt" ? this.cleanAndStandardizeJson(step.result.result) : step.result.result,
                time: new Date().toISOString(),
                port: step.port || 'mqtt',
                type: step.type || 'mqtt',
                status: 'failure',
                errmsg: error as string
            };
            return false;
        }
    }

    private get_connect_param(type: string): any {
        if (type === 'ssh') {
            return this.testPlan?.deviceinfo.config.ssh;
        } else if (type === 'sftp') {
            return this.testPlan?.deviceinfo.config.sftp;
        } else if (type === 'tcp') {
            return this.testPlan?.deviceinfo.config.tcp;
        } else if (type === 'udp') {
            return this.testPlan?.deviceinfo.config.udp;
        } else if (type === 'serial') {
            return this.testPlan?.deviceinfo.config.serial;
        } else if (type === 'bluetooth') {
            return this.testPlan?.deviceinfo.config.bluetooth;
        } else if (type === 'mqtt') {
            return this.testPlan?.deviceinfo.config.mqtt;
        }
        return null;
    }

    private cleanAndStandardizeJson(str: string): string {
        // 1. 移除所有换行符和制表符
        let cleanStr = str.replace(/[\n\t]/g, '');

        // 2. 处理多余的空格
        cleanStr = cleanStr.replace(/\s+/g, ' ').trim();

        // 3. 给没有引号的属性名添加双引号
        cleanStr = cleanStr.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');

        return cleanStr;
    }

    private verifyResponse(port: string, response: Buffer, expect: string): [boolean, string] {
        try {
            if (port === "mqtt") {
                const responseStr = response.toString();
                const responseJson = JSON.parse(responseStr);
                const expectJson = JSON.parse(this.cleanAndStandardizeJson(expect));
                const expectPayload = expectJson.payload;

                if (!responseJson || !expectPayload) {
                    console.error('Invalid payload structure');
                    return [false, 'Invalid payload structure'];
                }
                const responsePayload = responseJson.payload;

                return this.deepCompare(responsePayload, expectPayload);
            } else if (port === "ssh") {
                const responseStr = response.toString();
                // 判断是否包含expect
                const match = responseStr.includes(expect);
                return [match, match ? '' : 'Response does not contain expected string'];
            }
            else {
                const responseStr = response.toString();
                const expectStr = this.cleanAndStandardizeJson(expect);
                return this.deepCompare(responseStr, expectStr);
            }

        } catch (error) {
            console.error('Error verifying response:', error);
            return [false, 'Error verifying response'];
        }
    }

    private deepCompare(actual: any, expected: any, path: string = ''): [boolean, string] {
        // 如果期望值是'#'，表示该值可以是任意值
        if (expected === '#') {
            return [true, ''];
        }

        // 处理 null 或 undefined
        if (actual === null || actual === undefined || expected === null || expected === undefined) {
            const match = actual === expected;
            return [match, match ? '' : `Null/undefined mismatch at ${path}: expected ${expected}, got ${actual}`];
        }

        // 处理原始类型
        if (typeof expected !== 'object') {
            const match = actual === expected;
            return [match, match ? '' : `Value mismatch at ${path}: expected ${expected}, got ${actual}`];
        }

        // 处理数组
        if (Array.isArray(expected)) {
            if (!Array.isArray(actual)) {
                return [false, `Type mismatch at ${path}: expected array, got ${typeof actual}`];
            }

            // 如果期望数组为空，实际数组也必须为空
            if (expected.length === 0) {
                return [actual.length === 0, actual.length === 0 ? '' : `Array length mismatch at ${path}`];
            }

            // 如果期望数组只有通配符，则只要类型是数组就通过
            if (expected.length === 1 && expected[0] === '#') {
                return [true, ''];
            }

            // 检查期望数组中的每个元素是否都能在实际数组中找到匹配
            for (let i = 0; i < expected.length; i++) {
                const expectedItem = expected[i];

                // 查找匹配的元素
                let foundMatch = false;
                for (const actualItem of actual) {
                    const [matches] = this.deepCompare(actualItem, expectedItem, `${path}[${i}]`);
                    if (matches) {
                        foundMatch = true;
                        break;
                    }
                }

                if (!foundMatch) {
                    return [false, `No matching element found at ${path}[${i}]`];
                }
            }
            return [true, ''];
        }

        // 处理对象
        if (typeof expected === 'object') {
            if (typeof actual !== 'object') {
                return [false, `Type mismatch at ${path}: expected object, got ${typeof actual}`];
            }

            // 检查所有期望的键值对
            for (const key in expected) {
                // 修改：检查实际对象是否缺少必要的键
                if (!actual.hasOwnProperty(key)) {
                    return [false, `Missing key at ${path ? path + '.' : ''}${key}`];
                }

                // 递归比较属性值
                const [matches, error] = this.deepCompare(
                    actual[key],
                    expected[key],
                    path ? `${path}.${key}` : key
                );

                if (!matches) {
                    return [false, error];
                }
            }
            return [true, ''];
        }

        return [true, ''];
    }

    private pushResultToFrontend(data: any) {
        this.webSocketService.broadcast('testStepResult', {
            plan_id: this.plan_id,
            data: data
        });
    }

    async stopTestPlan() {
        console.log('stopTestPlan');
    }

    async getTestPlanStatus() {
        return {
            status: 'running'
        };
    }
}