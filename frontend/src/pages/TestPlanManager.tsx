import React, { useEffect, useState } from "react";
import { getTestPlans, deleteTestPlan, addTestPlanAPI } from "@/api/PlanAPI";
import { TestPlan, TestPlanScheme } from "@/types/testplan";
import testPlanImage from "@/assets/images/mt_csg.png";
import { useNavigate } from "react-router-dom";
import {
    LayoutGridIcon,
    AlignJustifyIcon,
    AlertCircle
} from "lucide-react";
import { useSchemePlanStore } from "@/stores/useSchemePlanStore";
import { motion, AnimatePresence } from "framer-motion";
import { DeviceInfo, SaveDeviceInfo } from "@/types/device";
import { useTestingStore } from "@/stores/useTestingStore";
import { getDevices } from "@/api/DeviceAPI";

const TestPlanManager = () => {
    const { schemePlan, setSchemePlan, deleteSchemePlan, isView, setIsView } = useSchemePlanStore();
    const [openSelectDevice, setOpenSelectDevice] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<TestPlanScheme | null>(null);
    const { addTestPlan } = useTestingStore();
    const [devices, setDevices] = useState<SaveDeviceInfo[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const loadTestPlans = async () => {
            const testPlans = await getTestPlans();
            if (testPlans) {
                setSchemePlan(testPlans);
            }
        }
        const loadDevices = async () => {
            const devices = await getDevices();
            setDevices(devices);
        }
        loadTestPlans();
        loadDevices();
    }, []);

    const handleCreateTestPlan = () => {
        navigate("/test-plans/create");
    }

    const handleDetailTestPlan = (testPlan: TestPlanScheme) => {
        navigate(`/test-plans/${testPlan.id}`);
    }

    const handleDeleteTestPlan = async (testPlan: TestPlanScheme) => {
        const result = await deleteTestPlan(testPlan.id);
        if (result.success) {
            deleteSchemePlan(testPlan.id);
        }
    }

    const handleStartTestPlan = (testPlan: TestPlanScheme) => {
        setSelectedPlan(testPlan);
        setOpenSelectDevice(true);
    }

    const handleDeviceSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const deviceId = e.target.value;
        const selectedDevice = devices.find(d => d.info.id === deviceId)?.info;
        
        if (selectedDevice && selectedPlan) {
            const result = await addTestPlanAPI(selectedPlan);
            if (result) {
                const testPlanData: TestPlan = result.plan;
                testPlanData.deviceinfo = selectedDevice;
                addTestPlan(result.id, {planscheme: selectedPlan, plan: testPlanData});
                setOpenSelectDevice(false);
                navigate(`/test-details/${result.id}`);
            }
        }
    }

    const availableDevices = devices.filter(device => !device.testing);

    const DeviceSelectModal = () => (
        <dialog className={`modal ${openSelectDevice ? 'modal-open' : ''}`}>
            <div className="modal-box relative">
                <button
                    className="btn btn-sm btn-circle absolute right-2 top-2"
                    onClick={() => setOpenSelectDevice(false)}
                >
                    ✕
                </button>
                <h3 className="font-bold text-lg mb-4">选择设备</h3>
                
                {availableDevices.length === 0 ? (
                    <div className="alert alert-error">
                        <AlertCircle className="w-6 h-6" />
                        <span>当前没有可用的设备</span>
                    </div>
                ) : (
                    <select 
                        className="select select-bordered w-full"
                        onChange={handleDeviceSelect}
                        defaultValue=""
                    >
                        <option value="" disabled>选择一个设备</option>
                        {availableDevices.map((device) => (
                            <option 
                                key={device.info.id} 
                                value={device.info.id}
                            >
                                {device.info.name}
                            </option>
                        ))}
                    </select>
                )}
                
                <div className="modal-action">
                    <button 
                        className="btn"
                        onClick={() => setOpenSelectDevice(false)}
                    >
                        取消
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={() => setOpenSelectDevice(false)}></div>
        </dialog>
    );

    const renderTestPlan = (testPlan: TestPlanScheme, index: number) => {
        return (
            <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`
                    ${isView
                        ? 'card bg-base-100 shadow-xl min-h-24 flex flex-col w-full'
                        : 'collapse bg-base-200 shadow-md w-full'}
                    hover:shadow-lg transition-all duration-300
                `}
            >
                {isView ? (
                    <div className="card-body flex flex-col p-4">
                        <div className="flex items-start space-x-4">
                            <img
                                src={testPlanImage}
                                width={60}
                                height={60}
                                alt="Test Plan"
                                className="object-cover rounded"
                            />
                            <div className="flex-1">
                                <h2 className="card-title text-lg truncate">{testPlan.name}</h2>
                                <p className="text-sm opacity-70 line-clamp-2">
                                    {testPlan.description || '暂无描述'}
                                </p>
                            </div>
                        </div>
                        <div className="card-actions justify-end gap-2 mt-4">
                            <button 
                                className="btn btn-primary btn-sm"
                                onClick={() => handleDetailTestPlan(testPlan)}
                            >
                                详情
                            </button>
                            <button 
                                className="btn btn-error btn-sm"
                                onClick={() => handleDeleteTestPlan(testPlan)}
                            >
                                删除
                            </button>
                            <button 
                                className="btn btn-warning btn-sm"
                                onClick={() => handleStartTestPlan(testPlan)}
                            >
                                开始
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="collapse-title text-base flex items-center w-full p-4">
                        <div className="flex items-center w-full">
                            <img
                                src={testPlanImage}
                                width={50}
                                height={50}
                                alt="Test Plan"
                                className="object-cover rounded"
                            />
                            <div className="flex flex-col ml-4 flex-1">
                                <p className="font-bold text-lg truncate">{testPlan.name}</p>
                                <span className="text-sm opacity-70 truncate">
                                    {testPlan.description || '暂无描述'}
                                </span>
                            </div>
                            <div className="flex space-x-2 ml-4">
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleDetailTestPlan(testPlan)}
                                >
                                    详情
                                </button>
                                <button 
                                    className="btn btn-error btn-sm"
                                    onClick={() => handleDeleteTestPlan(testPlan)}
                                >
                                    删除
                                </button>
                                <button 
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleStartTestPlan(testPlan)}
                                >
                                    开始
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        )
    }

    return (
        <div className="w-full h-full p-4 space-y-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">测试计划管理</h1>
                <div className="flex items-center space-x-4">
                    <label className="swap swap-rotate btn btn-ghost btn-sm">
                        <input
                            type="checkbox"
                            checked={isView}
                            onChange={(e) => setIsView(e.target.checked)}
                        />
                        <LayoutGridIcon className="swap-off w-4 h-4" />
                        <AlignJustifyIcon className="swap-on w-4 h-4" />
                    </label>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={handleCreateTestPlan}
                    >
                        创建测试计划
                    </button>
                </div>
            </div>

            <AnimatePresence>
                <div
                    className={`
                        grid gap-4 w-full 
                        ${isView
                            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                            : 'grid-cols-1'}
                    `}
                >
                    {schemePlan.map((plan, index) => renderTestPlan(plan, index))}
                </div>
            </AnimatePresence>
            <DeviceSelectModal />
        </div>
    )
}

export default TestPlanManager;