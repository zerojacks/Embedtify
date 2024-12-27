import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown, CheckCircle2, Circle } from 'lucide-react';
import { TestUseCase, TestStep, TestScheme } from '@/types/scheme';
import TimelineConnector, { TimelineType } from './Timeline';
interface SchemeTreeProps {
    scheme: TestScheme;
    checkBox?: boolean;
    controlLine?: boolean;
    defaultExpanded?: string[];
    defaultSelected?: string[];
    className: string
    onNodeSelect?: (selectedIds: string[]) => void;
    onNodeToggle?: (expandedIds: string[]) => void;
}

interface TreeItemProps {
    id: string;
    label: string;
    isSelected: boolean;
    isExpanded: boolean;
    hasChildren: boolean;
    disabled?: boolean;
    checkBox?: boolean;
    controlLine?: boolean;
    onToggle: (id: string) => void;
    onSelect: (id: string) => void;
    level: number;
    isFirst: boolean;
    isLast: boolean;
    type: TimelineType | undefined;
    prevType: TimelineType | undefined;
    nextType: TimelineType | undefined;
}

// TreeItem 组件更新
const TreeItem: React.FC<TreeItemProps> = ({
    id,
    label,
    isSelected,
    isExpanded,
    hasChildren,
    disabled = false,
    checkBox = false,
    controlLine = false,
    onToggle,
    onSelect,
    level,
    isFirst,
    isLast,
    type = undefined,
    prevType = undefined,
    nextType = undefined
}) => {

    const isActive = type === undefined ? false : true;

    return (
        <div className="relative min-h-[40px] flex items-stretch">
            {/* 主要内容 */}
            <div className="flex-grow flex items-center p-2 hover:bg-base-200 dark:hover:bg-gray-800"
                 style={{ paddingLeft: `${(level * 16) + 8}px` }}>
                <div className="flex items-center flex-1 space-x-2">
                    {/* 展开/折叠图标 */}
                    <div className="flex-shrink-0">
                        {hasChildren && (
                            <div
                                className="cursor-pointer p-1 rounded-full hover:bg-base-200 dark:hover:bg-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggle(id);
                                }}
                            >
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                )}
                            </div>
                        )}
                        {!hasChildren && <div className="w-6" />}
                    </div>

                    {/* 复选框 */}
                    {checkBox && (
                        <div className="flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onSelect(id)}
                                className="checkbox checkbox-sm"
                                disabled={disabled}
                            />
                        </div>
                    )}

                    {/* 标签文本 */}
                    <span className="text-sm flex-shrink-0">{label}</span>
                </div>
            </div>

            {/* Timeline连接器 */}
            {controlLine && (
                <div className="w-16 flex-shrink-0 flex items-center justify-center ml-4">
                    <TimelineConnector
                        type={type}
                        prevType={prevType}
                        nextType={nextType}
                        isFirst={isFirst}
                        isLast={isLast}
                        isActive={isSelected}
                    />
                </div>
            )}
        </div>
    );
};

