import { Entity, PrimaryColumn, Column } from 'typeorm';
import { TestResult } from './test-scheme.model';
@Entity('test_results')
export class TestResultModel {
    @PrimaryColumn()
    id: string;

    @PrimaryColumn()
    test_plan_id: string;

    @PrimaryColumn()
    test_scheme_id: string;

    @PrimaryColumn()
    use_case_id: string;

    @PrimaryColumn()
    step_id: string;

    @Column('jsonb')
    result: TestResult;

    @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
    executed_at: string;

    constructor(data?: Partial<TestResultModel>) {
        this.id = data?.id || '';
        this.test_plan_id = data?.test_plan_id || '';
        this.test_scheme_id = data?.test_scheme_id || '';
        this.use_case_id = data?.use_case_id || '';
        this.step_id = data?.step_id || '';
        this.result = data?.result || {
            senddata: '',
            receivedata: '',
            expecteddata: '',
            time: new Date().toISOString(),
            port: '',
            type: ''
        };
        this.executed_at = data?.executed_at || new Date().toISOString();
    }
}