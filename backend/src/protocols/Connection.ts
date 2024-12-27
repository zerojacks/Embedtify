export interface Connection {
    connect(): Promise<boolean>;
    disconnect(): Promise<void>;
    send(data: Buffer): Promise<void>;
    receive(): Promise<Buffer>;
    sendAndReceive(data: string, timeout: number): Promise<Buffer>;
}

export interface MQTTConnection extends Connection {
    listen(expectedResult: string, timeout: number, callback: (data: Buffer) => void): Promise<Buffer>;
    unlisten(): Promise<void>;
}

export interface SSHConnection extends Connection {
    execute(command: string): Promise<Buffer>;
}

export interface SFTPConnection extends Connection {
    upload(localPath: string, remotePath: string): Promise<boolean>;
    download(filePath: string, destination: string): Promise<boolean>;
}