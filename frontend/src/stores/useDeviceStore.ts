import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DeviceInfo, ConnectionStatus, SaveDeviceInfo } from '../types/device';
import { getDevices } from '@/api/DeviceAPI';

interface DeviceState {
    devices: SaveDeviceInfo[];
    // Actions
    addDevices: (devices: SaveDeviceInfo[]) => void;
    addDevice: (device: SaveDeviceInfo) => void;
    updateDevice: (device: SaveDeviceInfo) => void;
    deleteDevice: (deviceId: string) => void;
    resetDevices: () => Promise<void>;
    initDevices: () => Promise<void>;
    isDeviceExist: (deviceId: string) => boolean;
}

export const useDeviceStore = create<DeviceState>()(
    devtools((set, get) => ({
        devices: [],

        initDevices: async () => {
            const devices = await getDevices();
            set(() => ({
                devices: devices.map(device => device),
            }));
        },

        resetDevices: async () => {
            set(() => ({
                devices: [],
            }));
        },

        isDeviceExist: (deviceId: string) => {
            return get().devices.some(device => device.id === deviceId);
        },

        addDevices: (devices) => set((state) => ({
            devices: [...state.devices, ...devices],
        })),

        addDevice: (device) => set((state) => ({
            devices: [...state.devices, device],
        })),

        updateDevice: (device) => set((state) => ({
            devices: state.devices.map((d) =>
                d.id === device.id ? device : d
            )
        })),

        deleteDevice: (deviceId) => set((state) => ({
            devices: state.devices.filter((d) => d.id !== deviceId),
        })),
    }))
);