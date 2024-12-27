import React, { useEffect, useState } from "react";
import type { DeviceInfo, SaveDeviceInfo } from "@/types/device";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutGridIcon, 
  AlignJustifyIcon, 
  ServerIcon, 
  ComputerIcon,
  ActivityIcon
} from "lucide-react";
import { getDevices, addDevice as addDeviceAPI, deleteDevice } from "@/api/DeviceAPI";
import { DeviceConfigModal } from "@/components/DeviceConfig";
import { v4 as uuidv4 } from 'uuid';

const getDeviceIcon = (deviceType: string) => {
    const iconMap: { [key: string]: React.ElementType } = {
        'server': ServerIcon,
        'computer': ComputerIcon,
        'default': ComputerIcon
    };

    const Icon = iconMap[deviceType?.toLowerCase()] || iconMap['default'];
    return <Icon className="w-6 h-6" />;
};

const DeviceStatus = ({ device }: { device: SaveDeviceInfo }) => {
    const getStatusColor = () => {
        if (device.testing) return "badge-warning";
        const connectedCount = Object.values(device.info.status).filter(
            status => status === 'connected'
        ).length;
        if (connectedCount > 0) return "badge-success";
        return "badge-error";
    };

    const getStatusText = () => {
        return device.testing? "测试中" : "未测试";
        // if (device.testing) return "测试中";
        // const connectedCount = Object.values(device.info.status).filter(
        //     status => status === 'connected'
        // ).length;
        // return connectedCount > 0 ? "Connected" : "Disconnected";
    };

    return (
        <div className={`badge ${getStatusColor()} gap-1`}>
            <ActivityIcon size={14} />
            {getStatusText()}
        </div>
    );
};

const DevicesManager = () => {
    const [devices, setDevices] = useState<SaveDeviceInfo[]>([]);
    const [isView, setIsView] = useState(false);
    const [openConfig, setOpenConfig] = useState(false);
    const [activeDevice, setActiveDevice] = useState<DeviceInfo | null>(null);

    useEffect(() => {
        const loadDevices = async () => {
            const allDevices: SaveDeviceInfo[] = await getDevices();
            console.log("allDevices", allDevices);
            setDevices(allDevices);
        }
        loadDevices();
    }, []);

    const handleDetailDevice = (device: SaveDeviceInfo) => {
        setActiveDevice(device.info);
        setOpenConfig(true);
    }

    const handleDeleteDevice = async (device: SaveDeviceInfo) => {
        setActiveDevice(device.info);
        await deleteDevice(device.id);
        setDevices(devices.filter(d => d.id !== device.id));
    }

    const handleCreateDevice = () => {
        const newDevice: DeviceInfo = {
            id: uuidv4(),
            name: '',
            type: '',
            protocol: '',
            config: {
                timeout: 0,
                retry: 0,
            },
            status: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
        setActiveDevice(newDevice);
        setOpenConfig(true);
    }

    const handleSaveDeviceConfig = async (device: DeviceInfo) => {
        const newDevice = await addDeviceAPI(device);
        if (devices.some(d => d.id === newDevice.id)) {
            setDevices(devices.map(d => d.id === newDevice.id ? newDevice : d));
        } else {
            setDevices([...devices, newDevice]);
        }
        setOpenConfig(false);
    }

    const renderDevice = (device: SaveDeviceInfo, index: number) => {
        const DeviceIcon = getDeviceIcon(device.info.type);
        console.log("renderDevice", device, isView);
        if (isView) {
            return (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                    <div className="card-body">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="avatar placeholder">
                                <div className="bg-base-300 text-base-content rounded-lg w-12 h-12 flex items-center justify-center">
                                    {DeviceIcon}
                                </div>
                            </div>
                            <div>
                                <h2 className="card-title">{device.info.name}</h2>
                                <p className="text-sm opacity-70">{device.info.type || '未设置类型'}</p>
                            </div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <DeviceStatus device={device} />
                            <div className="text-sm opacity-70">
                                Last updated: {new Date(device.info.updatedAt).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="card-actions justify-end mt-4">
                            <button 
                                className="btn btn-primary btn-sm" 
                                onClick={() => handleDetailDevice(device)}
                            >
                                详情
                            </button>
                            <button 
                                className="btn btn-error btn-sm" 
                                onClick={() => handleDeleteDevice(device)}
                            >
                                删除
                            </button>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
            >
                <div className="flex items-center p-4 bg-base-100 rounded-lg shadow hover:shadow-md transition-all duration-300">
                    <div className="avatar placeholder mr-4">
                        <div className="bg-base-300 text-base-content rounded-lg w-12 h-12 flex items-center justify-center">
                            {DeviceIcon}
                        </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold truncate">{device.info.name}</h3>
                            <DeviceStatus device={device} />
                        </div>
                        <p className="text-sm opacity-70 truncate">{device.info.type || '未设置类型'}</p>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                        <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => handleDetailDevice(device)}
                        >
                            详情
                        </button>
                        <button 
                            className="btn btn-error btn-sm" 
                            onClick={() => handleDeleteDevice(device)}
                        >
                            删除
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">设备管理</h1>
                <div className="flex items-center gap-4">
                    <label className="swap swap-rotate btn btn-ghost btn-circle">
                        <input
                            type="checkbox"
                            checked={isView}
                            onChange={(e) => setIsView(e.target.checked)}
                        />
                        <LayoutGridIcon className="swap-on w-5 h-5" />
                        <AlignJustifyIcon className="swap-off w-5 h-5" />
                    </label>
                    <button
                        className="btn btn-primary"
                        onClick={handleCreateDevice}
                    >
                        添加设备
                    </button>
                </div>
            </div>

            <div className={`
                grid gap-4
                ${isView 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }
            `}>
                <AnimatePresence>
                    {devices.map((device, index) => renderDevice(device, index))}
                </AnimatePresence>
            </div>

            {activeDevice && openConfig && (
                <DeviceConfigModal
                    device={activeDevice}
                    openConfig={openConfig}
                    onSave={handleSaveDeviceConfig}
                    setOpenConfig={setOpenConfig}
                />
            )}
        </div>
    );
}

export default DevicesManager;