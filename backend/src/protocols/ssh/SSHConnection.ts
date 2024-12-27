// backend/src/protocols/ssh/SSHConnection.ts
import { SSHConnection } from '../Connection';
import { SshConnectConfig } from '../../types/devices';
import { Client } from 'ssh2';
import fs from 'fs';

export class SSHConnectionImpl implements SSHConnection {
    private config: SshConnectConfig;
    private client: Client;

    constructor(config: SshConnectConfig) {
        this.config = config;
        this.client = new Client();
    }

    async connect(): Promise<boolean> {
        console.log("connect", this.config);
        return new Promise((resolve, reject) => {
            this.client
                .on('ready', () => {
                    console.log('SSH Client :: ready');
                    resolve(true);
                })
                .on('error', (err) => {
                    console.error('SSH connection error:', err);
                    reject(err);
                })
                .connect({
                    host: this.config.ip,
                    port: this.config.port,
                    username: this.config.username,
                    password: this.config.password,
                    debug: (msg) => console.log('SSH Debug:', msg)
                });
        });
    }

    async disconnect(): Promise<void> {
        // this.client.dispose();
    }

    async execute(command: string): Promise<Buffer> {
        console.log("execute", command);
        return new Promise((resolve, reject) => {
            if (!this.client) {
                return reject(new Error('SSH client is not connected'));
            }
            this.client.exec(command, (err, stream) => {
                if (err) {
                    console.error('Execution error:', err);
                    return reject(err);
                }
                let result = '';
                stream.on('data', (data: Buffer) => {
                    result += data.toString();
                }).on('close', () => {
                    resolve(Buffer.from(result));
                }).stderr.on('data', (data) => {
                    console.error('STDERR:', data.toString());
                });
            });
        });
    }

    async send(data: Buffer): Promise<void> {
        throw new Error('SSHConnection does not support send');
    }

    async receive(): Promise<Buffer> {
        return Buffer.from([]);
    }

    async sendAndReceive(data: string, timeout: number): Promise<Buffer> {
        throw new Error('SSHConnection does not support sendAndReceive');
    }
}