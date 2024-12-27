import { Repository } from 'typeorm';
import { TestPlanModel } from '../models/test-plan.model';
import { DatabaseManager } from '../managers/database-manager';
import path from 'path';
import fs from 'fs';
import { FileManager } from '../managers/file-manager';

export class TestPlanService {
    private testPlanRepository!: Repository<TestPlanModel>;

    constructor() {
        this.initRepository();
    }

    private async initRepository() {
        const dataSource = await DatabaseManager.getInstance();
        this.testPlanRepository = dataSource.getRepository(TestPlanModel);
    }

    async create(data: TestPlanModel): Promise<Boolean> {
        if (!this.testPlanRepository) {
            await this.initRepository();
        }
        const testPlan = this.testPlanRepository.create(data);
        const result = await this.testPlanRepository.save(testPlan);
        if (!result) {
            return false;
        }
        return true;
    }

    async findById(id: string): Promise<TestPlanModel | null> {
        if (!this.testPlanRepository) {
            await this.initRepository();
        }
        return await this.testPlanRepository.findOne({ where: { id } });
    }

    async findAll(): Promise<TestPlanModel[]> {
        if (!this.testPlanRepository) {
            await this.initRepository();
        }
        return await this.testPlanRepository.find();
    }

    async update(id: string, data: Partial<TestPlanModel>): Promise<TestPlanModel | null> {
        if (!this.testPlanRepository) {
            await this.initRepository();
        }
        await this.testPlanRepository.update(id, {
            ...data,
            updatedAt: new Date().toISOString()
        });
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        if (!this.testPlanRepository) {
            await this.initRepository();
        }
        // 需要先删除方案保存的文件
        const configPath = path.join(__dirname, '../config.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

        const fileManager = new FileManager(config.folder.basefolder + config.folder.planfolder);
        const result = await fileManager.deleteDirectory(id);
        if (!result) {
            return false;
        }
        const result2 = await this.testPlanRepository.delete(id);
        return result2.affected !== 0;
    }
}