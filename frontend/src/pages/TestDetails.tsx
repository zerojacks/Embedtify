import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTestingStore } from "@/stores/useTestingStore";
import { TestplanData } from "@/types/testplan";
import SchemeTree from "@/components/SchemeTree";
import { connectTest } from "@/api/ConnectAPI";
import {
    exportTestResultAPI,
    getTestedResultAPI,
    startTestPlanAPI,
} from "@/api/PlanAPI";
import { PlanTestResult } from "@/types/test";
import { ArrowLeftIcon } from "lucide-react";

const TestDetails = () => {
    const { id } = useParams();
    const { testPlans, resetPlanStatus } = useTestingStore();
    const [plan, setPlan] = useState<TestplanData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTestResult = async () => {
            if (!id) return;

            const foundPlan = testPlans[id];
            if (!foundPlan) return;

            if (!foundPlan.plan.status) {
                try {
                    const result: PlanTestResult[] = await getTestedResultAPI(id);
                    result.forEach(item => {
                        const scheme = foundPlan.plan.schemes.find(
                            scheme => scheme.id === item.test_scheme_id
                        );
                        const usecase = scheme?.usecases.find(
                            usecase => usecase.id === item.use_case_id
                        );
                        const step = usecase?.steps.find(step => step.id === item.step_id);
                        if (step) {
                            step.status = item.result.status;
                        }
                    });

                    let planPass = true;
                    foundPlan.plan.schemes.forEach(scheme => {
                        let schemePass = true;
                        scheme.usecases.forEach(usecase => {
                            let usecasePass = true;
                            usecase.steps.forEach(step => {
                                if (!step.status) {
                                    step.status = "unknown";
                                }
                                if (step.status === "failure" || step.status === "unknown") {
                                    usecasePass = false;
                                }
                            });
                            usecase.status = usecasePass ? "success" : "failure";
                            if (!usecasePass) {
                                schemePass = false;
                            }
                        });
                        scheme.status = schemePass ? "success" : "failure";
                        if (!schemePass) {
                            planPass = false;
                        }
                    });
                    foundPlan.plan.status = planPass ? "success" : "failure";
                } catch (error) {
                    console.error("Error fetching test results:", error);
                }
            }
            setPlan(foundPlan);
        };

        fetchTestResult();
    }, [id, testPlans]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    useEffect(() => {
        console.log("plan", plan);
    }, [plan]);

    const getStatusBadge = (status?: string) => {
        const baseClass = "badge badge-lg truncate";
        switch (status) {
            case "success":
                return <span className={`${baseClass} badge-success text-white`}>成功</span>;
            case "failure":
                return <span className={`${baseClass} badge-error text-white`}>失败</span>;
            case "progress":
                return <span className={`${baseClass} badge-warning`}>进行中</span>;
            default:
                return <span className={`${baseClass} badge-ghost`}>未开始</span>;
        }
    };

    const getConnectionStatusBadge = (status: string) => {
        const baseClass = "badge";
        switch (status) {
            case "connected":
                return <span className={`${baseClass} badge-success text-white`}>已连接</span>;
            case "disconnected":
                return <span className={`${baseClass} badge-error text-white`}>未连接</span>;
            default:
                return <span className={`${baseClass} badge-ghost`}>未知</span>;
        }
    };

    const handleConnectTest = async () => {
        setIsLoading(true);
        try {
            await connectTest("mqtt", plan?.plan.deviceinfo.config.mqtt);
            // 可以添加连接成功的提示
        } catch (error) {
            // 可以添加连接失败的提示
        } finally {
            setIsLoading(false);
        }
    };

    const handleExecuteTest = async () => {
        if (!plan?.planscheme || !plan?.plan || !id) return;
        setIsLoading(true);
        try {
            resetPlanStatus(id);
            await startTestPlanAPI(id, plan.planscheme, plan.plan);
            // 可以添加执行成功的提示
        } catch (error) {
            // 可以添加执行失败的提示
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        navigate(-1);
    }

    const handleExportReport = async (type: "pdf" | "docx" | "all") => {
        if (!id) return;
        setExportLoading(true);
        try {
            if (type === "all" || type === "pdf") {
                const pdfResult = await exportTestResultAPI(id, "pdf");
                const pdfUrl = window.URL.createObjectURL(pdfResult);
                const pdfLink = document.createElement("a");
                pdfLink.href = pdfUrl;
                pdfLink.download = `${plan?.plan.name || id}_测试报告.pdf`;
                pdfLink.click();
            }

            if (type === "all" || type === "docx") {
                const docxResult = await exportTestResultAPI(id, "docx");
                const docxUrl = window.URL.createObjectURL(docxResult);
                const docxLink = document.createElement("a");
                docxLink.href = docxUrl;
                docxLink.download = `${plan?.plan.name || id}_测试报告.docx`;
                docxLink.click();
            }
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setExportLoading(false);
        }
    };

    if (!plan) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="alert alert-error w-96">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="font-bold">未找到测试方案</h3>
                        <div className="text-sm">请检查测试方案ID是否正确</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-row w-full items-center justify-between">
                <div className="flex items-start cursor-pointer hover:text-blue-700 w-fit ml-8" onClick={handleBack}>
                    <ArrowLeftIcon className="w-6 h-6" />
                    <span>返回</span>
                </div>
            </div>
            <div className="container mx-auto px-4 py-8">
                {/* Overview Card */}
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body p-6">
                        <div className="flex flex-col gap-4">
                            {/* Title Section - Made responsive */}
                            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                {/* Title and Description */}
                                <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex item from overflowing */}
                                    <h2 className="text-2xl font-bold break-words">{plan.plan.name}</h2>
                                    <p className="text-base-content/70 mt-2 break-words">
                                        {plan.planscheme.description || "暂无描述"}
                                    </p>
                                    <div className="flex flex-wrap gap-6 mt-3 text-sm text-base-content/60">
                                        <span>创建时间: {formatDate(plan.plan.createdAt)}</span>
                                        <span>更新时间: {formatDate(plan.plan.updatedAt)}</span>
                                    </div>
                                </div>

                                {/* Status and Actions - Made responsive */}
                                <div className="flex flex-col gap-4">
                                    {/* Status Badge */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-base font-medium">测试状态</span>
                                        {getStatusBadge(plan.plan.status)}
                                    </div>

                                    {/* Action Buttons - Made responsive */}
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
                                            onClick={handleExecuteTest}
                                            disabled={isLoading || plan.plan.status === 'progress'}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polygon points="5 3 19 12 5 21 5 3" />
                                            </svg>
                                            执行测试
                                        </button>

                                        <div className="dropdown dropdown-end">
                                            <label
                                                tabIndex={0}
                                                className={`btn btn-outline ${isLoading || plan.plan.status === 'progress' || exportLoading ? 'loading' : ''}`}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                    <polyline points="7 10 12 15 17 10" />
                                                    <line x1="12" y1="15" x2="12" y2="3" />
                                                </svg>
                                                导出报告
                                            </label>
                                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                                                {/* <li><a onClick={() => handleExportReport("pdf")}>导出 PDF</a></li> */}
                                                <li><a onClick={() => handleExportReport("docx")}>导出 Word</a></li>
                                                {/* <li><a onClick={() => handleExportReport("all")}>导出全部</a></li> */}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Device Info Card */}
                <div className="card bg-base-100 shadow-xl mb-8">
                    <div className="card-body">
                        <h3 className="card-title text-xl mb-4">设备信息</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <span className="font-semibold">设备名称:</span>
                                    <span className="break-words">{plan.plan.deviceinfo.name}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <span className="font-semibold">设备类型:</span>
                                    <span className="break-words">{plan.plan.deviceinfo.type}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <span className="font-semibold">协议类型:</span>
                                    <span className="break-words">{plan.plan.deviceinfo.protocol}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <span className="font-semibold">连接状态:</span>
                                    <div className="flex flex-wrap gap-3">
                                        {Object.entries(plan.plan.deviceinfo.status).map(([key, value]) => (
                                            <div key={key} className="flex items-center gap-2">
                                                <span className="badge badge-lg badge-outline">{key}</span>
                                                {getConnectionStatusBadge(value as string)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <span className="font-semibold">创建时间:</span>
                                    <span>{formatDate(plan.plan.deviceinfo.createdAt)}</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                                    <span className="font-semibold">更新时间:</span>
                                    <span>{formatDate(plan.plan.deviceinfo.updatedAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Test Schemes */}
                <div className="space-y-6">
                    {plan.plan.schemes.map((scheme, index) => (
                        <div key={index} className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="card-title text-xl mb-4">测试方案 {index + 1}</h3>
                                <SchemeTree scheme={scheme} className="w-full" controlLine={true} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default TestDetails;