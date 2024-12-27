import { Column, Entity, PrimaryColumn } from 'typeorm';
import { ConnectConfig, ConnectObject, DeviceInfo } from '../types/devices';
import { v4 as uuidv4 } from 'uuid';

@Entity('devices')
export class DeviceModel {
    @PrimaryColumn()
    id: string;

    @Column({ type: 'jsonb', nullable: true })
    info: DeviceInfo;

    @Column({ type: 'boolean', default: false })
    testing: boolean;

    constructor(data?: Partial<DeviceModel>) {
        this.id = data?.id || uuidv4();
        this.info = data?.info || {
            id: this.id,
            name: 'Default Device',
            type: 'unknown',
            protocol: 'unknown',
            config: {
                timeout: 1000,
                retry: 3
            },
            status: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        this.testing = data?.testing || false;
    }

    // 可选：添加一些辅助方法
    setConfig<T extends ConnectConfig>(configData: T) {
        this.info.config = configData;
    }

    updateStatus(newStatus: ConnectObject) {
        this.info.status = newStatus;
        this.info.updatedAt = new Date().toISOString();
    }

    setTesting(testing: boolean) {
        this.testing = testing;
    }
}