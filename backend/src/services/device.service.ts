import { Repository } from 'typeorm';
import { DeviceModel } from '../models/device.model';
import { DatabaseManager } from '../managers/database-manager';
import { DeviceInfo } from '@/types/devices';

export class DeviceService {
    private deviceRepository!: Repository<DeviceModel>;

    constructor() {
        this.initRepository();
    }

    private async initRepository() {
        const dataSource = await DatabaseManager.getInstance();
        this.deviceRepository = dataSource.getRepository(DeviceModel);
    }

    async getAllDevices(): Promise<DeviceModel[]> {
        if (!this.deviceRepository) {
            await this.initRepository();
        }
        return this.deviceRepository.find();
    }

    async getDeviceById(id: string): Promise<DeviceModel | null> {
        if (!this.deviceRepository) {
            await this.initRepository();
        }
        return this.deviceRepository.findOneBy({ id });
    }

    async createDevice(device: DeviceInfo): Promise<DeviceModel> {
        if (!this.deviceRepository) {
            await this.initRepository();
        }
        const newDevice = new DeviceModel({
            id: device.id,
            info: device,
            testing: false
        });
        return this.deviceRepository.save(newDevice);
    }

    async updateDevice(device: DeviceModel): Promise<DeviceModel> {
        if (!this.deviceRepository) {
            await this.initRepository();
        }
        return this.deviceRepository.save(device);
    }

    async deleteDevice(id: string): Promise<void> {
        if (!this.deviceRepository) {
            await this.initRepository();
        }
        await this.deviceRepository.delete(id);
    }

    async setTesting(id: string, testing: boolean): Promise<void> {
        if (!this.deviceRepository) {
            await this.initRepository();
        }
        const device = await this.deviceRepository.findOneBy({ id });
        if (device) {
            device.setTesting(testing);
            await this.deviceRepository.save(device);
        }
    }
}