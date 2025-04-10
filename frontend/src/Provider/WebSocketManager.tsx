import { FC, ReactNode, useEffect } from 'react';
import { SocketProvider } from './webProvider';
import { useTestPlanWebSocket } from '@/hooks/useTestPlanWebSocket';
import { ExecTestedPlanData, ExectestPlan } from '@/types/testplan';
import { getAllExecutedPlanAPI } from '@/api/PlanAPI';
import { useTestingStore } from '@/stores/useTestingStore';

interface WebSocketManagerProps {
    children: ReactNode;
    url: string;
}
const WebSocketListener: FC = () => {
    useTestPlanWebSocket();
    return null;
};
export const WebSocketManager: FC<WebSocketManagerProps> = ({ children, url }) => {
    const { testPlans, addTestPlan } = useTestingStore();
    useEffect(() => {
        async function fetchTestedResult() {
            try {
                const result: ExecTestedPlanData = await getAllExecutedPlanAPI();
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
            }
        }
        fetchTestedResult();
    }, []);
    
    return (
        <SocketProvider url={url}>
            <WebSocketListener />
            {children}
        </SocketProvider>
    );
};