import { WebSocketService } from './websocket';
let globalWebsocketService: WebSocketService;

export function initWebSocketService(service: WebSocketService) {
    globalWebsocketService = service;
}

export function getWebSocketService(): WebSocketService {
    if (!globalWebsocketService) {
        throw new Error('WebSocket 服务未初始化');
    }
    return globalWebsocketService;
}