import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Target,
    MoreVertical,
    ChevronUp,
    ChevronDown,
    Plus,
    CheckCircle2,
    Circle,
    Heart,
    Users,
    Brain,
    Dumbbell,
    TrendingUp,
    Edit,
    Trash2
} from 'lucide-react';
import type { Goal } from '@/types';

interface FocusGoalsGridProps {
    goalsByType: Record<string, Goal[]>;
    goalSettings: any;
    onAddGoal: (type: string) => void;
    onToggleComplete: (goal: Goal) => void;
    onEditGoal: (goal: Goal) => void;
    onDeleteGoal: (goal: Goal) => void;
    onViewAllGoals: () => void;
}

const goalTypeIcons = {
    spiritual: Heart,
    social: Users,
    intellectual: Brain,
    physical: Dumbbell,
    financial: TrendingUp,
    protector: Target
};

export function FocusGoalsGrid({
    goalsByType,
    goalSettings,
    onAddGoal,
    onToggleComplete,
    onEditGoal,
    onDeleteGoal,
    onViewAllGoals
}: FocusGoalsGridProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [openSectionDropdown, setOpenSectionDropdown] = useState(false);
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

    const getGoalTypeInfo = (goalType: string) => {
        const type = goalSettings.goalTypes.find((gt: any) => gt.name === goalType);
        return type || { name: goalType, color: '#6B7280', description: '' };
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    Goals
                </h2>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => setOpenSectionDropdown(!openSectionDropdown)}
                        >
                            <MoreVertical className="h-3.5 w-3.5" />
                        </Button>
                        {openSectionDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setOpenSectionDropdown(false)} />
                                <div className="absolute right-0 top-7 z-50 w-40 bg-background border rounded-md shadow-lg py-1">
                                    <button
                                        className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2"
                                        onClick={() => {
                                            setIsExpanded(!isExpanded);
                                            setOpenSectionDropdown(false);
                                        }}
                                    >
                                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                                        {isExpanded ? 'Collapse' : 'Expand'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                    {['Spiritual', 'Social', 'Intellectual', 'Physical'].map((goalType) => {
                        const typeInfo = getGoalTypeInfo(goalType);
                        const IconComponent = goalTypeIcons[goalType.toLowerCase() as keyof typeof goalTypeIcons] || Target;
                        const goalsOfType = goalsByType[goalType] || [];
                        const typeColor = goalSettings.getTypeColor(goalType);

                        return (
                            <Card
                                key={goalType}
                                className="border-2 cursor-pointer hover:shadow-md transition-shadow h-full flex flex-col"
                                style={{ borderColor: typeColor }}
                                onClick={onViewAllGoals}
                            >
                                <CardHeader className="p-2 sm:p-3 space-y-0">
                                    <div className="flex items-center justify-between gap-1">
                                        <div className="flex items-center gap-1.5 flex-1 truncate">
                                            <IconComponent className="h-3.5 w-3.5 shrink-0" style={{ color: typeColor }} />
                                            <span className="text-xs font-semibold truncate">{typeInfo.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] px-1.5 h-5 shrink-0"
                                                style={{ backgroundColor: typeColor + '20', color: typeColor }}
                                            >
                                                {goalsOfType.length}
                                            </Badge>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-5 w-5 p-0 hover:bg-transparent"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onAddGoal(goalType);
                                                }}
                                            >
                                                <Plus className="h-3 w-3" style={{ color: typeColor }} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-2 sm:p-3 pt-0 flex-1">
                                    {goalsOfType.length === 0 ? (
                                        <p className="text-[10px] text-muted-foreground italic">No goals</p>
                                    ) : (
                                        <div className="space-y-1">
                                            {goalsOfType.slice(0, 2).map((goal) => {
                                                const isDropdownOpen = openDropdownId === goal.id;
                                                return (
                                                    <div key={goal.id} className="flex items-center gap-1.5 group relative">
                                                        <div className="shrink-0">
                                                            {goal.completed ? (
                                                                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                                            ) : (
                                                                <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <p className="text-xs font-medium truncate flex-1">{goal.title}</p>
                                                        <div className="relative shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenDropdownId(isDropdownOpen ? null : goal.id);
                                                                }}
                                                            >
                                                                <MoreVertical className="h-3 w-3" />
                                                            </Button>
                                                            {isDropdownOpen && (
                                                                <>
                                                                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                                                                    <div className="absolute right-0 top-5 z-50 w-32 bg-background border rounded-md shadow-lg py-1 divide-y divide-border">
                                                                        <button
                                                                            className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-muted flex items-center gap-1.5"
                                                                            onClick={() => { onToggleComplete(goal); setOpenDropdownId(null); }}
                                                                        >
                                                                            {goal.completed ? <Circle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                                                            {goal.completed ? 'Uncomplete' : 'Complete'}
                                                                        </button>
                                                                        <button
                                                                            className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-muted flex items-center gap-1.5"
                                                                            onClick={() => { onEditGoal(goal); setOpenDropdownId(null); }}
                                                                        >
                                                                            <Edit className="h-3 w-3" /> Edit
                                                                        </button>
                                                                        <button
                                                                            className="w-full text-left px-2 py-1.5 text-[10px] hover:bg-muted flex items-center gap-1.5 text-red-600"
                                                                            onClick={() => { onDeleteGoal(goal); setOpenDropdownId(null); }}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" /> Delete
                                                                        </button>
                                                                    </div>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {goalsOfType.length > 2 && (
                                                <p className="text-[8px] text-muted-foreground mt-0.5">+{goalsOfType.length - 2} more</p>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
