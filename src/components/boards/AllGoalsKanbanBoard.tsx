import { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Edit, Trash2 } from 'lucide-react';
import { 
  goalsAtom, 
  updateGoalAtom
} from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import type { Goal } from '@/types';

// Draggable Goal Card Component
function DraggableGoalCard({ goal, onEdit, onDelete }: { 
  goal: Goal; 
  onEdit: (goal: Goal) => void; 
  onDelete: (goalId: string) => void;
}) {
  const goalSettings = useGoalSettings();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: goal.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getPriorityColor = (priority: string) => {
    const priorityColor = goalSettings.getPriorityColor(priority);
    return {
      backgroundColor: `${priorityColor}20`,
      color: priorityColor,
      borderColor: `${priorityColor}40`
    };
  };

  const getCategoryColor = (category: string) => {
    const categoryColor = goalSettings.getTypeColor(category);
    return {
      backgroundColor: `${categoryColor}20`,
      color: categoryColor,
      borderColor: `${categoryColor}40`
    };
  };

  const getGoalTypeColor = (goalType: string) => {
    const goalTypeColor = goalSettings.getCategoryColor(goalType);
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
    switch (status) {
      case 'icebox':
        return 'Icebox';
      case 'backlog':
        return 'Backlog';
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };


  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`cursor-grab hover:shadow-md transition-shadow ${isDragging ? 'opacity-50' : ''}`}
      {...attributes}
      {...listeners}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-3 pt-3">
        <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1.5 line-clamp-1">
          <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
          <span className="truncate">{goal.title}</span>
        </CardTitle>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            className="h-5 w-5 p-0 sm:h-6 sm:w-6"
          >
            <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this goal?')) {
                onDelete(goal.id);
              }
            }}
            className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:h-6 sm:w-6"
          >
            <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 px-3 pb-3">
        {/* Badges */}
        <div className="flex flex-wrap gap-0.5">
          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getStatusColor(goal.status)}>
            {getStatusText(goal.status)}
          </Badge>
          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getCategoryColor(goal.category)}>
            {goal.category}
          </Badge>
          <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getGoalTypeColor(goal.goalType)}>
            {goal.goalType === 'target' ? 'Target' : 'Lifestyle/Value'}
          </Badge>
          {goal.priority && (
            <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getPriorityColor(goal.priority)}>
              {goal.priority}
            </Badge>
          )}
        </div>

        {goal.description && (
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{goal.description}</p>
        )}

        <div className="text-[10px] sm:text-xs text-muted-foreground">
          Stories: {goal.storyIds?.length || 0}
        </div>
      </CardContent>
    </Card>
  );
}

// Droppable Column Component
function DroppableColumn({ 
  status, 
  goals, 
  onEdit, 
  onDelete
}: { 
  status: { id: string; name: string }; 
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}) {
  const goalSettings = useGoalSettings();
  const { isOver, setNodeRef } = useDroppable({
    id: status.id,
  });

  const statusColor = goalSettings.getStatusColor(status.id);
  
  return (
    <div className="flex-1 flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">{status.name}</h3>
          <Badge variant="outline" className="text-xs">
            {goals.length} goals
          </Badge>
        </div>
      </div>
      
      <div 
        ref={setNodeRef}
        className={`flex-1 space-y-3 p-3 rounded-lg border-2 border-dashed transition-colors overflow-y-auto ${
          isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
        style={{
          borderColor: isOver ? goalSettings.weightBaseColor : statusColor + '40',
          backgroundColor: isOver ? goalSettings.weightBaseColor + '20' : statusColor + '10'
        }}
      >
        {goals.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No goals</p>
            </div>
          </div>
        ) : (
          goals.map((goal) => (
            <DraggableGoalCard
              key={goal.id}
              goal={goal}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface AllGoalsKanbanBoardProps {
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
}

export function AllGoalsKanbanBoard({ onAddGoal, onEditGoal, onDeleteGoal }: AllGoalsKanbanBoardProps) {
  const [goals] = useAtom(goalsAtom);
  const goalSettings = useGoalSettings();
  const [, updateGoal] = useAtom(updateGoalAtom);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Define status columns for Kanban using goal statuses from settings
  const statusColumns = goalSettings.goalStatuses.map(status => ({
    id: status.name.toLowerCase().replace(' ', '-'),
    name: status.name
  }));

  // Group goals by status
  const goalsByStatus = statusColumns.reduce((acc, status) => {
    acc[status.id] = goals.filter(goal => goal.status === status.id);
    return acc;
  }, {} as Record<string, Goal[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const goalId = active.id as string;
    const overId = over.id as string;

    // Find the target status
    const targetStatus = statusColumns.find(status => status.id === overId);
    if (targetStatus) {
      const goal = goals.find(g => g.id === goalId);
      if (goal && goal.status !== targetStatus.id) {
        updateGoal(goalId, { status: targetStatus.id as any });
      }
    }
  };

  const activeGoal = activeId ? goals.find(g => g.id === activeId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Goals</h2>
          <p className="text-sm text-muted-foreground">
            Manage your goals and track their progress
          </p>
        </div>
        <Button onClick={onAddGoal} className="gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 mb-6">
        {statusColumns.map((column) => {
          const goalCount = goalsByStatus[column.id]?.length || 0;
          const statusColor = goalSettings.getStatusColor(column.id);
          
          return (
            <div key={column.id} className="bg-card p-3 sm:p-4 rounded-lg border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: statusColor }}
                  ></div>
                  <span className="text-xs sm:text-sm font-medium">{column.name}</span>
                </div>
                <span className="text-lg sm:text-2xl font-bold">{goalCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 h-full overflow-x-auto">
            {statusColumns.map((status) => (
              <div key={status.id} className="flex-1 min-w-0 sm:min-w-[200px]">
                <DroppableColumn
                  status={status}
                  goals={goalsByStatus[status.id] || []}
                  onEdit={onEditGoal}
                  onDelete={onDeleteGoal}
                />
              </div>
            ))}
          </div>

          <DragOverlay>
            {activeGoal ? (
              <div className="opacity-50">
                <DraggableGoalCard
                  goal={activeGoal}
                  onEdit={onEditGoal}
                  onDelete={onDeleteGoal}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
