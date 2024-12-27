import axios from 'axios';
import { TestPlanScheme, TestPlan, ExecTestedPlanData } from '@/types/testplan';
import { API_BASE_URL, TEST_PLAN_SAVE_ENDPOINT, TEST_PLAN_ALL_ENDPOINT, TEST_PLAN_DELETE_ENDPOINT, API_TEST_PLAN_ADD_PLAN_URL, API_TEST_PLAN_START_URL, API_TEST_PLAN_PAUSE_URL, API_TEST_PLAN_EXPORT_URL, API_TEST_PLAN_GET_ALL_RESULT_URL, API_TEST_PLAN_GET_ALL_EXEC_PLAN_URL } from '../constants/apiConstants';
import { PlanTestResult, TestedResult } from '@/types/test';

export async function saveTestPlan(testPlan: TestPlanScheme) {
    const response = await axios.post(`${API_BASE_URL}${TEST_PLAN_SAVE_ENDPOINT}`, testPlan);
    return response.data;
}

export async function getTestPlans() {
    const response = await axios.get(`${API_BASE_URL}${TEST_PLAN_ALL_ENDPOINT}`);
    return response.data;
}

export async function deleteTestPlan(id: string) {
    const response = await axios.delete(`${API_BASE_URL}${TEST_PLAN_DELETE_ENDPOINT}`, { data: { testPlanId: id } });
    return response.data;
}

export async function addTestPlanAPI(testPlan: TestPlanScheme): Promise<{id: string, plan: TestPlan}> {
    const response = await axios.post(`${API_BASE_URL}${API_TEST_PLAN_ADD_PLAN_URL}`, testPlan);
    return response.data;
}

export async function startTestPlanAPI(id: string, testPlan: TestPlanScheme, planData: TestPlan):Promise<{id: string, success: boolean}> {
    const response = await axios.post(`${API_BASE_URL}${API_TEST_PLAN_START_URL}`, { id: id, planscheme: testPlan, plandata: planData });
    return response.data;
}

export async function pauseTestPlanAPI(testPlanId: string):Promise<{id: string, success: boolean}> {
    const response = await axios.post(`${API_BASE_URL}${API_TEST_PLAN_PAUSE_URL}`, { testPlanId });
    return response.data;
}

// 返回的是一个文件
export async function exportTestResultAPI(testPlanId: string, extension: string):Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}${API_TEST_PLAN_EXPORT_URL}/${testPlanId}?extension=${extension}`, { responseType: 'blob' });
    return response.data;
}

export async function getTestedResultAPI(testPlanId: string):Promise<PlanTestResult[]> {
    const response = await axios.get(`${API_BASE_URL}${API_TEST_PLAN_GET_ALL_RESULT_URL}/${testPlanId}`);
    return response.data;
}

export async function getAllExecutedPlanAPI():Promise<ExecTestedPlanData> {
    const response = await axios.get(`${API_BASE_URL}${API_TEST_PLAN_GET_ALL_EXEC_PLAN_URL}`);
    return response.data;
}

