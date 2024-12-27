import React from 'react';
import { CheckCircle2, XCircle, RefreshCwIcon, CircleIcon } from 'lucide-react';

export type TimelineType = 'success' | 'failure' | 'progress' | 'unknown';

interface TimelineConnectorProps {
    type: TimelineType | undefined;
    prevType?: TimelineType | undefined;
    nextType?: TimelineType | undefined;
    isFirst?: boolean;
    isLast?: boolean;
    isActive?: boolean;
    className?: string;
}

const TimelineConnector: React.FC<TimelineConnectorProps> = ({
    type,
    prevType,
    nextType,
    isFirst = false,
    isLast = false,
    isActive = false,
    className = ''
}) => {
    const typeColors = {
        success: {
            active: 'text-success-content bg-success',
            inactive: 'text-base-100 bg-base-200'
        },
        failure: {
            active: 'text-error-content bg-error',
            inactive: 'text-base-100 bg-base-200'
        },
        progress: {
            active: 'text-primary-content bg-primary',
            inactive: 'text-base-100 bg-base-200'
        },
        undefined: {
            active: 'text-base-100 bg-base-200',
            inactive: 'text-base-100 bg-base-200'
        },
        unknown: {
            active: 'text-base-100 bg-base-200',
            inactive: 'text-base-100 bg-base-200'
        }
    };

    const icons = {
        success: CheckCircle2,
        failure: XCircle,
        progress: RefreshCwIcon,
        undefined: CircleIcon,
        unknown: CircleIcon
    };

    const IconComponent = icons[type || 'undefined'];

    // 决定线条颜色的函数
    const getLineColor = (lineType: TimelineType | undefined, isActive: boolean) => {
        if (!lineType) return 'bg-gray-200';
        return isActive ? typeColors[lineType].active : typeColors[lineType].inactive;
    };

    return (
        <div className={`relative flex items-center justify-center h-full ${className}`}>
            {/* 上连接线 */}
            {!isFirst && (
                <div
                    className={`
                        absolute top-0 w-0.5 
                        ${getLineColor(prevType, isActive)}
                    `}
                    style={{
                        height: 'calc(50% - 12px)'
                    }}
                />
            )}

            {/* 状态图标 */}
            <div 
                className={`
                    relative z-10 w-6 h-6 rounded-full flex items-center justify-center
                    ${isActive ? typeColors[type || 'undefined'].active : typeColors[type || 'undefined'].inactive}
                `}
            >
                <IconComponent 
                    className={`
                        w-4 h-4 
                        ${type === 'progress' ? 'animate-spin' : ''}
                    `} 
                />
            </div>

            {/* 下连接线 */}
            {!isLast && (
                <div
                    className={`
                        absolute bottom-0 w-0.5
                        ${getLineColor(type, isActive)}
                    `}
                    style={{
                        height: 'calc(50% - 12px)'
                    }}
                />
            )}
        </div>
    );
};

export default TimelineConnector;