const SchemeTree: React.FC<SchemeTreeProps> = ({
    scheme,
    checkBox = false,
    controlLine = false,
    defaultExpanded = [],
    defaultSelected = [],
    onNodeSelect,
    onNodeToggle,
    className
}) => {
    const [selectedItems, setSelectedItems] = useState<string[]>(defaultSelected);
    const [expandedItems, setExpandedItems] = useState<string[]>(defaultExpanded);
    const [initedScheme, setInitedScheme] = useState<TestScheme>(scheme);

    useEffect(() => {
        const selectedItemIds: string[] = [];
        scheme.usecases.forEach(useCase => {
            if (useCase.selected) {
                selectedItemIds.push(useCase.id);
                useCase.steps.forEach(step => {
                    if (step.selected) {
                        selectedItemIds.push(step.id);
                    }
                });
            }
        });
        setSelectedItems(selectedItemIds);
        setInitedScheme(scheme);
    }, [scheme]);

    const handleToggle = (itemId: string) => {
        const newExpandedItems = expandedItems.includes(itemId)
            ? expandedItems.filter(id => id !== itemId)
            : [...expandedItems, itemId];

        setExpandedItems(newExpandedItems);
        onNodeToggle?.(newExpandedItems);
    };

    const handleSelect = (itemId: string, isUseCase: boolean) => {
        let newSelectedItems = [...selectedItems];

        if (isUseCase) {
            const useCase = scheme.usecases.find(uc => uc.id === itemId);
            if (!useCase) return;

            const stepIds = useCase.steps.map(step => step.id);
            if (selectedItems.includes(itemId)) {
                newSelectedItems = newSelectedItems.filter(id =>
                    id !== itemId && !stepIds.includes(id)
                );
            } else {
                newSelectedItems = [...newSelectedItems, itemId, ...stepIds];
            }
        } else {
            if (selectedItems.includes(itemId)) {
                newSelectedItems = newSelectedItems.filter(id => id !== itemId);
            } else {
                newSelectedItems = [...newSelectedItems, itemId];
            }
        }

        setSelectedItems(newSelectedItems);
        onNodeSelect?.(newSelectedItems);
    };

    const renderTreeItem = (
        item: TestUseCase | TestStep,
        level: number,
        isFirst: boolean,
        isLast: boolean,
        isUseCase: boolean,
        parentExpanded: boolean = true,
        prevType: TimelineType | undefined = undefined,
        nextType: TimelineType | undefined = undefined
    ) => {
        const isVisible = level === 0 || parentExpanded;

        return (
            <React.Fragment key={item.id}>
                {isVisible && (
                    <TreeItem
                        id={item.id}
                        label={item.name}
                        isSelected={selectedItems.includes(item.id)}
                        isExpanded={expandedItems.includes(item.id)}
                        hasChildren={isUseCase && (item as TestUseCase).steps.length > 0}
                        checkBox={checkBox}
                        onToggle={handleToggle}
                        onSelect={() => handleSelect(item.id, isUseCase)}
                        level={level}
                        isFirst={isFirst}
                        isLast={isLast && (!isUseCase || !expandedItems.includes(item.id))}
                        type={item.status}
                        controlLine={controlLine}
                        prevType={prevType}
                        nextType={nextType}
                    />
                )}
                
                {isUseCase && expandedItems.includes(item.id) && (
                    <div>
                        {(item as TestUseCase).steps.map((step, index) => 
                            renderTreeItem(
                                step,
                                level + 1,
                                false,
                                (isLast && index === (item as TestUseCase).steps.length - 1),
                                false,
                                expandedItems.includes(item.id),
                                index ===0 ? (item as TestUseCase).status : (item as TestUseCase).steps[index - 1]?.status,
                                index === (item as TestUseCase).steps.length - 1 ? (item as TestUseCase).status : (item as TestUseCase).steps[index + 1]?.status
                            )
                        )}
                    </div>
                )}
            </React.Fragment>
        );
    };

    const renderTree = (items: (TestUseCase | TestStep)[], level: number, isUseCase: boolean, parentExpanded: boolean, prevType: TimelineType, nextType: TimelineType) => (
        items.map((item, index) => (
            <React.Fragment key={item.id}>
                {renderTreeItem(item, level, index === 0, index === items.length - 1, isUseCase, parentExpanded, prevType, nextType)}
                {isUseCase && (item as TestUseCase).steps && expandedItems.includes(item.id) && (
                    <div>
                        {renderTree((item as TestUseCase).steps, level + 1, false, parentExpanded, prevType, nextType)}
                    </div>
                )}
            </React.Fragment>
        ))
    );

    return (
        <div className={`w-full ${className}`}>
            {initedScheme.usecases.map((useCase, index) =>
                renderTreeItem(
                    useCase,
                    0,
                    index === 0,
                    index === initedScheme.usecases.length - 1,
                    true,
                    false,
                    initedScheme.usecases[index - 1]?.status,
                    index === 0 ? (useCase.steps[0]?.status) : (initedScheme.usecases[index + 1]?.status)
                )
            )}
        </div>
    );
};

export default SchemeTree;