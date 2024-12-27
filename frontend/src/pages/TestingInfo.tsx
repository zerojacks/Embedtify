import { useTestingStore } from "@/stores/useTestingStore";
import { TestPlanScheme } from "@/types/testplan";
import { useEffect, useState } from "react";

const TestingInfo = () => {

    const { testPlans } = useTestingStore();
    
    useEffect(() => {
        console.log("Testing");
    }, []);

    return <div>TestingInfo</div>;
}

export default TestingInfo;