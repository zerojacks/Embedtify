import { DataSource } from 'typeorm';
import { databaseConfig } from '../config/database.config';

export class DatabaseManager {
    private static instance: DataSource;

    private constructor() { }

    public static async getInstance(): Promise<DataSource> {
        if (!this.instance) {
            this.instance = new DataSource(databaseConfig);
            await this.instance.initialize();
        }
        return this.instance;
    }

    public static async closeConnection(): Promise<void> {
        if (this.instance) {
            await this.instance.destroy();
        }
    }
}