import { DataSourceOptions } from 'typeorm';
import { TestPlanModel } from '../models/test-plan.model';
import { DeviceModel } from '../models/device.model';
import { TestResultModel } from '../models/test-result.model';
import { TestPlanDataModel } from '../models/exectest-plan.model';
export const databaseConfig: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'embedtest',
    database: process.env.DB_NAME || 'embedtest',
    entities: [TestPlanModel, DeviceModel, TestResultModel, TestPlanDataModel],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV !== 'production'
};