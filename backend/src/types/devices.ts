export type ConnectionStatus = 'connected' | 'connecting' | 'error' | 'disconnected';
export type QoS = 0 | 1 | 2;

export interface SshConnectConfig {
    ip: string;
    port: number;
    username: string;
    password: string;
}

export interface ConnectObject {
    [key: string]: ConnectionStatus;
}

export interface DeviceInfo {
    id: string;
    name: string;
    type: string;
    protocol: string;
    config: ConnectConfig;
    status: ConnectObject;
    createdAt: string;
    updatedAt: string;
}

export interface DeviceConnectResult {
    device: DeviceInfo;
    connectResult: Map<string, any>;
}

export interface TcpConnectConfig {
    ip: string;
    port: number;
    username: string;
    password: string;
}

export interface UdpConnectConfig {
    ip: string;
    port: number;
}

export interface SerialConnectConfig {
    comnumber: string;
    baudrate: number;
    databits: number;
    stopbits: number;
    parity: string;
}

export interface MqttConnectConfig {
    ip: string;
    port: number;
    username: string;
    password: string;
    mqttversion: string;
    clientid: string;
    topic: string;
    qos: QoS;
}

export interface BluetoothConnectConfig {
    bluetoothname: string;
    channel: number;
    name: string;
}

export interface ConnectConfig {
    timeout: number;
    retry: number;
    tcp?: TcpConnectConfig;
    udp?: UdpConnectConfig;
    serial?: SerialConnectConfig;
    mqtt?: MqttConnectConfig;
    bluetooth?: BluetoothConnectConfig;
    sftp?: SshConnectConfig;
    ssh?: SshConnectConfig;
}
