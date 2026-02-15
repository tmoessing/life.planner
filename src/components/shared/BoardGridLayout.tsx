import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { ReactNode } from 'react';

interface BoardColumn<T> {
    id: string;
    label: string;
    items: T[];
    color: string;
}

interface BoardGridLayoutProps<T> {
    columns: BoardColumn<T>[];
    renderItem: (item: T, index: number) => ReactNode;
    renderColumn?: (column: BoardColumn<T>) => ReactNode;
    currentMobileColumnIndex?: number;
    onMobileColumnChange?: (index: number) => void;
    dragOverClasses?: (columnId: string) => string;
    gridClassName?: string;
}

export function BoardGridLayout<T>({
    columns,
    renderItem,
    renderColumn,
    currentMobileColumnIndex: externalIndex,
    onMobileColumnChange,
    dragOverClasses = () => '',
    gridClassName = "gap-4 md:grid-cols-2 lg:grid-cols-3"
}: BoardGridLayoutProps<T>) {
    // Use internal state if not controlled
    const [internalIndex, setInternalIndex] = useState(0);
    const currentIndex = externalIndex ?? internalIndex;
    const setCurrentIndex = onMobileColumnChange ?? setInternalIndex;

    return (
        <>
            {/* Column Header Row - Desktop */}
            <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-2">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        onClick={() => {
                            const columnElement = document.querySelector(`[data-column-id="${column.id}"]`);
                            if (columnElement) {
                                columnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                            }
                        }}
                        className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: `${column.color}20` }}
                    >
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: column.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: column.color }}>
                            {column.label} ({column.items.length})
                        </span>
                    </div>
                ))}
            </div>

            {/* Column Header Row with Navigation - Mobile */}
            <div className="sm:hidden mb-4">
                <div className="grid grid-cols-3 gap-1.5">
                    {columns.map((column, index) => {
                        const isActive = index === currentIndex;
                        return (
                            <div
                                key={column.id}
                                onClick={() => setCurrentIndex(index)}
                                className={`flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${isActive ? 'ring-2 ring-offset-1' : ''
                                    }`}
                                style={{
                                    backgroundColor: `${column.color}20`,
                                    ...(isActive && { '--tw-ring-color': column.color } as React.CSSProperties)
                                }}
                            >
                                <div
                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: column.color }}
                                />
                                <span className="text-xs font-medium truncate flex-1 min-w-0" style={{ color: column.color }}>
                                    {column.label} ({column.items.length})
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Mobile Single Column Layout */}
            <div className="sm:hidden">
                {columns.map((column, index) => {
                    if (index !== currentIndex) return null;

                    if (renderColumn) {
                        return (
                            <div key={column.id} data-column-id={column.id}>
                                {renderColumn(column)}
                            </div>
                        );
                    }

                    return (
                        <Card
                            key={column.id}
                            className={`h-96 overflow-y-auto ${dragOverClasses(column.id)}`}
                            style={{
                                backgroundColor: `${column.color}20`,
                                borderColor: `${column.color}40`,
                                color: column.color
                            }}
                            data-column-id={column.id}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    {column.label}
                                    <Badge variant="secondary" className="ml-2">
                                        {column.items.length}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {column.items.map((item, itemIndex) => (
                                        <div key={itemIndex}>
                                            {renderItem(item, itemIndex)}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Desktop Grid */}
            <div className={`hidden sm:grid ${gridClassName}`}>
                {columns.map((column) => (
                    renderColumn ? (
                        <div key={column.id} data-column-id={column.id}>
                            {renderColumn(column)}
                        </div>
                    ) : (
                        <Card
                            key={column.id}
                            className={dragOverClasses(column.id)}
                            style={{
                                backgroundColor: `${column.color}20`,
                                borderColor: `${column.color}40`,
                                color: column.color
                            }}
                            data-column-id={column.id}
                        >
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">
                                    {column.label}
                                    <Badge variant="secondary" className="ml-2">
                                        {column.items.length}
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {column.items.map((item, index) => (
                                        <div key={index}>
                                            {renderItem(item, index)}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                ))}
            </div>
        </>
    );
}
