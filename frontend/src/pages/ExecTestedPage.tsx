import React, { useEffect, useState, useMemo } from 'react';
import { getAllExecutedPlanAPI } from "@/api/PlanAPI";
import { useTestingStore } from "@/stores/useTestingStore";
import { ExectestPlan, TestplanData, ExecTestedPlanData } from "@/types/testplan";
import { TimelineType } from "@/components/Timeline";
import { useNavigate } from 'react-router-dom';

interface TestPlanStats {
    total: number;
    success?: number;
    failure?: number;
    progress?: number;
    unknown?: number;
    [key: string]: number | undefined;
}

const ExecTestedPage = () => {
    const { testPlans, addTestPlan } = useTestingStore();
    const [loading, setLoading] = useState(true);
    const [testPlanData, setTestPlanData] = useState<ExecTestedPlanData | null>(null);
    const navigate = useNavigate();
    
    const testPlanStatus = useMemo(() => {
        return testPlanData?.data.reduce((acc, item) => {
            acc.total++;
            if (acc[item.status] !== undefined) {
                acc[item.status] = (acc[item.status] || 0) + 1;
            }
            return acc;
        }, { total: 0, success: 0, failure: 0, progress: 0, unknown: 0 });
    }, [testPlanData]);

    const getStatusBadgeClass = (status: TimelineType | undefined) => {
        const badges: Record<string, string> = {
            success: 'badge-success',
            failure: 'badge-error',
            progress: 'badge-info',
            unknown: 'badge-ghost'
        };
        return `badge ${badges[status || 'unknown']}`;
    };

    useEffect(() => {
        async function fetchTestedResult() {
            try {
                setLoading(true);
                const result: ExecTestedPlanData = await getAllExecutedPlanAPI();
                setTestPlanData(result);
                if (result?.data) {
                    result.data.forEach((item: ExectestPlan) => {
                        console.log("item", item);
                        if (!testPlans[item.id]) {
                            addTestPlan(item.id, item.data);
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching test results:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchTestedResult();
    }, []);

    const handleTestDetails = (id: string) => {
        navigate(`/test-details/${id}`);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            {/* Stats Overview */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title text-2xl mb-4">测试结果概览</h2>
                    <div className="stats stats-vertical lg:stats-horizontal shadow">
                        <div className="stat">
                            <div className="stat-title">总计划数</div>
                            <div className="stat-value">{testPlanStatus?.total}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">通过</div>
                            <div className="stat-value text-success">{testPlanStatus?.success}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">失败</div>
                            <div className="stat-value text-error">{testPlanStatus?.failure}</div>
                        </div>
                        <div className="stat">
                            <div className="stat-title">进行中</div>
                            <div className="stat-value text-info">{testPlanStatus?.progress}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Test Plans List */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-xl mb-4">测试方案详情</h2>
                    <div className="overflow-y-auto max-h-[600px]">
                        <div className="space-y-4">
                            {testPlanData?.data.map((item: ExectestPlan) => (
                                <div
                                    key={item.id}
                                    className="card bg-base-100 border hover:border-primary transition-colors duration-200"
                                    onClick={() => handleTestDetails(item.id)}
                                >
                                    <div className="card-body p-4 flex flex-row justify-between">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-medium">{item.data.plan.name}</h3>
                                                    <span className={getStatusBadgeClass(item.status)}>
                                                        {item.status || '未知'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-sm opacity-70 flex flex-wrap gap-4 mt-2">
                                                <span>ID: {item.id.slice(0, 8)}...</span>
                                                <span>方案数: {item.data.plan.schemes.length}</span>
                                                <span>更新时间: {new Date(item.updatedAt).toLocaleString()}</span>
                                                <span>执行时间: {new Date(item.createdAt).toLocaleString()}</span>
                                                <span>执行设备: {item.data.plan.deviceinfo.name}</span>
                                                <span>执行时长: {Math.floor((new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime()) / 1000)}s</span>
                                            </div>

                                            {item.data.planscheme.description && (
                                                <div className="mt-2 text-sm opacity-70 flex items-start gap-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{item.data.planscheme.description}</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex items-center justify-end'>
                                            <button className="btn btn-ghost btn-circle btn-sm" onClick={() => handleTestDetails(item.id)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExecTestedPage;