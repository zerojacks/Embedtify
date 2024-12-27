import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    sendMessage: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    sendMessage: () => { },
});

export const SocketProvider: React.FC<{
    url: string;
    options?: any;
    children: React.ReactNode
}> = ({ url, options = {}, children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // 使用 useRef 存储 options，避免每次渲染都创建新对象
    const optionsRef = useRef(options);

    const createSocket = useCallback(() => {
        // 使用 ref 中的 options
        const newSocket = io(url, {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        const handleConnect = () => {
            setIsConnected(true);
        };

        const handleDisconnect = () => {
            setIsConnected(false);
        };

        const handleConnectError = (error: any) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        };

        newSocket.on('connect', handleConnect);
        newSocket.on('disconnect', handleDisconnect);
        newSocket.on('connect_error', handleConnectError);

        return {
            socket: newSocket,
            cleanup: () => {
                newSocket.off('connect', handleConnect);
                newSocket.off('disconnect', handleDisconnect);
                newSocket.off('connect_error', handleConnectError);
                newSocket.disconnect();
            }
        };
    }, [url]);  // 移除 options 依赖

    // 使用单独的 useEffect 管理 socket 创建和清理
    useEffect(() => {
        const { socket: newSocket, cleanup } = createSocket();
        setSocket(newSocket);

        return () => {
            cleanup();
        };
    }, [createSocket]);

    // 使用 useCallback 稳定 sendMessage 函数
    const sendMessage = useCallback((event: string, data: any) => {
        if (socket && isConnected) {
            socket.emit(event, data);
        } else {
            console.warn('Socket not connected, cannot send message');
        }
    }, [socket, isConnected]);

    // 使用 useMemo 稳定 context 值
    const contextValue = useMemo(() => ({
        socket,
        isConnected,
        sendMessage
    }), [socket, isConnected, sendMessage]);

    return (
        <SocketContext.Provider value={contextValue}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);

    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }

    return context;
};