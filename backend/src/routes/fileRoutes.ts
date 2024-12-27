import { Router, Request, Response } from 'express';
import { Logger } from '../utils/logger';
import { FileManager } from '../managers/file-manager';
import multer from 'multer'; // For handling multipart/form-data
import path from 'path';
import fs from 'fs';

const configPath = path.join(__dirname, '../config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const router = Router();
const fileManager = new FileManager(config.folder.basefolder + config.folder.planfolder);
const upload = multer({ storage: multer.memoryStorage() }); // Configure multer as needed

console.log(upload);

router.post('/files/upload/', upload.array('files'), async (req: Request, res: Response) => {
    try {
        const files = req.files as Express.Multer.File[];
        // 从 body 中获取目录信息
        const directory = req.body.directory || ''; // 如果未提供目录，则使用空字符串（根目录）
        
        Logger.info(`Uploading files to directory: ${directory}`);
        
        const filePaths = await Promise.all(files.map(async file => {
            const decodedFilename = decodeURIComponent(file.originalname);
            return await fileManager.uploadFile(file, decodedFilename, directory);
        }));

        res.status(200).json({
            success: true,
            files: filePaths
        });
    } catch (error) {
        if (error instanceof Error) {
            Logger.error('Failed to upload file', error);
        } else {
            Logger.error('Failed to upload file', new Error('Unknown error'));
        }
        res.status(500).json({
            success: false,
            error: 'Failed to upload file'
        });
    }
});

router.get('/files/:filepath', async (req: Request, res: Response) => {
    try {
        const filepath = req.params.filepath;
        const file = await fileManager.getFile(filepath);
        res.status(200).json(file);
    } catch (error) {
        if (error instanceof Error) {
            Logger.error('Failed to get file', error);
        } else {
            Logger.error('Failed to get file', new Error('Unknown error'));
        }
        res.status(500).send('Failed to get file.');
    }
});

router.delete('/files/:filepath', async (req: Request, res: Response) => {
    try {
        const filepath = req.params.filepath;
        await fileManager.deleteFile(filepath);
        res.status(200).send('File deleted successfully.');
    } catch (error) {
        if (error instanceof Error) {
            Logger.error('Failed to delete file', error);
        } else {
            Logger.error('Failed to delete file', new Error('Unknown error'));
        }
        res.status(500).send('Failed to delete file.');
    }
});

router.put('/files/:filepath', async (req: Request, res: Response) => {
    try {
        const file = req.body; // Assuming file comes in the body, adjust as needed
        const filepath = req.params.filepath;
        await fileManager.updateFile(filepath, file);
        res.status(200).send('File updated successfully.');
    } catch (error) {
        if (error instanceof Error) {
            Logger.error('Failed to update file', error);
        } else {
            Logger.error('Failed to update file', new Error('Unknown error'));
        }
        res.status(500).send('Failed to update file.');
    }
});

export default router;