import { Server as SocketIOServer } from 'socket.io';
import { Logger } from './utils/logger';

export class WebSocketService {
    private io: SocketIOServer;

    constructor(httpServer: any) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: ["http://localhost:5173"],
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                allowedHeaders: ['Content-Type', 'Authorization'],
                credentials: true
            }
        });

        this.setupConnectionHandlers();
    }

    private setupConnectionHandlers() {
        this.io.on('connection', (socket) => {
            Logger.info('A user connected');
            socket.on('disconnect', () => {
                Logger.info('User disconnected');
            });
        });
    }

    public broadcast(event: string, data: any) {
        if (!this.io) {
            Logger.error('WebSocketService is not initialized');
            return;
        }
        this.io.emit(event, data);
    }

    // 发送给特定客户端
    public sendToClient(clientId: string, event: string, data: any) {
        const socket = Array.from(this.io.sockets.sockets.values())
            .find(s => s.id === clientId);

        if (socket) {
            socket.emit(event, data);
        }
    }

    // 获取 SocketIO 实例（如果需要更高级的操作）
    public getIO(): SocketIOServer {
        return this.io;
    }
} 