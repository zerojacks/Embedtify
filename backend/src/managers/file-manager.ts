import fs from 'fs';
import path from 'path';

export class FileManager {
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath; // Adjust the path as necessary
        if (!fs.existsSync(this.basePath)) {
            fs.mkdirSync(this.basePath, { recursive: true });
        }
    }

    async uploadFile(file: Express.Multer.File, filename: string, directory: string): Promise<string> {
        const safePath = path.normalize(directory).replace(/^(\.\.(\/|\\|$))+/, '');
        const dirPath = path.join(this.basePath, safePath);
        console.log("dirPath", dirPath);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        const filePath = path.join(dirPath, filename);
        await fs.promises.writeFile(filePath, file.buffer);
        return filePath;
    }

    async getFile(filepath: string): Promise<Buffer> {
        const fullPath = path.join(this.basePath, filepath);
        return fs.promises.readFile(fullPath);
    }

    async deleteFile(filepath: string): Promise<void> {
        const fullPath = path.join(this.basePath, filepath);
        await fs.promises.unlink(fullPath);
    }

    async updateFile(filepath: string, file: Express.Multer.File): Promise<void> {
        const fullPath = path.join(this.basePath, filepath);
        await fs.promises.writeFile(fullPath, file.buffer);
    }

    async deleteDirectory(directory: string): Promise<boolean> {
        const dirPath = path.join(this.basePath, directory);
        try {
            await fs.promises.rm(dirPath, { recursive: true });
            return true;
        } catch (error) {
            return false;
        }
    }
} 