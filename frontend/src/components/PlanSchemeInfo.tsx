import React, { useEffect, useRef, useState } from "react";
import { ArrowLeftIcon, InfoIcon, PlusIcon, SaveIcon, TrashIcon, UploadIcon, CopyXIcon, EditIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TestPlanScheme } from "@/types/testplan";
import { TestScheme, TestUseCase } from "@/types/scheme";
import SchemeTree from "@/components/SchemeTree";
import { uploadFiles } from "@/api/FileAPI";
import { saveTestPlan } from "@/api/PlanAPI";

interface PlanSchemeInfoProps {
    planScheme: TestPlanScheme;
    isEdit: boolean;
    onSave: (plan: TestPlanScheme) => void;
}

const PlanSchemeInfo: React.FC<PlanSchemeInfoProps> = ({ planScheme, isEdit, onSave }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [attachments, setAttachments] = useState<File[]>([]);
    const [multiple, setMultiple] = useState<boolean>(true);
    const [reloadIndex, setReloadIndex] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [schemeInfo, setSchemeInfo] = useState<TestScheme | null>(null);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isNeedName, setIsNeedName] = useState<boolean>(false);
    const [isNeedScheme, setIsNeedScheme] = useState<boolean>(false);
    const [plan, setPlan] = useState<TestPlanScheme | null>(null);
    const [canEdit, setCanEdit] = useState<boolean>(isEdit);
    const isNeedAttachment = useRef<boolean>(false);

    useEffect(() => {
        console.log(planScheme);
        if (planScheme.filepath.length > 0) {
            const files = planScheme.filepath.map((path, index) => {
                const name = path.split('\\').pop() || '';
                return new File([], name);
            });
            setFiles(files);
        }
        setPlan(planScheme);
    }, [planScheme]);

    useEffect(() => {
        console.log(attachments);
    }, [attachments]);

    const handleAddScheme = async () => {
        setMultiple(true);
        isNeedAttachment.current = false;
        fileInputRef.current?.click();
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputFiles = e.target.files;
        if (inputFiles) {
            try {
                if (multiple) {
                    // 使用文件路径检查唯一性
                    const uniqueFiles = Array.from(inputFiles).filter(newFile =>
                        !files.some(existingFile => existingFile.name === newFile.name)
                    );
                    if (isNeedAttachment.current) {
                        setAttachments(prev => [...prev, ...uniqueFiles]);
                    } else {
                        setFiles(prev => [...prev, ...uniqueFiles]);
                    }
                } else {
                    // 替换特定索引的文件信息
                    const isExist = files.some(existingFile => existingFile.name === inputFiles[0].name);

                    // 不存在相同文件则更新，存在相同文件则不更新
                    if (!isExist) {
                        if (reloadIndex !== null) {
                            const selectedFile = inputFiles[0];
                            if (isNeedAttachment.current) {
                                setAttachments(prev => prev.map((file, index) =>
                                    index === reloadIndex ? selectedFile : file
                                ));
                            } else {
                                setFiles(prev => prev.map((file, index) =>
                                    index === reloadIndex ? selectedFile : file
                                ));
                            }
                        }
                    } else {
                        // 存在相同文件则删除重新上传的文件
                        // if (reloadIndex !== null) {
                        //     handleDeleteScheme(reloadIndex);
                        // }
                    }

                    setReloadIndex(null);
                    setMultiple(true);
                }
            } catch (error) {
                console.error('读取文件出错:', error);
            } finally {
                setReloadIndex(null);
                setMultiple(true);
                setIsNeedScheme(false);
            }
        }
    };

    const handleDeleteScheme = (index: number, isAttachment: boolean) => {
        if (isAttachment) {
            setAttachments(prev => prev.filter((_, i) => i !== index));
        } else {
            setFiles(prev => prev.filter((_, i) => i !== index));
        }
    }

    const handleReloadScheme = (index: number, isAttachment: boolean) => {
        setMultiple(false);
        setReloadIndex(index);
        if (isAttachment) {
            isNeedAttachment.current = true;
        }
        fileInputRef.current?.click();
    }

    const handlePraseFile = (index: number) => {
        console.log(index);
        parseFile(files[index], index);
    }

    const handlePlanNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPlan(prev => {
            if (prev === null) {
                return {
                    id: `plan-${Date.now()}`,
                    name: value,
                    description: '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    filepath: []
                };
            } else {
                return {
                    ...prev,
                    name: value
                };
            }
        });
        if (value === '') {
            setIsNeedName(true);
        } else {
            setIsNeedName(false);
        }
    };

    const handlePlanDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setPlan(prev => {
            if (prev === null) {
                return {
                    id: `plan-${Date.now()}`,
                    name: '',
                    description: value,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    filepath: []
                };
            } else {
                return {
                    ...prev,
                    description: value
                };
            }
        });
    };

    const handleSavePlan = async () => {
        if (plan === null) {
            setIsNeedName(true);
            return;
        }

        if (plan.name === '') {
            setIsNeedName(true);
            return;
        }

        if (files.length === 0) {
            setIsNeedScheme(true);
            return;
        }

        // 先上传文件并获取文件路径
        const filePaths = await uploadFiles(files, plan.id);
        // 更新方案
        const newPlan = plan;
        if (filePaths.success) {
            newPlan.filepath = filePaths.files;
            setPlan(newPlan);
        } else {
            setError('文件上传失败');
            setIsOpen(true);
        }

        if (attachments.length > 0) {
            const attachmentPaths = await uploadFiles(attachments, plan.id + '/attachments');
            console.log("attachmentPaths", attachmentPaths);
            if (attachmentPaths.success) {
                newPlan.attachments = attachmentPaths.files;
                setPlan(newPlan);
            } else {
                setError('附件上传失败');
                setIsOpen(true);
            }
        }

        // 保存方案
        const result = await saveTestPlan(newPlan);
        if (result) {
            onSave(newPlan);
            console.log("保存成功");
        } else {
            console.log("保存失败");
        }
    }

    const handleCancelPlan = () => {
        setPlan(planScheme);
        setCanEdit(false);
    }

    const detectEncoding = (uint8Array: Uint8Array): string => {
        const xmlDeclaration = new TextDecoder('utf-8').decode(uint8Array.slice(0, 100));
        const match = xmlDeclaration.match(/encoding="(.+?)"/);
        return match ? match[1].toLowerCase() : 'utf-8';
    };

    const parseFile = (file: File, index: number) => {
        const fileId = `${index}`
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            const encoding = detectEncoding(uint8Array);
            const decoder = new TextDecoder(encoding);
            const content = decoder.decode(uint8Array);
            const worker = new Worker(new URL('../workers/parseWorker.ts', import.meta.url), { type: 'module' });
            worker.onmessage = (event) => {
                const { success, data, error, fileId } = event.data;
                if (success) {
                    const usecases = data as TestUseCase[]
                    const scheme: TestScheme = {
                        id: fileId,
                        name: file.name,
                        filepath: file.name,
                        usecases: usecases,
                        default: {
                            type: '',
                            port: '',
                            sloop: 0,
                            timeout: 0,
                            format: '',
                            relation: '',
                            uloop: 0,
                            check: ''
                        },
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                    setSchemeInfo(scheme)
                    setIsOpen(true);
                } else {
                    setError(error);
                    setIsOpen(true);
                }
                worker.terminate();
            };
            worker.postMessage({ content, fileId });
        };
        reader.readAsArrayBuffer(file);
    };

    const handleAddAttachment = () => {
        setMultiple(true);
        isNeedAttachment.current = true;
        fileInputRef.current?.click();
    }

    const renderTestScheme = (schemes: File[], isAttachment: boolean) => {
        return (
            <div className="flex flex-col">
                {schemes.map((scheme, index) => (
                    <div key={index} className="flex flex-row m-1">
                        <div className="flex-1">{scheme.name}</div>
                        {canEdit && (
                            <div className="flex flex-row flex-0 justify-end gap-2">
                                <button className="btn btn-circle btn-outline btn-xs hover:bg-error" onClick={() => handleDeleteScheme(index, isAttachment)}>
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                                <button className="btn btn-circle btn-outline btn-xs hover:bg-primary" onClick={() => handleReloadScheme(index, isAttachment)}>
                                    <UploadIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full drawer drawer-end">
            <input id="my-drawer" type="checkbox" className="drawer-toggle" checked={isOpen} onClick={() => setIsOpen(false)} />
            <div className="drawer-content">
                <input
                    type="file"
                    multiple={multiple}
                    ref={fileInputRef}
                    accept={isNeedAttachment.current ? "*" : ".tsl"}
                    className="hidden"
                    onChange={handleFileChange}
                />
                <div className="flex flex-row w-full items-center justify-between">
                    <div className="flex flex-row gap-2 justify-end flex-1">
                        <button className="btn btn-circle btn-outline btn-sm hover:bg-primary" onClick={handleSavePlan}>
                            <SaveIcon className="w-6 h-6" />
                        </button>
                        <button className="btn btn-circle btn-outline btn-sm hover:bg-error" onClick={handleCancelPlan}>
                            <CopyXIcon className="w-6 h-6" />
                        </button>
                        <button className="btn btn-circle btn-outline btn-sm hover:bg-success" onClick={() => setCanEdit(!canEdit)}>
                            <EditIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <div className="flex flex-row w-full m-2">
                        <label htmlFor="planName" className="flex items-center justify-center shrink-0 m-2 font-bold">方案名称</label>
                        <input type="text" id="planName" placeholder="请输入方案名称" className="input input-bordered flex max-w-fit" disabled={!canEdit} value={plan?.name} onChange={handlePlanNameChange} />
                        <span className="flex items-center justify-center shrink-0 m-2 font-bold text-error">*</span>
                        {isNeedName && <span className="text-error flex items-center justify-center shrink-0">方案名称不能为空</span>}
                    </div>
                    <div className="flex flex-row w-full m-2">
                        <label htmlFor="planDescription" className="flex items-center justify-center shrink-0 m-2 font-bold">方案描述</label>
                        <textarea id="planDescription" className="textarea textarea-bordered flex w-full" placeholder="请输入方案描述" disabled={!canEdit} value={plan?.description} onChange={handlePlanDescriptionChange}></textarea>
                    </div>
                    <div className="flex flex-row w-full m-2">
                        <label htmlFor="planFile" className="flex items-center justify-center shrink-0 m-2 font-bold">测试用例</label>
                        <div
                            className={`flex flex-col justify-center w-full flex-0 border ${canEdit ? '' : 'opacity-50 pointer-events-none bg-base-300 cursor-not-allowed'} rounded-md`}                        >
                            {files.length > 0 && renderTestScheme(files, false)}
                            {files.length === 0 && <span className="flex items-center justify-center text-sm">暂无测试用例</span>}
                        </div>
                        <span className="flex items-center justify-center shrink-0 m-2 font-bold text-error">*</span>
                        {isNeedScheme && <span className="text-error flex items-center justify-center shrink-0">测试用例不能为空</span>}
                        {canEdit && (
                        <div className="flex flex-row items-center justify-center flex-1 ml-4">
                            <button
                                className="btn btn-circle btn-outline btn-sm hover:bg-primary"
                                onClick={handleAddScheme}
                            >
                                <PlusIcon className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-row w-full m-2">
                        <label htmlFor="planFile" className="flex items-center justify-center shrink-0 m-2 font-bold">测试附件</label>
                        <div
                            className={`flex flex-col justify-center w-full flex-0 border ${canEdit ? '' : 'opacity-50 pointer-events-none bg-base-300 cursor-not-allowed'} rounded-md`}                        >
                            {attachments.length > 0 && renderTestScheme(attachments, true)}
                            {attachments.length === 0 && <span className="flex items-center justify-center text-sm">暂无附件</span>}
                        </div>
                        {canEdit && (
                        <div className="flex flex-row items-center justify-center flex-1 ml-4">
                            <button
                                className="btn btn-circle btn-outline btn-sm hover:bg-primary"
                                onClick={handleAddAttachment}
                            >
                                <PlusIcon className="w-6 h-6" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                <ul className="bg-base-200 text-base-content min-h-full w-1/2 p-4 overflow-hidden">
                    {schemeInfo && <SchemeTree scheme={schemeInfo} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" />}
                    {!schemeInfo && error && <span>{error}</span>}
                </ul>
            </div>
        </div>
    )
}

export default PlanSchemeInfo;