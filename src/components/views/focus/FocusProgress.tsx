import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList, PlayCircle, Eye, CheckCircle2 } from 'lucide-react';

interface FocusProgressProps {
    progress: {
        totalWeight: number;
        completedWeight: number;
        totalStories: number;
        completedStories: number;
        inProgressStories: number;
        todoStories: number;
        reviewStories: number;
    };
    progressPercentage: number;
}

export function FocusProgress({ progress, progressPercentage }: FocusProgressProps) {
    return (
        <div className="w-full flex justify-center">
            <Card className="border w-full max-w-md">
                <CardContent className="px-2 sm:px-3 py-3 sm:py-4">
                    <div className="space-y-3 sm:space-y-4">
                        {/* Stories Progress Bar - Color Coded */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] sm:text-xs">
                                <span>Stories</span>
                                <div className="flex flex-row items-center gap-x-2 flex-wrap justify-end">
                                    <span className="text-yellow-600 flex items-center gap-1">
                                        <ClipboardList className="h-3 w-3" />
                                        To Do: {progress.todoStories}
                                    </span>
                                    <span className="text-blue-600 flex items-center gap-1">
                                        <PlayCircle className="h-3 w-3" />
                                        In Progress: {progress.inProgressStories}
                                    </span>
                                    <span className="text-purple-600 flex items-center gap-1">
                                        <Eye className="h-3 w-3" />
                                        Review: {progress.reviewStories}
                                    </span>
                                    <span className="text-green-600 flex items-center gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Done: {progress.completedStories}
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5 overflow-hidden flex">
                                {progress.totalStories > 0 ? (
                                    <>
                                        {/* To Do - Yellow */}
                                        {progress.todoStories > 0 && (
                                            <div
                                                className="bg-yellow-600 h-1 sm:h-1.5 transition-all duration-300"
                                                style={{ width: `${(progress.todoStories / progress.totalStories) * 100}%` }}
                                            />
                                        )}
                                        {/* In Progress - Blue */}
                                        {progress.inProgressStories > 0 && (
                                            <div
                                                className="bg-blue-600 h-1 sm:h-1.5 transition-all duration-300"
                                                style={{ width: `${(progress.inProgressStories / progress.totalStories) * 100}%` }}
                                            />
                                        )}
                                        {/* Review - Purple */}
                                        {progress.reviewStories > 0 && (
                                            <div
                                                className="bg-purple-600 h-1 sm:h-1.5 transition-all duration-300"
                                                style={{ width: `${(progress.reviewStories / progress.totalStories) * 100}%` }}
                                            />
                                        )}
                                        {/* Done - Green */}
                                        {progress.completedStories > 0 && (
                                            <div
                                                className="bg-green-600 h-1 sm:h-1.5 transition-all duration-300"
                                                style={{ width: `${(progress.completedStories / progress.totalStories) * 100}%` }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full" />
                                )}
                            </div>
                        </div>

                        {/* Weight Progress Bar */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <div className="flex justify-between text-[10px] sm:text-xs">
                                <span>Weight</span>
                                <span className="text-muted-foreground">{progress.completedWeight} / {progress.totalWeight}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5">
                                <div
                                    className="bg-blue-600 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
