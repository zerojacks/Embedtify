// src/core/interfaces/protocol.interface.ts
export enum ProtocolType {
    TCP = 'tcp',
    SERIAL = 'serial',
    MQTT = 'mqtt',
    BLUETOOTH = 'bluetooth'
}

export interface IProtocol {
    type: ProtocolType;
    connect(options?: ConnectionOptions): Promise<boolean>;
    disconnect(): Promise<void>;
    send(message: Message): Promise<void>;
    receive(): Promise<Message>;
    validateMessage(message: Message): boolean;
}

export interface ConnectionOptions {
    timeout?: number;
    retryCount?: number;
    authentication?: AuthenticationCredentials;
}