import { getTestPlan } from "@/api/TestAPI";
import PlanSchemeInfo from "@/components/PlanSchemeInfo";
import { TestPlanScheme } from "@/types/testplan";
import { ArrowLeftIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const TestPlanInfo = () => {
    const { id } = useParams();
    const [plan, setPlan] = useState<TestPlanScheme | null>(null);
    const navigate = useNavigate();
    useEffect(() => {
        if (id) {
            getTestPlan(id).then(setPlan);
        } else {
            setPlan(null);
        }
    }, [id]);

    const handleSavePlan = (plan: TestPlanScheme) => {
        setPlan(plan);
    }

    const handleBack = () => {
        navigate(-1);
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
                {plan && <PlanSchemeInfo planScheme={plan} onSave={handleSavePlan} isEdit={false} />}
            </div>
        </div>
    )
}

export default TestPlanInfo;
