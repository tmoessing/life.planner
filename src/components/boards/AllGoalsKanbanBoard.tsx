import { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FilterBar } from '@/components/forms/FilterBar';
import { Plus, Target, Edit, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  goalsAtom, 
  updateGoalAtom
} from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import type { Goal } from '@/types';

// Draggable Goal Card Component
function DraggableGoalCard({ goal, onEdit }: { 
  goal: Goal; 
  onEdit: (goal: Goal) => void; 
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
      {/* Mobile: Single row layout */}
      <div className="sm:hidden p-1.5 flex items-center gap-1.5 min-h-[44px]">
        <Target className="h-3 w-3 text-blue-600 flex-shrink-0" />
        <span className="text-xs font-medium truncate flex-1 min-w-0">
          {goal.title}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap" style={getStatusColor(goal.status)}>
            {getStatusText(goal.status).substring(0, 4)}
          </Badge>
          {goal.priority && (
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap" style={getPriorityColor(goal.priority)}>
              {goal.priority}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            className="h-11 w-11 sm:h-7 sm:w-7 p-0 flex-shrink-0"
          >
            <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      </div>

      {/* Desktop: Compact card layout */}
      <div className="hidden sm:block">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0.5 px-2 pt-2">
          <CardTitle className="text-[11px] sm:text-xs font-medium flex items-center gap-1 line-clamp-1">
            <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-blue-600 flex-shrink-0" />
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
              className="h-4 w-4 p-0 sm:h-5 sm:w-5"
            >
              <Edit className="h-2 w-2 sm:h-2.5 sm:w-2.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-0.5 px-2 pb-1.5">
        {/* Badges - compact */}
        <div className="flex flex-wrap gap-0.5">
          <Badge variant="outline" className="text-[9px] px-1 py-0" style={getStatusColor(goal.status)}>
            {getStatusText(goal.status).substring(0, 4)}
          </Badge>
          {goal.priority && (
            <Badge variant="outline" className="text-[9px] px-1 py-0" style={getPriorityColor(goal.priority)}>
              {goal.priority}
            </Badge>
          )}
        </div>

        {goal.description && (
          <p className="text-[9px] text-muted-foreground line-clamp-1">{goal.description}</p>
        )}

        <div className="text-[9px] text-muted-foreground">
          {goal.storyIds?.length || 0} stories
        </div>
        </CardContent>
      </div>
    </Card>
  );
}

// Droppable Column Component
function DroppableColumn({ 
  status, 
  goals, 
  onEdit
}: { 
  status: { id: string; name: string }; 
  goals: Goal[];
  onEdit: (goal: Goal) => void;
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
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(0);

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
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-lg sm:text-xl font-bold">Goals</h2>
        </div>

        {/* Search, Filter, and Add Goal Buttons - Right aligned */}
        <div className="flex items-center gap-2">
          <Button
            variant={showSearch ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setShowFilter(false);
            }}
            className={`gap-2 ${showSearch ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300'}`}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button
            variant={showFilter ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowFilter(!showFilter);
              if (showFilter) setShowSearch(false);
            }}
            className={`gap-2 ${showFilter ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300'}`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onAddGoal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Goal</span>
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div className="mb-4">
          <FilterBar showSearchOnly={true} />
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div className="mb-4">
          <FilterBar showFilterOnly={true} />
        </div>
      )}

      {/* Column Header Row - Desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-2">
        {statusColumns.map((column) => {
          const goalCount = goalsByStatus[column.id]?.length || 0;
          const statusColor = goalSettings.getStatusColor(column.id);
          return (
            <div
              key={column.id}
              onClick={() => {
                const columnElement = document.querySelector(`[data-column-id="${column.id}"]`);
                if (columnElement) {
                  columnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-sm font-medium" style={{ color: statusColor }}>
                {column.name}
              </span>
              <span className="text-xs text-muted-foreground ml-auto">
                {goalCount}
              </span>
            </div>
          );
        })}
      </div>

      {/* Column Header Row with Navigation Arrows - Mobile */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMobileColumnIndex(prev => Math.max(0, prev - 1))}
            disabled={currentMobileColumnIndex === 0}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            {statusColumns.map((column, index) => {
              const goalCount = goalsByStatus[column.id]?.length || 0;
              const statusColor = goalSettings.getStatusColor(column.id);
              const isActive = statusColumns[currentMobileColumnIndex]?.id === column.id;
              return (
                <div
                  key={column.id}
                  onClick={() => setCurrentMobileColumnIndex(index)}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                    isActive ? `ring-2 ring-offset-1 ring-[${statusColor}]` : ''
                  }`}
                  style={{ 
                    backgroundColor: `${statusColor}20`
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="text-xs font-medium truncate flex-1 min-w-0" style={{ color: statusColor }}>
                    {column.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {goalCount}
                  </span>
                </div>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMobileColumnIndex(prev => Math.min(statusColumns.length - 1, prev + 1))}
            disabled={currentMobileColumnIndex === statusColumns.length - 1}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          {/* Desktop Grid Layout */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-3">
            {statusColumns.map((status) => (
              <div key={status.id} className="min-w-0" data-column-id={status.id}>
                <DroppableColumn
                  status={status}
                  goals={goalsByStatus[status.id] || []}
                  onEdit={onEditGoal}
                />
              </div>
            ))}
          </div>

          {/* Mobile Single Column Layout */}
          <div className="sm:hidden">
            {statusColumns.map((status, index) => (
              <div
                key={status.id}
                className={index === currentMobileColumnIndex ? 'block' : 'hidden'}
              >
                <DroppableColumn
                  status={status}
                  goals={goalsByStatus[status.id] || []}
                  onEdit={onEditGoal}
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
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
