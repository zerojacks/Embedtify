import axios from 'axios';
import { TestPlan } from '@/types/testplan';
import { API_BASE_URL, TEST_PLAN_ENDPOINT, TEST_PLAN_GET_PLAN_DATA_ENDPOINT } from '../constants/apiConstants';

export async function getTestPlans() {
    const response = await axios.get(`${API_BASE_URL}${TEST_PLAN_ENDPOINT}`);
    return response.data;
}

export async function addTestPlan(testPlan: TestPlan) {
    const response = await axios.post(`${API_BASE_URL}${TEST_PLAN_ENDPOINT}`, testPlan);
    return response.data;
}

export async function updateTestPlan(testPlan: TestPlan) {
    const response = await axios.put(`${API_BASE_URL}${TEST_PLAN_ENDPOINT}/${testPlan.id}`, testPlan);
    return response.data;
}

export async function deleteTestPlan(id: string) {
    const response = await axios.delete(`${API_BASE_URL}${TEST_PLAN_ENDPOINT}/${id}`);
    return response.data;
}

export async function getTestPlan(id: string) {
    const response = await axios.get(`${API_BASE_URL}${TEST_PLAN_GET_PLAN_DATA_ENDPOINT}/${id}`);
    return response.data;
}

