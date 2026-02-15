import { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/components/forms/FilterBar';
import { BoardGridLayout } from '@/components/shared/BoardGridLayout';
import { Plus, Target, Search, Filter } from 'lucide-react';
import {
  goalsAtom,
  updateGoalAtom
} from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import type { Goal } from '@/types';

import { GoalCard } from '@/components/shared/GoalCard';

// Draggable Goal Card Component
function DraggableGoalCard({ goal, onEdit, onStatusChange }: {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onStatusChange?: (goalId: string, newStatus: Goal['status']) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: goal.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <GoalCard
        goal={goal}
        onEdit={onEdit}
        onStatusChange={onStatusChange}
        isDragging={isDragging}
        className="cursor-grab"
      />
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  status,
  goals,
  onEdit,
  onStatusChange
}: {
  status: { id: string; name: string };
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onStatusChange?: (goalId: string, newStatus: Goal['status']) => void;
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
          <h3 className="font-semibold text-lg">{status.name} {goals.length}</h3>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 p-3 rounded-lg border-2 border-dashed transition-colors overflow-y-auto ${isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
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
              onStatusChange={onStatusChange}
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

export function AllGoalsKanbanBoard({ onAddGoal, onEditGoal }: AllGoalsKanbanBoardProps) {
  const [goals] = useAtom(goalsAtom);
  const goalSettings = useGoalSettings();
  const [, updateGoal] = useAtom(updateGoalAtom);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

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

  // Initialize to "In Progress" column if it exists, otherwise default to first column
  const inProgressIndex = statusColumns.findIndex(col =>
    col.id === 'in-progress' || col.name.toLowerCase() === 'in progress'
  );
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(
    inProgressIndex >= 0 ? inProgressIndex : 0
  );

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

  const handleStatusChange = (goalId: string, newStatus: Goal['status']) => {
    updateGoal(goalId, { status: newStatus });
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
            className={`gap-2 ${showSearch ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'}`}
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
            className={`gap-2 ${showFilter ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'}`}
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

      {/* Kanban Board */}
      <div className="flex-1 min-h-0">
        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <BoardGridLayout
            columns={statusColumns.map((status) => ({
              id: status.id,
              label: status.name,
              items: goalsByStatus[status.id] || [],
              color: goalSettings.getStatusColor(status.id)
            }))}
            renderItem={() => null} // Not used when renderColumn is provided
            renderColumn={(column) => (
              <DroppableColumn
                status={{ id: column.id, name: column.label }}
                goals={column.items}
                onEdit={onEditGoal}
                onStatusChange={handleStatusChange}
              />
            )}
            currentMobileColumnIndex={currentMobileColumnIndex}
            onMobileColumnChange={setCurrentMobileColumnIndex}
            gridClassName="gap-2 sm:gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          />

          <DragOverlay>
            {activeGoal ? (
              <div className="opacity-50">
                <DraggableGoalCard
                  goal={activeGoal}
                  onEdit={onEditGoal}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
