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
  updateGoalAtom,
  settingsAtom
} from '@/stores/appStore';
import type { Goal } from '@/types';

// Draggable Goal Card Component
function DraggableGoalCard({ goal, onEdit, onDelete, settings }: { 
  goal: Goal; 
  onEdit: (goal: Goal) => void; 
  onDelete: (goalId: string) => void;
  settings: any;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: goal.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getPriorityColor = (priority: string) => {
    const prioritySetting = settings.priorityColors?.[priority];
    if (prioritySetting) {
      return `bg-[${prioritySetting}]20 text-[${prioritySetting}] border-[${prioritySetting}]40`;
    }
    // Fallback colors
    switch (priority) {
      case 'Q1':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Q2':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Q3':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Q4':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    const categorySetting = settings.goalTypes?.find((type: any) => type.name === category);
    if (categorySetting) {
      return `bg-[${categorySetting.color}]20 text-[${categorySetting.color}] border-[${categorySetting.color}]40`;
    }
    // Fallback colors
    switch (category) {
      case 'Spiritual':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Physical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Intellectual':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Social':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Financial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Protector':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGoalTypeColor = (goalType: string) => {
    const goalTypeSetting = settings.goalCategories?.find((cat: any) => cat.name.toLowerCase().replace('/', '-') === goalType);
    if (goalTypeSetting) {
      return `bg-[${goalTypeSetting.color}]20 text-[${goalTypeSetting.color}] border-[${goalTypeSetting.color}]40`;
    }
    // Fallback colors
    switch (goalType) {
      case 'target':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lifestyle-value':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-blue-600" />
          {goal.title}
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
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
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          <Badge variant="outline" className={`text-xs ${getCategoryColor(goal.category)}`}>
            {goal.category}
          </Badge>
          <Badge variant="outline" className={`text-xs ${getGoalTypeColor(goal.goalType)}`}>
            {goal.goalType === 'target' ? 'Target' : 'Lifestyle/Value'}
          </Badge>
          <Badge variant="outline" className={`text-xs ${getPriorityColor(goal.priority)}`}>
            {goal.priority}
          </Badge>
        </div>

        {goal.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{goal.description}</p>
        )}

        <div className="text-xs text-muted-foreground">
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
  onDelete,
  settings
}: { 
  status: { id: string; name: string }; 
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  settings: any;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: status.id,
  });

  const statusColor = settings.statusColors?.[status.id] || '#6B7280';
  
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
          borderColor: isOver ? '#3B82F6' : statusColor + '40',
          backgroundColor: isOver ? '#EFF6FF' : statusColor + '10'
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
              settings={settings}
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
  const [settings] = useAtom(settingsAtom);
  const [, updateGoal] = useAtom(updateGoalAtom);

  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Define status columns for Kanban
  const statusColumns = [
    { id: 'icebox', name: 'Icebox' },
    { id: 'backlog', name: 'Backlog' },
    { id: 'todo', name: 'To Do' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'review', name: 'Review' },
    { id: 'done', name: 'Done' }
  ];

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
          const statusColor = settings.statusColors?.[column.id] || '#6B7280';
          
          return (
            <div key={column.id} className="bg-card p-3 sm:p-4 rounded-lg border">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: statusColor }}
                ></div>
                <span className="text-xs sm:text-sm font-medium">{column.name}</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold mt-1">{goalCount}</p>
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
                  settings={settings}
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
                  settings={settings}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
