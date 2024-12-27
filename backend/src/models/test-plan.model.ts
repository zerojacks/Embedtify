import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('test_plans')
export class TestPlanModel {
    @PrimaryColumn()
    id: string;

    @Column()
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
    createdAt: string;

    @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: string;

    @Column('jsonb')
    filepath: string[];

    constructor(data?: Partial<TestPlanModel>) {
        this.id = data?.id || 'default-id';
        this.name = data?.name || 'default-name';
        this.description = data?.description || 'default-description';
        this.createdAt = data?.createdAt || new Date().toISOString();
        this.updatedAt = data?.updatedAt || new Date().toISOString();
        this.filepath = data?.filepath || [];
    }
}