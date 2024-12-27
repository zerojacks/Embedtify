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
    qos: number;
}

export interface BluetoothConnectConfig {
    bluetoothname: string;
    channel: number;
    name: string;
}

export interface SshConnectConfig {
    ip: string;
    port: number;
    username: string;
    password: string;
}

export interface SftpConnectConfig {
    ip: string;
    port: number;
    username: string;
    password: string;
}

export interface ConnectConfig {
    timeout: number;
    retry: number;
    tcp?: TcpConnectConfig;
    udp?: UdpConnectConfig;
    serial?: SerialConnectConfig;
    mqtt?: MqttConnectConfig;
    bluetooth?: BluetoothConnectConfig;
    ssh?: SshConnectConfig;
    sftp?: SftpConnectConfig;
}

export type ConnectionStatus = 'connected' | 'disconnected' | 'connecting' | 'error';


export interface SaveDeviceInfo {
    id: string;
    info: DeviceInfo;
    testing: boolean;
}
