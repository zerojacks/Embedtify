import { FC, ReactNode } from 'react';
import { SocketProvider } from './webProvider';
import { useTestPlanWebSocket } from '@/hooks/useTestPlanWebSocket';

interface WebSocketManagerProps {
    children: ReactNode;
    url: string;
}
const WebSocketListener: FC = () => {
    useTestPlanWebSocket();
    return null;
};
export const WebSocketManager: FC<WebSocketManagerProps> = ({ children, url }) => {
    return (
        <SocketProvider url={url}>
            <WebSocketListener />
            {children}
        </SocketProvider>
    );
};