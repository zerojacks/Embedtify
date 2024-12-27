import { Router, Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { TestPlan, TestPlanScheme } from '../models/test-scheme.model';
import { TestManager } from '../managers/test-manager';
import { TestPlanService } from '../services/test-plan.service';
import { TestPlanModel } from '../models/test-plan.model';
import { PlanPraseService } from '../services/plan-prase.service';
import { ExportTestResultService } from '../services/export-testresult.service';
import { TestResultService } from '../services/test-result.service';
import { ExectestService } from '../services/exectest.service';
const router = Router();
const testManager = new TestManager();
const testPlanService = new TestPlanService();
const planPraseService = new PlanPraseService();
const exportTestResultService = new ExportTestResultService();
const testResultService = new TestResultService();
const exectestService = new ExectestService();

router.post('/testplan/addplan', async (req: Request, res: Response) => {
    const testPlan = req.body;
    const praseResult = await planPraseService.parsePlan(testPlan);
    res.status(200).send(praseResult);
});

router.post('/testplan/start', async (req: Request, res: Response) => {
    const testPlan = req.body;
    try {
        const id = testPlan.id;
        const plandata = testPlan.plandata as TestPlan;
        const planscheme = testPlan.planscheme as TestPlanScheme;
        const result = await testManager.startTestPlan(id, plandata, planscheme);
        res.status(200).send(result);
    } catch (error) {
        Logger.error('Failed to start test plan', error instanceof Error ? error : new Error('Unknown error'));
        res.status(500).send('Failed to start test plan.');
    }
});

router.post('/testplan/pause', async (req: Request, res: Response) => {
    try {
        const result = await testManager.stopTestPlan(req.body.testPlanId);
        res.status(200).send(result);
    } catch (error) {
        Logger.error('Failed to pause test plan', error instanceof Error ? error : new Error('Unknown error'));
        res.status(500).send('Failed to pause test plan.');
    }
});

router.get('/testplan/status', async (req: Request, res: Response) => {
    try {
        const status = await testManager.getTestPlanStatus(req.query.testPlanId as string);
        res.status(200).send(status);
    } catch (error) {
        Logger.error('Failed to get test plan status', error instanceof Error ? error : new Error('Unknown error'));
        res.status(500).send('Failed to get test plan status.');
    }
});

router.get('/testplan', async (req: Request, res: Response) => {
    try {
        const testPlans = await testManager.getTestPlans();
        res.status(200).send(testPlans);
    } catch (error) {
        Logger.error('Failed to get test plan', error instanceof Error ? error : new Error('Unknown error'));
        res.status(500).send('Failed to get test plan.');
    }
});

// 获取方案
router.get('/testplan/all', async (req: Request, res: Response) => {
    const testPlans = await testPlanService.findAll();
    res.status(200).send(testPlans);
});
// 保存方案
router.post('/testplan/save', async (req: Request, res: Response) => {
    try {
        // 从请求体中获取测试方案数据
        const testPlanData: TestPlanModel = req.body;

        // 确保有ID，如果没有则生成
        // if (!testPlanData.id) {
        //     testPlanData.id = generateUniqueId(); // 你需要实现这个生成唯一ID的函数
        // }
        console.log(testPlanData);

        // 设置时间戳
        testPlanData.createdAt = new Date().toISOString();
        testPlanData.updatedAt = new Date().toISOString();

        // 调用服务层保存数据
        const result = await testPlanService.create(testPlanData);

        // 返回保存后的测试方案
        res.status(200).json(result);
    } catch (error) {
        Logger.error('Failed to save test plan', error instanceof Error ? error : new Error('Unknown error'));
        res.status(500).json({ 
            message: 'Failed to save test plan',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

router.delete('/testplan/delete', async (req: Request, res: Response) => {
    const testPlanId = req.body.testPlanId;
    const result = await testPlanService.delete(testPlanId);
    if (result) {
        const data = {
            success: true,
            message: 'Test plan deleted successfully.'
        }
        res.status(200).send(data);
    } else {
        const data = {
            success: false,
            message: 'Failed to delete test plan.'
        }
        res.status(500).send(data);
    }
});

router.get('/testplan/getplandata/:id', async (req: Request, res: Response) => {
    const testPlanId = req.params.id;
    const testPlan = await testPlanService.findById(testPlanId);
    res.status(200).send(testPlan);
});

router.get('/testplan/export/:id', async (req: Request, res: Response) => {
    const testPlanId = req.params.id;
    const extension = req.query.extension as string;
    const pdfBuffer = await exportTestResultService.exportTestResult(testPlanId, extension);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${testPlanId}.${extension}"`);
    res.send(pdfBuffer);
});

router.get('/testplan/getallexecplans', async (req: Request, res: Response) => {
    const testPlan = await exectestService.findAll({
        orderBy: 'updatedAt',
        order: 'DESC'
    });
    res.status(200).send(testPlan);
});

router.get('/testplan/getallresult/:id', async (req: Request, res: Response) => {
    const testPlanId = req.params.id;
    const testResult = await testResultService.findById(testPlanId);
    res.status(200).send(testResult);
});

export default router; 