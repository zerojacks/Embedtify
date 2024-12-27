import { Repository } from 'typeorm';
import { TestPlanDataModel } from '../models/exectest-plan.model';
import { DatabaseManager } from '../managers/database-manager';
import path from 'path';
import fs from 'fs';
import { FileManager } from '../managers/file-manager';

export class ExectestService {
    private exectestPlanRepository!: Repository<TestPlanDataModel>;

    constructor() {
        this.initRepository();
    }

    private async initRepository() {
        const dataSource = await DatabaseManager.getInstance();
        this.exectestPlanRepository = dataSource.getRepository(TestPlanDataModel);
    }

    async create(data: TestPlanDataModel): Promise<{ success: boolean; id: string }> {
        if (!this.exectestPlanRepository) {
            await this.initRepository();
        }
        const exectestPlan = this.exectestPlanRepository.create(data);
        const result = await this.exectestPlanRepository.save(exectestPlan);
        if (!result) {
            return { success: false, id: "" };
        }
        return { success: true, id: result.id };
    }

    async findById(id: string): Promise<TestPlanDataModel | null> {
        if (!this.exectestPlanRepository) {
            await this.initRepository();
        }
        return await this.exectestPlanRepository.findOne({ where: { id } });
    }

    async findAll(options?: {
        page?: number;
        pageSize?: number;
        orderBy?: 'createdAt' | 'updatedAt';
        order?: 'ASC' | 'DESC';
    }): Promise<{ 
        data: TestPlanDataModel[];
        total: number;
        page?: number;
        pageSize?: number;
    }> {
        try {
            if (!this.exectestPlanRepository) {
                await this.initRepository();
            }
    
            const queryBuilder = this.exectestPlanRepository.createQueryBuilder('testPlan');
    
            // Apply ordering
            if (options?.orderBy) {
                queryBuilder.orderBy(`testPlan.${options.orderBy}`, options.order || 'DESC');
            }
    
            // Get total count
            const total = await queryBuilder.getCount();
    
            // Apply pagination
            if (options?.page && options?.pageSize) {
                queryBuilder
                    .skip((options.page - 1) * options.pageSize)
                    .take(options.pageSize);
            }
    
            const data = await queryBuilder.getMany();
    
            return {
                data,
                total,
                page: options?.page,
                pageSize: options?.pageSize
            };
        } catch (error) {
            console.error('Error in findAll:', error);
            throw new Error('Failed to fetch test plans');
        }
    }

    async update(id: string, data: Partial<TestPlanDataModel>): Promise<TestPlanDataModel | null> {
        if (!this.exectestPlanRepository) {
            await this.initRepository();
        }
        await this.exectestPlanRepository.update(id, {
            ...data,
        });
        return this.findById(id);
    }

    async delete(id: string): Promise<boolean> {
        if (!this.exectestPlanRepository) {
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
        const result2 = await this.exectestPlanRepository.delete(id);
        return result2.affected !== 0;
    }
}