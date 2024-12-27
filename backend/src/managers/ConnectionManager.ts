import { Connection, SFTPConnection, SSHConnection } from '../protocols/Connection';
import { MQTTConnection } from '../protocols/mqtt/MQTTConnection';
import { TCPConnection } from '../protocols/tcp/TCPConnection';
import { UDPConnection } from '../protocols/udp/UDPConnection';
import { SerialConnection } from '../protocols/serial/SerialConnection';
import { BluetoothConnection } from '../protocols/bluetooth/BluetoothConnection';
import { SFTPConnectionImpl } from '../protocols/sftp/SFTPConnection';
import { SSHConnectionImpl } from '../protocols/ssh/SSHConnection';

export class ConnectionManager {
    private connections: Map<string, Connection> = new Map();

    async addConnection(type: string, config: any): Promise<boolean> {
        console.log("addConnection", type, config);
        let connection: Connection;
        switch (type) {
            case 'mqtt':
                connection = new MQTTConnection(config);
                break;
            case 'tcp':
                connection = new TCPConnection(config);
                break;
            case 'udp':
                connection = new UDPConnection(config);
                break;
            case 'serial':
                connection = new SerialConnection(config);
                break;
            case 'bluetooth':
                connection = new BluetoothConnection(config);
                break;
            case 'sftp':
                connection = new SFTPConnectionImpl(config);
                break;
            case 'ssh':
                connection = new SSHConnectionImpl(config);
                break;
            default:
                throw new Error('Unsupported connection type ' + type);
        }
        const result = await connection.connect();
        console.log("connection", connection);
        this.connections.set(type, connection);
        return result;
    }

    async isConnectionExists(type: string): Promise<boolean> {
        return this.connections.has(type);
    }

    async removeConnection(type: string): Promise<void> {
        const connection = this.connections.get(type);
        if (connection) {
            await connection.disconnect();
            this.connections.delete(type);
        }
    }

    async send(type: string, data: Buffer): Promise<void> {
        const connection = this.connections.get(type);
        if (connection) {
            await connection.send(data);
        }
    }

    async receive(type: string): Promise<Buffer> {
        const connection = this.connections.get(type);
        if (connection) {
            return await connection.receive();
        }
        throw new Error('Connection not found');
    }

    async sendAndReceive(type: string, data: string, timeout: number): Promise<Buffer> {
        const connection = this.connections.get(type);
        if (connection) {
            return await connection.sendAndReceive(data, timeout);
        }
        throw new Error('Connection not found');
    }

    async execute(type: string, command: string): Promise<Buffer> {
        const connection = this.connections.get(type);
        if (connection && type === 'ssh') {
            const sshConnection = connection as SSHConnection;
            console.log("sshConnection", sshConnection);
            return await sshConnection.execute(command);
        }
        throw new Error('Connection not found or unsupported operation');
    }

    async upload(type: string, localPath: string, remotePath: string): Promise<[boolean, string]> {
        try {
            const connection = this.connections.get(type);
            if (connection && type === 'sftp') {
                const sftpConnection = connection as SFTPConnection;
                const result = await sftpConnection.upload(localPath, remotePath);
                return [result, ''];
            }
            return [false, 'Connection not found or unsupported operation'];
        } catch (error: any) {
            return [false, error.message];
        }
    }

    async download(type: string, filePath: string, destination: string): Promise<[boolean, string]> {
        try {
            const connection = this.connections.get(type);
            if (connection && type === 'sftp') {
                const sftpConnection = connection as SFTPConnection;
                const result = await sftpConnection.download(filePath, destination);
                return [result, ''];
            }
            return [false, 'Connection not found or unsupported operation'];
        } catch (error: any) {
            return [false, error.message];
        }
    }

    async listen(id: string, type: string, expectedResult: string, timeout: number, callback: (id: string, data: Buffer) => void): Promise<Buffer> {
        const connection = this.connections.get(type);
        if (connection && type === 'mqtt') {
            const mqttConnection = connection as MQTTConnection;
            return await mqttConnection.listen(id, expectedResult, timeout, callback);
        }
        throw new Error('Connection not found or unsupported operation');
    }

    async unlisten(type: string, id: string): Promise<void> {
        const connection = this.connections.get(type);
        if (connection && type === 'mqtt') {
            const mqttConnection = connection as MQTTConnection;
            mqttConnection.unlisten(id);
        }
    }
    async disconnectAll(): Promise<void> {
        for (const connection of this.connections.values()) {
            await connection.disconnect();
        }
    }
} 