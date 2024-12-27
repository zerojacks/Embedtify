import React, { useEffect, useState } from "react";
import { ArrowLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TestPlanScheme } from "@/types/testplan";
import PlanSchemeInfo from "@/components/PlanSchemeInfo";

const TestPlanCreate = () => {
    const [plan, setPlan] = useState<TestPlanScheme | null>(null);

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    }

    useEffect(() => {
        if (plan === null) {
            setPlan({
                id: `plan-${Date.now()}`,
                name: '',
                description: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                filepath: []
            });
        }
    }, []);

    const handleSavePlan = (plan: TestPlanScheme) => {
        setPlan(plan);
    }

    const handleCancelPlan = () => {
        console.log('cancel plan');
    }

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-row w-full items-center justify-between">
                <div className="flex items-start cursor-pointer hover:text-blue-700 w-fit" onClick={handleBack}>
                    <ArrowLeftIcon className="w-6 h-6" />
                    <span>返回</span>
                </div>
            </div>
            <div className="flex flex-col items-center">
                {plan && <PlanSchemeInfo planScheme={plan} onSave={handleSavePlan} isEdit={true} />}
            </div>
        </div>
    )
}

export default TestPlanCreate;