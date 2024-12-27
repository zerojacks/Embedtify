import React from 'react';
import type { DeviceInfo } from "@/types/device";

interface DeviceBluetoothConfigProps {
    deviceInfo: DeviceInfo;
    updateNestedConfig: <
        K extends keyof DeviceInfo['config'],
        T extends keyof NonNullable<DeviceInfo['config'][K]>
    >(
        configType: K,
        key: T,
        value: NonNullable<DeviceInfo['config'][K]>[T]
    ) => void;
    devicesConfig: any;
}

export function DeviceBluetoothConfig({
    deviceInfo,
    updateNestedConfig,
    devicesConfig
}: DeviceBluetoothConfigProps) {
    if (!deviceInfo.config.bluetooth) {
        return null;
    }
    return (
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-semibold mb-2">蓝牙配置</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">蓝牙名称</span>
                    </label>
                    <select name="bluetoothname" id="bluetoothname" className="select select-bordered w-full" 
                        value={deviceInfo?.config?.bluetooth?.bluetoothname} 
                        onChange={(e) => updateNestedConfig('bluetooth', 'bluetoothname', e.target.value)}>
                        <option disabled selected>选择蓝牙名称</option>
                        {devicesConfig?.bluetooth?.bluetoothname?.map((bluetoothname: string) => (
                            <option key={bluetoothname} value={bluetoothname}>{bluetoothname}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default DeviceBluetoothConfig;