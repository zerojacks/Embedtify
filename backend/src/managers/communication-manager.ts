// src/managers/communication-manager.ts
export class CommunicationManager {
    private protocols: Map<string, any> = new Map();

    constructor() {
        // 初始化协议
    }

    getProtocol(type: string) {
        return this.protocols.get(type);
    }

    registerProtocol(type: string, protocol: any) {
        this.protocols.set(type, protocol);
    }
}