import React from 'react';
import type { DeviceInfo } from "@/types/device";

interface DeviceMqttConfigProps {
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

export function DeviceMqttConfig({
    deviceInfo,
    updateNestedConfig,
    devicesConfig
}: DeviceMqttConfigProps) {
    return (
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-semibold mb-2">MQTT配置</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">设备IP</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入IP"
                        className="input input-bordered w-full"
                        value={deviceInfo?.config.mqtt?.ip}
                        onChange={(e) => updateNestedConfig('mqtt', 'ip', e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">端口</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入端口"
                        className="input input-bordered w-full"
                        value={deviceInfo?.config.mqtt?.port}
                        onChange={(e) => updateNestedConfig('mqtt', 'port', parseInt(e.target.value))}
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
                        value={deviceInfo?.config.mqtt?.username}
                        onChange={(e) => updateNestedConfig('mqtt', 'username', e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">密码</span>
                    </label>
                    <input
                        type="text"
                        placeholder="请输入密码"
                        className="input input-bordered w-full"
                        value={deviceInfo?.config.mqtt?.password}
                        onChange={(e) => updateNestedConfig('mqtt', 'password', e.target.value)}
                    />
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">QoS</span>
                    </label>
                    <select name="qos" id="qos" className="select select-bordered w-full" 
                        value={deviceInfo?.config.mqtt?.qos} 
                        onChange={(e) => updateNestedConfig('mqtt', 'qos', parseInt(e.target.value))}
                    >
                        <option disabled selected>选择QoS</option>
                        {devicesConfig.mqtt.qoss.map((qos: number) => (
                            <option key={qos} value={qos}>{qos}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">版本</span>
                    </label>
                    <select name="mqttversion" id="mqttversion" className="select select-bordered w-full" 
                        value={deviceInfo?.config.mqtt?.mqttversion} 
                        onChange={(e) => updateNestedConfig('mqtt', 'mqttversion', e.target.value)}
                    >
                        <option disabled selected>选择版本</option>
                        {devicesConfig.mqtt.versions.map((version: string) => (
                            <option key={version} value={version}>{version}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default DeviceMqttConfig;