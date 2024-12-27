import React from 'react';
import type { DeviceInfo } from "@/types/device";

interface DeviceSftpConfigProps {
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

export function DeviceSftpConfig({
    deviceInfo,
    updateNestedConfig
}: DeviceSftpConfigProps) {
    return (
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-semibold mb-2">SFTP配置</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">设备IP</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入设备IP"
                        className="input input-bordered w-full"
                        value={deviceInfo.config.sftp?.ip || ''}
                        onChange={(e) => updateNestedConfig('sftp', 'ip', e.target.value)}
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
                        value={deviceInfo.config.sftp?.port || ''}
                        onChange={(e) => updateNestedConfig('sftp', 'port', Number(e.target.value))}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">用户名</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入用户名"
                        className="input input-bordered w-full"
                        value={deviceInfo.config.sftp?.username || ''}
                        onChange={(e) => updateNestedConfig('sftp', 'username', e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">密码</span>
                    </label>
                    <input
                        type="password"
                        placeholder="请输入密码"
                        className="input input-bordered w-full"
                        value={deviceInfo.config.sftp?.password || ''}
                        onChange={(e) => updateNestedConfig('sftp', 'password', e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}

export default DeviceSftpConfig;