import { useRef, useCallback, useEffect } from 'react';
import { TestScheme, TestStep, TestUseCase } from '@/types/scheme';
import { useTestingStore } from '@/stores/useTestingStore';
import { useSocket } from '@/Provider/webProvider';
import { TestPlan, TestplanData } from '@/types/testplan';
import { DeviceInfo } from '@/types/device';
const connectionType = ['tcp', 'udp', 'serial', 'mqtt', 'bluetooth', 'ssh', 'sftp'];
export function useTestPlanWebSocket() {
    const { testPlans, updateTestPlan } = useTestingStore();
    const processedStepsRef = useRef<Set<string>>(new Set());
    const isProcessingRef = useRef(false);
    const { socket } = useSocket();

    const processUpdateQueue = useCallback((planId: string, data: any) => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;
        console.log("Received data:", data);
        if(!data) return;
        try {
            const currentTestPlan: TestplanData = testPlans[planId];
            if (!currentTestPlan) {
                console.warn(`Test plan ${planId} not found`);
                return;
            }
            if(data.type === 'plan') {
                const planData: TestPlan = data.data;
                planData.status = planData.status || 'unknown';
                updateTestPlan(planId, planData);
                return;
            }
            else if(data.type === 'scheme') {
                const schemeData: TestScheme = data.data; // Rename this variable
                const schemeid = schemeData.id;
                const plandata: TestPlan = structuredClone(currentTestPlan.plan);
                const scheme = plandata.schemes.find(s => s.id === schemeid);
                if (!scheme) {
                    console.warn(`Scheme ${schemeid} not found`);
                    return;
                }
                scheme.status = schemeData.status;
                updateTestPlan(planId, plandata);
            } else if(data.type === 'usecase') {
                const usecase: TestUseCase = data.data;
                const usecaseid = usecase.id;
                const [schemeid, useCaseid] = usecase.id.split('-');
                const plandata = structuredClone(currentTestPlan.plan);
                const scheme = plandata.schemes.find(s => s.id === schemeid);
                if (!scheme) {
                    console.warn(`Scheme ${schemeid} not found`);
                    return;
                }
                const useCase = scheme.usecases.find(u => u.id === usecaseid);
                if (!useCase) {
                    console.warn(`UseCase ${usecaseid} not found`);
                    return;
                }
                useCase.status = usecase.status;
                updateTestPlan(planId, plandata);

            } else if(data.type === 'step') {
                const step: TestStep = data.data;
            
                const plandata = structuredClone(currentTestPlan.plan); // 使用深拷贝避免直接修改状态
                const [schemeid, useCaseid] = step.id.split('-');
                const usecaseid = `${schemeid}-${useCaseid}`;
                const scheme = plandata.schemes.find(s => s.id === schemeid);
                if (!scheme) {
                    console.warn(`Scheme ${schemeid} not found`);
                    return;
                }

                const useCase = scheme.usecases.find(u => u.id === usecaseid);
                if (!useCase) {
                    console.warn(`UseCase ${usecaseid} not found`);
                    return;
                }

                const stepIndex = useCase.steps.findIndex(s => s.id === step.id);
                if (stepIndex === -1) {
                    console.warn(`Step ${step.id} not found`);
                    return;
                }

                useCase.steps[stepIndex] = step;
                updateTestPlan(planId, plandata);
            } else if (connectionType.includes(data.type)) {
                const device: DeviceInfo = data.data;
                const deviceid = device.id;
                const plandata = structuredClone(currentTestPlan.plan);
                plandata.deviceinfo.status[data.type] = device.status[data.type];
                updateTestPlan(planId, plandata);
            }
            // 更新已处理的步骤集合
            processedStepsRef.current.add(planId);
        } finally {
            isProcessingRef.current = false;
        }
    }, [testPlans, updateTestPlan]);

    useEffect(() => {
        if (!socket) return;

        const handleTestStepResult = (data: any) => {
            console.log("Received test step result:", data);
            processUpdateQueue(data.plan_id, data.data);
        };

        socket.on('testStepResult', handleTestStepResult);

        return () => {
            socket.off('testStepResult', handleTestStepResult);
        };
    }, [socket, processUpdateQueue]);
}