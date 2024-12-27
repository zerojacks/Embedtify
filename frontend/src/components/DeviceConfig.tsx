import React, { useState, useCallback } from 'react';
import { DeviceBasicConfig } from './DeviceBasicConfig';
import { DeviceTcpConfig } from './DeviceTcpConfig';
import { DeviceSerialConfig } from './DeviceSerialConfig';
import { DeviceMqttConfig } from './DeviceMqttConfig';
import { DeviceBluetoothConfig } from './DeviceBluetoothConfig';
import type { ConnectConfig, DeviceInfo } from "@/types/device";
import devicesConfig from "@/config/devicesconfig.json";
import { DeviceSSHConfig } from './DeviceSSHConfig';
import { DeviceSftpConfig } from './DeviceSftpConfig';

interface DeviceConfigModalProps {
    device: DeviceInfo | null;
    openConfig: boolean;
    onSave: (device: DeviceInfo) => void;
    setOpenConfig: (open: boolean) => void;
}

// 创建一个初始化设备信息的工厂函数
function createInitialDeviceInfo(device?: DeviceInfo | null): DeviceInfo {
    return device ? { ...device } : {
        id: `device_id-${Date.now()}`,
        name: '',
        type: '',
        protocol: '',
        config: {
            timeout: 1000,
            retry: 3,
            tcp: {
                ip: '',
                port: 0,
                username: '',
                password: '',
            },
            serial: {
                comnumber: '',
                baudrate: 0,
                databits: 0,
                stopbits: 0,
                parity: '',
            },
            mqtt: {
                ip: '',
                port: 0,
                username: '',
                password: '',
                mqttversion: '',
                clientid: '',
                topic: '',
                qos: 0,
            },
            bluetooth: {
                bluetoothname: '',
                channel: 0,
                name: '',
            }
        },
        status: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

// 主要配置模态框组件
export function DeviceConfigModal({
    device,
    openConfig,
    onSave,
    setOpenConfig
}: DeviceConfigModalProps) {
    const [activeTab, setActiveTab] = useState('device');
    const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => createInitialDeviceInfo(device));

    // 通用更新设备信息的方法
    const updateDeviceInfo = useCallback(<K extends keyof DeviceInfo>(
        key: K,
        value: DeviceInfo[K]
    ) => {
        setDeviceInfo(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // 更新嵌套配置的通用方法
    const updateNestedConfig = useCallback(<
        K extends keyof DeviceInfo['config'],
        T extends keyof NonNullable<DeviceInfo['config'][K]>
    >(
        configType: K,
        key: T,
        value: NonNullable<DeviceInfo['config'][K]>[T]
    ) => {
        setDeviceInfo(prev => {
            if (configType === 'timeout' || configType === 'retry') {
                return {
                    ...prev,
                    config: {
                        ...prev.config,
                        [configType]: value
                    }
                };
            }
            const currentConfig = prev.config[configType] ?? {};
            return {
                ...prev,
                config: {
                    ...prev.config,
                    [configType]: {
                        ...currentConfig,
                        [key]: value
                    }
                }
            };
        });
    }, []);

    const updateConfig = useCallback(<
        K extends keyof ConnectConfig
    >(
        configType: K,
        value: ConnectConfig[K]
    ) => {
        setDeviceInfo(prev => {
            return {
                ...prev,
                config: {
                    ...prev.config,
                    [configType]: value
                }
            };
        });
    }, []);

    // 保存配置
    const handleSaveConfig = useCallback(() => {
        console.log(deviceInfo);
        onSave(deviceInfo);
        setOpenConfig(false);
    }, [deviceInfo, onSave, setOpenConfig]);

    // 配置页面映射
    const ConfigPages = {
        device: (
            <DeviceBasicConfig
                deviceInfo={deviceInfo}
                updateDeviceInfo={updateDeviceInfo}
                devicesConfig={devicesConfig}
                updateConfig={updateConfig}
            />
        ),
        tcp: (
            <DeviceTcpConfig
                deviceInfo={deviceInfo}
                updateNestedConfig={updateNestedConfig}
            />
        ),
        serial: (
            <DeviceSerialConfig
                deviceInfo={deviceInfo}
                updateNestedConfig={updateNestedConfig}
                devicesConfig={devicesConfig}
            />
        ),
        mqtt: (
            <DeviceMqttConfig
                deviceInfo={deviceInfo}
                updateNestedConfig={updateNestedConfig}
                devicesConfig={devicesConfig}
            />
        ),
        bluetooth: (
            <DeviceBluetoothConfig
                deviceInfo={deviceInfo}
                updateNestedConfig={updateNestedConfig}
                devicesConfig={devicesConfig}
            />
        ),
        ssh: (
            <DeviceSSHConfig
                deviceInfo={deviceInfo}
                updateNestedConfig={updateNestedConfig}
            />
        ),
        sftp: (
            <DeviceSftpConfig
                deviceInfo={deviceInfo}
                updateNestedConfig={updateNestedConfig}
            />
        )
    };

    return (
        <dialog
            className={`modal ${openConfig ? 'modal-open' : ''}`}
            open={openConfig}
        >
            <div className="modal-box w-11/12 max-w-5xl">
                <h3 className="font-bold text-lg mb-4">设备信息配置</h3>

                {/* 标签页 */}
                <div className="tabs tabs-bordered mb-4">
                    {[
                        { key: 'device', label: '设备配置' },
                        { key: 'tcp', label: 'TCP配置' },
                        { key: 'serial', label: '串口配置' },
                        { key: 'mqtt', label: 'MQTT配置' },
                        { key: 'ssh', label: 'SSH配置' },
                        { key: 'sftp', label: 'SFTP配置' },
                        { key: 'bluetooth', label: '蓝牙配置' }
                    ].map(tab => (
                        <a
                            key={tab.key}
                            className={`tab tab-bordered ${activeTab === tab.key ? 'tab-active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                        </a>
                    ))}
                </div>

                {/* 动态渲染配置页面 */}
                {ConfigPages[activeTab as keyof typeof ConfigPages]}

                <div className="modal-action">
                    <button
                        className="btn btn-ghost"
                        onClick={() => setOpenConfig(false)}
                    >
                        取消
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSaveConfig}
                    >
                        确认
                    </button>
                </div>
            </div>
        </dialog>
    );
}