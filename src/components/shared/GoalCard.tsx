import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Target, Edit, Snowflake, Layers, Circle, PlayCircle, Eye, CheckCircle2,
    Heart, Users, Brain, Dumbbell, DollarSign, Shield, Trophy
} from 'lucide-react';
import { useGoalSettings } from '@/utils/settingsMirror';
import type { Goal } from '@/types';

interface GoalCardProps extends React.HTMLAttributes<HTMLDivElement> {
    goal: Goal;
    onEdit?: (goal: Goal) => void;
    onStatusChange?: (goalId: string, newStatus: Goal['status']) => void;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void; // Override to match standard onClick but can also pass goal if needed via wrapper or just rely on parent handling
    showActions?: boolean;
    isDragging?: boolean;
}

const STATUS_CYCLE: Goal['status'][] = ['icebox', 'backlog', 'todo', 'in-progress', 'review', 'done'];

export function GoalCard({
    goal,
    onEdit,
    onStatusChange,
    onClick,
    className = '',
    style,
    showActions = true,
    isDragging = false,
    ...props
}: GoalCardProps) {
    const goalSettings = useGoalSettings();

    const handleStatusClick = (e: React.MouseEvent) => {
        if (!onStatusChange) return;
        e.stopPropagation();
        const currentIndex = STATUS_CYCLE.indexOf(goal.status);
        const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length;
        onStatusChange(goal.id, STATUS_CYCLE[nextIndex]);
    };

    const getPriorityColor = (priority: string) => {
        const priorityColor = goalSettings.getPriorityColor(priority);
        return {
            backgroundColor: `${priorityColor}20`,
            color: priorityColor,
            borderColor: `${priorityColor}40`
        };
    };

    const getGoalTypeColor = (goalType: string) => {
        const goalTypeColor = goalSettings.getTypeColor(goalType);
        return {
            backgroundColor: `${goalTypeColor}20`,
            color: goalTypeColor,
            borderColor: `${goalTypeColor}40`
        };
    };

    const getStatusColor = (status: string) => {
        const statusColor = goalSettings.getStatusColor(status);
        return {
            backgroundColor: `${statusColor}20`,
            color: statusColor,
            borderColor: `${statusColor}40`
        };
    };

    const getStatusText = (status: string) => {
        const statusObj = goalSettings.goalStatuses.find(s => s.name.toLowerCase().replace(' ', '-') === status);
        return statusObj?.name || status;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'icebox': return <Snowflake className="h-3 w-3" />;
            case 'backlog': return <Layers className="h-3 w-3" />;
            case 'todo': return <Circle className="h-3 w-3" />;
            case 'in-progress': return <PlayCircle className="h-3 w-3" />;
            case 'review': return <Eye className="h-3 w-3" />;
            case 'done': return <CheckCircle2 className="h-3 w-3" />;
            default: return null;
        }
    };

    const getGoalTypeIcon = (goalType: string) => {
        switch (goalType) {
            case 'Spiritual': return <Heart className="h-3 w-3" />;
            case 'Social': return <Users className="h-3 w-3" />;
            case 'Intellectual': return <Brain className="h-3 w-3" />;
            case 'Physical': return <Dumbbell className="h-3 w-3" />;
            case 'Financial': return <DollarSign className="h-3 w-3" />;
            case 'Protector': return <Shield className="h-3 w-3" />;
            default: return null;
        }
    };

    const getPriorityLetter = (priority: string) => {
        switch (priority) {
            case 'high': return 'H';
            case 'medium': return 'M';
            case 'low': return 'L';
            default: return priority.charAt(0).toUpperCase();
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(goal);
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(e);
    };

    return (
        <Card
            style={style}
            className={`
        glass-card
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''} 
        transition-all duration-200 
        ${isDragging ? 'opacity-50 scale-95' : ''}
        relative overflow-hidden rounded-lg border
        ${className}
      `}
            onClick={handleClick}
            {...props}
        >
            {/* Mobile: Single row layout */}
            <div className="sm:hidden p-2 flex items-center gap-2 min-h-[44px]">
                <Target className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-medium truncate flex-1 min-w-0">
                    {goal.title}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap flex items-center gap-0.5" style={getGoalTypeColor(goal.goalType)}>
                        {getGoalTypeIcon(goal.goalType)}
                    </Badge>
                    <Badge
                        variant="outline"
                        className={`text-[9px] px-1 py-0 h-4 whitespace-nowrap flex items-center gap-0.5 ${onStatusChange ? 'cursor-pointer hover:brightness-90 transition-all' : ''}`}
                        style={getStatusColor(goal.status)}
                        onClick={handleStatusClick}
                    >
                        {getStatusIcon(goal.status) || getStatusText(goal.status).substring(0, 4)}
                    </Badge>
                    {showActions && onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEdit}
                            className="h-7 w-7 p-0 flex-shrink-0 ml-1"
                        >
                            <Edit className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Desktop: Compact card layout */}
            <div className="hidden sm:block">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <Target className="h-3.5 w-3.5 text-blue-600 flex-shrink-0" />
                        <span className="text-xs font-medium truncate">{goal.title}</span>
                    </div>
                    {showActions && onEdit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleEdit}
                            className="h-5 w-5 p-0 flex-shrink-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Edit className="h-3 w-3" />
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="space-y-1 px-3 pb-2">
                    {/* Badges - compact */}
                    <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1" style={getGoalTypeColor(goal.goalType)}>
                            {getGoalTypeIcon(goal.goalType)}
                            {goal.goalType}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 flex items-center gap-1 ${onStatusChange ? 'cursor-pointer hover:brightness-90 transition-all' : ''}`}
                            style={getStatusColor(goal.status)}
                            onClick={handleStatusClick}
                        >
                            {getStatusIcon(goal.status)}
                            {getStatusText(goal.status)}
                        </Badge>
                        {goal.priority && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex items-center gap-1" style={getPriorityColor(goal.priority)}>
                                <Trophy className="h-3 w-3" />
                                {getPriorityLetter(goal.priority)}
                            </Badge>
                        )}
                    </div>

                    {goal.description && (
                        <p className="text-[10px] text-muted-foreground line-clamp-2 mt-1">
                            {goal.description}
                        </p>
                    )}

                    <div className="text-[10px] text-muted-foreground mt-1 text-right">
                        {goal.storyIds?.length || 0} stories
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}
