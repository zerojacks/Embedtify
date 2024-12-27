import React from 'react';
import type { DeviceInfo } from "@/types/device";

interface DeviceSerialConfigProps {
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

export function DeviceSerialConfig({
    deviceInfo,
    updateNestedConfig,
    devicesConfig
}: DeviceSerialConfigProps) {
    return (
        <div className="bg-base-200 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-semibold mb-2">串口配置</h4>
            <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">串口名称</span>
                    </label>
                    <select name="comnumber" id="comnumber" className="select select-bordered w-full" 
                        value={deviceInfo?.config.serial?.comnumber} 
                        onChange={(e) => updateNestedConfig('serial', 'comnumber', e.target.value)}>
                        <option disabled selected>选择串口名称</option>
                        {devicesConfig.serial.comnumber.map((comnumber: string) => (
                            <option key={comnumber} value={comnumber}>{comnumber}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">波特率</span>
                    </label>
                    <select name="baudrate" id="baudrate" className="select select-bordered w-full" 
                        value={deviceInfo?.config.serial?.baudrate} 
                        onChange={(e) => updateNestedConfig('serial', 'baudrate', parseInt(e.target.value))}
                    >
                        <option disabled selected>选择波特率</option>
                        {devicesConfig.serial.baudrates.map((baudrate: number) => (
                            <option key={baudrate} value={baudrate}>{baudrate}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">数据位</span>
                    </label>
                    <select name="databits" id="databits" className="select select-bordered w-full" 
                        value={deviceInfo?.config.serial?.databits} 
                        onChange={(e) => updateNestedConfig('serial', 'databits', parseInt(e.target.value))}
                    >
                        <option disabled selected>选择数据位</option>
                        {devicesConfig.serial.databits.map((databits: number) => (
                            <option key={databits} value={databits}>{databits}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">校验位</span>
                    </label>
                    <select name="parity" id="parity" className="select select-bordered w-full" 
                        value={deviceInfo?.config.serial?.parity} 
                        onChange={(e) => updateNestedConfig('serial', 'parity', e.target.value)}
                    >
                        <option disabled selected>选择校验位</option>
                        {devicesConfig.serial.paritys.map((parity: string) => (
                            <option key={parity} value={parity}>{parity}</option>
                        ))}
                    </select>
                </div>
                <div className="form-control">
                    <label className="label">
                        <span className="label-text">停止位</span>
                    </label>
                    <select name="stopbits" id="stopbits" className="select select-bordered w-full" 
                        value={deviceInfo?.config.serial?.stopbits} 
                        onChange={(e) => updateNestedConfig('serial', 'stopbits', parseInt(e.target.value))}
                    >
                        <option disabled selected>选择停止位</option>
                        {devicesConfig.serial.stopbits.map((stopbits: number) => (
                            <option key={stopbits} value={stopbits}>{stopbits}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}

export default DeviceSerialConfig;