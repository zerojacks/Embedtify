import { Repository } from 'typeorm';
import { TestResultModel } from '../models/test-result.model';
import { DatabaseManager } from '../managers/database-manager';
import path from 'path';
import fs from 'fs';
import { FileManager } from '../managers/file-manager';
import { TestedResult } from '../types/testresult';

export class TestResultService {
    private testResultRepository!: Repository<TestResultModel>;

    constructor() {
        this.initRepository();
    }

    private async initRepository() {
        const dataSource = await DatabaseManager.getInstance();
        this.testResultRepository = dataSource.getRepository(TestResultModel);
    }

    async create(data: TestResultModel): Promise<Boolean> {
        if (!this.testResultRepository) {
            await this.initRepository();
        }
        const testResult = this.testResultRepository.create(data);
        const result = await this.testResultRepository.save(testResult);
        if (!result) {
            return false;
        }
        return true;
    }

    async findById(id: string): Promise<TestResultModel[] | null> {
        if (!this.testResultRepository) {
            await this.initRepository();
        }
        return await this.testResultRepository.find({ where: { id } });
    }

    async findAll(): Promise<TestResultModel[]> {
        if (!this.testResultRepository) {
            await this.initRepository();
        }
        return await this.testResultRepository.find();
    }

    async findAllTestedResult(): Promise<TestedResult[]> {
        if (!this.testResultRepository) {
            await this.initRepository();
        }
        
        return await this.testResultRepository
            .createQueryBuilder('test_results')
            .select([
                'test_results.id',
                'test_results.test_plan_id'
            ])
            .distinct(true)
            .orderBy('test_results.id')
            .getRawMany()
            .then(results => results.map(result => ({
                id: result.test_results_id,
                test_plan_id: result.test_results_test_plan_id
            })));
    }
    
    async update(id: string, data: Partial<TestResultModel>): Promise<Boolean> {
        if (!this.testResultRepository) {
            await this.initRepository();
        }
        await this.testResultRepository.update(id, {
            ...data,
        });
        return true;
    }

    async delete(id: string): Promise<boolean> {
        if (!this.testResultRepository) {
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
        const result2 = await this.testResultRepository.delete(id);
        return result2.affected !== 0;
    }
}