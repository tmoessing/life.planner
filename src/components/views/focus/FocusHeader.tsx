import { Calendar } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';

interface FocusHeaderProps {
    viewMode: 'today' | 'week';
    setViewMode: (mode: 'today' | 'week') => void;
    isoWeek: number;
    year: number;
    startDate: Date;
    endDate: Date;
}

export function FocusHeader({
    viewMode,
    setViewMode,
    isoWeek,
    year,
    startDate,
    endDate
}: FocusHeaderProps) {
    const [isDraggingWeek, setIsDraggingWeek] = useState(false);
    const [isDraggingToday, setIsDraggingToday] = useState(false);

    return (
        <div className="flex flex-col gap-2 sm:gap-3">
            <div className="flex flex-row items-center justify-between gap-2 sm:gap-0">
                <div>
                    <p className="text-xs text-muted-foreground">
                        {viewMode === 'today'
                            ? new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            })
                            : `Week ${isoWeek}, ${year} • ${startDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })} – ${endDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                            })}`}
                    </p>
                </div>
                <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                        <span className="hidden sm:inline">
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                        <span className="sm:hidden">
                            {new Date().toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </span>
                </div>
            </div>

            {/* View Mode Toggle - Liquid glass with subtle drag interaction */}
            <Tabs
                value={viewMode}
                onValueChange={(value) => setViewMode(value as 'today' | 'week')}
                className="w-full sm:w-auto"
            >
                <TabsList
                    className="grid w-full sm:w-auto grid-cols-2 rounded-full bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
                >
                    <TabsTrigger
                        value="today"
                        className="text-xs sm:text-sm rounded-full cursor-grab active:cursor-grabbing data-[state=active]:bg-white/80 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white transition-colors"
                        draggable
                        onDragStart={() => setIsDraggingToday(true)}
                        onDragEnd={() => setIsDraggingToday(false)}
                        onDragOver={(e) => {
                            if (isDraggingWeek) {
                                e.preventDefault();
                            }
                        }}
                        onDrop={(e) => {
                            if (isDraggingWeek) {
                                e.preventDefault();
                                setViewMode('today');
                                setIsDraggingWeek(false);
                            }
                        }}
                    >
                        Today
                    </TabsTrigger>
                    <TabsTrigger
                        value="week"
                        className="text-xs sm:text-sm rounded-full cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={() => setIsDraggingWeek(true)}
                        onDragEnd={() => setIsDraggingWeek(false)}
                        onDragOver={(e) => {
                            if (isDraggingToday) {
                                e.preventDefault();
                            }
                        }}
                        onDrop={(e) => {
                            if (isDraggingToday) {
                                e.preventDefault();
                                setViewMode('week');
                                setIsDraggingToday(false);
                            }
                        }}
                    >
                        Week
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}
