import { Entity, PrimaryColumn, Column } from 'typeorm';
import { TestPlanData } from './test-scheme.model';
import { v4 as uuidv4 } from 'uuid';

@Entity('exectest_plan')
export class TestPlanDataModel {
    @PrimaryColumn()
    id: string;

    @Column('jsonb')
    data: TestPlanData;

    @Column()
    status: string;

    @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: string;

    @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: string;

    constructor(data?: Partial<TestPlanDataModel>) {
        this.id = uuidv4();
        this.data = data?.data || {
            planscheme: {
                id: '',
                name: '',
                description: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                filepath: []
            },
            plan: {
                id: '',
                name: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                deviceinfo: {
                    id: '',
                    name: '',
                    type: '',
                    protocol: '',
                    config: {
                        timeout: 0,
                        retry: 0
                    },
                    status: {},
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                },
                schemes: []
            }
        };
        this.status = data?.status || 'unknown';
        this.createdAt = data?.createdAt || new Date().toISOString();
        this.updatedAt = data?.updatedAt || new Date().toISOString();
    }
}