declare module 'react' {
    interface Window {
        showOpenFilePicker(options?: {
            multiple?: boolean;
            types?: Array<{
                description?: string;
                accept: Record<string, string[]>;
            }>;
        }): Promise<FileSystemFileHandle[]>;
    }

    interface FileSystemFileHandle {
        kind: 'file' | 'directory';
        name: string;
        getFile(): Promise<File>;
    }
}