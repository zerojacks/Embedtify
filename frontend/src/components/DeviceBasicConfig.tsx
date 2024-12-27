import React from 'react';
import type { DeviceInfo, ConnectConfig } from "@/types/device";

interface DeviceBasicConfigProps {
    deviceInfo: DeviceInfo;
    updateDeviceInfo: <K extends keyof DeviceInfo>(key: K, value: DeviceInfo[K]) => void;
    updateConfig: <K extends keyof ConnectConfig>(key: K, value: ConnectConfig[K]) => void;
    devicesConfig: any;
}

export function DeviceBasicConfig({
    deviceInfo,
    updateDeviceInfo,
    devicesConfig,
    updateConfig
}: DeviceBasicConfigProps) {
    console.log("deviceInfo", deviceInfo);
    return (
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-semibold mb-2">设备基本信息</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">设备名称</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入设备名称"
                        className="input input-bordered w-full"
                        value={deviceInfo.name}
                        onChange={(e) => updateDeviceInfo('name', e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">设备类型</span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={deviceInfo.type || ''}
                        onChange={(e) => updateDeviceInfo('type', e.target.value)}
                    >
                        <option disabled selected>选择设备类型</option>
                        {devicesConfig.deviceTypes.map((type: string, index: number) => (
                            <option key={index} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">设备协议</span>
                    </label>
                    <select
                        className="select select-bordered w-full"
                        value={deviceInfo.protocol || ''}
                        onChange={(e) => updateDeviceInfo('protocol', e.target.value)}
                    >
                        <option disabled selected>选择设备协议</option>
                        {devicesConfig.deviceProtocols.map((protocol: string, index: number) => (
                            <option key={index} value={protocol}>{protocol}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">超时时间</span>
                    </label>
                    <div className="flex items-center">
                        <input
                            type="text"
                            placeholder="请输入超时时间"
                            className="input input-bordered w-full"
                            value={deviceInfo.config.timeout || 10}
                            onChange={(e) => updateConfig('timeout', parseInt(e.target.value))}
                        />
                        <label htmlFor="device-timeout" className="label">
                            <span className="label-text">ms</span>
                        </label>
                    </div>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">重试次数</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入重试次数"
                        className="input input-bordered w-full"
                        value={deviceInfo.config.retry || 3}
                        onChange={(e) => updateConfig('retry', parseInt(e.target.value))}
                    />
                </div>
            </div>
        </div>
    );
}

export default DeviceBasicConfig;