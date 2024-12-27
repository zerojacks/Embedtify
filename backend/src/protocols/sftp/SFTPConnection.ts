// backend/src/protocols/sftp/SFTPConnection.ts
import { SFTPConnection } from '../Connection';
import { Client, SFTPWrapper } from 'ssh2';
import { SshConnectConfig } from '../../types/devices';

export class SFTPConnectionImpl implements SFTPConnection {
    private config: SshConnectConfig;
    private client: Client;
    private sftp: SFTPWrapper | null = null;

    constructor(config: SshConnectConfig) {
        this.config = config;
        this.client = new Client();
    }

    async connect(): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.client.on('ready', () => {
                this.client.sftp((err, sftp) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.sftp = sftp;
                        resolve(true);
                    }
                });
            }).on('error', (err) => {
                console.error('SFTP connection error:', err);
                reject(err);
            }).connect({
                host: this.config.ip,
                port: this.config.port,
                username: this.config.username,
                password: this.config.password,
                debug: (msg) => console.log('SSH Debug:', msg)
            });
        });
    }

    async disconnect(): Promise<void> {
        this.client.end();
    }

    async send(data: Buffer): Promise<void> {
        throw new Error('SFTPConnection does not support send');
    }

    async receive(): Promise<Buffer> {
        throw new Error('SFTPConnection does not support receive');
    }

    async sendAndReceive(data: string, timeout: number): Promise<Buffer> {
        throw new Error('SFTPConnection does not support sendAndReceive');
    }

    async execute(command: string): Promise<Buffer> {
        throw new Error('SFTPConnection does not support execute');
    }

    async upload(localPath: string, remotePath: string): Promise<boolean> {
        console.log("sftpupload", localPath, remotePath);
        return new Promise((resolve, reject) => {
            if (this.sftp) {
                console.log("upload", localPath, remotePath);
                this.sftp.fastPut(localPath, remotePath, (err) => {
                    if (err) {
                        console.error('Upload failed:', err.message);
                        reject(err);
                    } else {
                        console.log('Upload successful');
                        resolve(true);
                    }
                });
            } else {
                reject(new Error('SFTP not initialized'));
            }
        });
    }

    async download(filePath: string, destination: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (this.sftp) {
                this.sftp.fastGet(filePath, destination, (err) => {
                    if (err) reject(err);
                    else resolve(true);
                });
            } else {
                reject(new Error('SFTP not initialized'));
            }
        });
    }
}