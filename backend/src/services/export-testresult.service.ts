// 导出测试结果,传入一个测试方案的id，需要根据id从ExectestService中获取测试方案，然后根据测试方案中的方案id从TestResultService中获取测试结果，然后根据测试结果生成一个测试报告，最后将测试报告导出为pdf文件
import { ExectestService } from './exectest.service';
import { TestResultService } from './test-result.service';
import { TestPlanDataModel } from '../models/exectest-plan.model';
import { TestPlan, TestResult } from '../models/test-scheme.model';
import { TestReport, TestSchemeReport, TestStepReport, TestUseCaseReport } from '../types/testreport';
import { TestResultModel } from '@/models/test-result.model';
import { PDFReportGenerator } from '../utils/pdfgenerator';
import { DocxGenerator } from '../utils/docxgenerator';
import { NewPDFGenerator } from '../utils/newpdfgenerator';

export class ExportTestResultService {
    constructor() {
    }

    async exportTestResult(testPlanId: string, extension: string): Promise<Buffer | null> {
        if (!testPlanId || !extension) {
            return null;
        }
        
        try {
            const exectestService = new ExectestService();
            const testResultService = new TestResultService();
            const testPlanData = await exectestService.findById(testPlanId);
            if (!testPlanData) {
                throw new Error('Test plan not found');
            }
            const testPlan = testPlanData.data.plan;
            const testResult = await testResultService.findById(testPlanId);
            if (!testResult) {
                throw new Error('Test result not found');
            }
            const testReport: TestReport = await this.generateTestReport(testPlan, testResult);
                const pdfBuffer = await this.generateFile(testReport, extension);
                return pdfBuffer;
        } catch (error) {
            return null;
        }
    }

    async generateTestReport(testPlan: TestPlan, testResult: TestResultModel[]): Promise<TestReport> {
        // 根据测试方案和测试结果生成测试报告]
        const testReport: TestReport = {
            id: `${testPlan.id}-${new Date().getTime()}`,
            testPlanId: testPlan.id,
            testPlanName: testPlan.name,
            executionDate: new Date().toISOString(),
            duration: "0",
            environment: 'test',
            executor: 'test',
            schemes: [],
            summary: {
                totalUseCases: 0,
                totalSteps: 0,
                passedSteps: 0,
                failedSteps: 0,
                successRate: 0,
                status: 'unknown'
            }
        }
        let totalusecases = 0;
        let totalsteps = 0;
        let totalpassedsteps = 0;
        let totalfailedsteps = 0;

        for (const scheme of testPlan.schemes) {
            const schemeReport: TestSchemeReport = {
                schemeId: scheme.id,
                name: scheme.name,
                useCases: [],
                passCount: 0,
                failCount: 0,
                totalCount: 0,
                successRate: 0
            }
            let schemePassCount = 0;
            let schemeFailCount = 0;
            let schemeTotalCount = 0;
            for (const useCase of scheme.usecases) {
                totalusecases++;
                const useCaseReport: TestUseCaseReport = {
                    useCaseId: useCase.id,
                    name: useCase.name,
                    status: useCase.status || 'unknown',
                    steps: [],
                    passCount: 0,
                    failCount: 0,
                    totalCount: 0,
                    successRate: 0
                }
                let passCount = 0;
                let failCount = 0;
                let totalCount = 0;
                for (const step of useCase.steps) {
                    totalsteps++;
                    const stepReport: TestStepReport = {
                        stepId: step.id,
                        name: step.name,
                        status: step.status || 'unknown',
                    }
                    const result = testResult.find(result => result.step_id === step.id);
                    if (result) {
                        stepReport.stepId = step.id;
                        stepReport.name = step.name;
                        stepReport.sendData = result.result.senddata;
                        stepReport.receiveData = result.result.receivedata;
                        stepReport.port = result.result.port;
                        stepReport.time = result.result.time;
                        stepReport.status = result.result.status || 'unknown';
                        stepReport.expectedData = result.result.expecteddata;
                        stepReport.errmsg = result.result.errmsg;

                        if (result.result.status === 'success') {
                            passCount++;
                            totalpassedsteps++;
                        } else {
                            failCount++;
                            totalfailedsteps++;
                        }
                        totalCount++;
                    }
                    useCaseReport.steps.push(stepReport);
                }
                useCaseReport.passCount = passCount;
                useCaseReport.failCount = failCount;
                useCaseReport.totalCount = totalCount;
                useCaseReport.successRate = passCount / totalCount * 100;
                useCaseReport.status = passCount === totalCount ? 'success' : 'failure';
                schemeReport.useCases.push(useCaseReport);
                if (useCaseReport.status === 'success') {
                    schemePassCount++;
                } else {
                    schemeFailCount++;
                }
                schemeTotalCount++;
            }
            schemeReport.passCount = schemePassCount;
            schemeReport.failCount = schemeFailCount;
            schemeReport.totalCount = schemeTotalCount;
            schemeReport.successRate = schemePassCount / schemeTotalCount * 100;

            testReport.schemes.push(schemeReport);
            testReport.summary.totalUseCases += totalusecases;
            testReport.summary.totalSteps += totalsteps;
            testReport.summary.passedSteps += totalpassedsteps;
            testReport.summary.failedSteps += totalfailedsteps;
            testReport.summary.successRate = totalpassedsteps / totalsteps * 100;
            testReport.summary.status = totalpassedsteps === totalsteps ? 'success' : 'failure';
        }
        return testReport;
    }

    async generateFile(testReport: TestReport, extension: string): Promise<Buffer> {
        if (extension !== 'pdf' && extension !== 'docx') {
            throw new Error('Unsupported file extension');
        }
        try {
            if (extension === 'pdf') {
                const pdfReportGenerator = new NewPDFGenerator();
                return pdfReportGenerator.generateReport(testReport, extension);
            } else if (extension === 'docx') {
                const docxReportGenerator = new DocxGenerator();
                return docxReportGenerator.generateReport(testReport, extension);
            }
        } catch (error) {
            throw new Error('Failed to generate file');
        }
        // Add a default return statement to handle unexpected cases
        throw new Error('Unexpected error in generateFile');
    }
}