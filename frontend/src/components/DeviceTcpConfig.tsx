import React from 'react';
import type { DeviceInfo } from "@/types/device";

interface DeviceTcpConfigProps {
    deviceInfo: DeviceInfo;
    updateNestedConfig: <
        K extends keyof DeviceInfo['config'],
        T extends keyof NonNullable<DeviceInfo['config'][K]>
    >(
        configType: K,
        key: T,
        value: NonNullable<DeviceInfo['config'][K]>[T]
    ) => void;
}

export function DeviceTcpConfig({
    deviceInfo,
    updateNestedConfig
}: DeviceTcpConfigProps) {
    return (
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-semibold mb-2">TCP配置</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">设备IP</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入设备IP"
                        className="input input-bordered w-full"
                        value={deviceInfo.config.tcp?.ip || ''}
                        onChange={(e) => updateNestedConfig('tcp', 'ip', e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">设备端口</span>
                    </label>
                    <input
                        type="number"
                        placeholder="请输入设备端口"
                        className="input input-bordered w-full"
                        value={deviceInfo.config.tcp?.port || ''}
                        onChange={(e) => updateNestedConfig('tcp', 'port', Number(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}

export default DeviceTcpConfig;