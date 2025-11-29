import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { sprintStoriesByStatusAtom, storiesAtom, moveStoryAtom, updateStoryAtom } from '@/stores/appStore';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { StoryCard } from '@/components/shared/StoryCard';
import { Button } from '@/components/ui/button';
import { Undo, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStorySettings } from '@/utils/settingsMirror';
import type { Story } from '@/types';

interface SprintKanbanBoardProps {
  showAllSprints?: boolean;
}

export function SprintKanbanBoard({ showAllSprints = false }: SprintKanbanBoardProps) {
  const [sprintStoriesByStatus] = useAtom(sprintStoriesByStatusAtom);
  const [allStories] = useAtom(storiesAtom);
  const storySettings = useStorySettings();
  
  // Use all stories if showAllSprints is true, otherwise use sprint-specific stories
  const storiesByStatus = showAllSprints ? 
    allStories.reduce((acc, story) => {
      if (!story.deleted) {
        const status = story.status;
        if (!acc[status]) acc[status] = [];
        acc[status].push(story);
      }
      return acc;
    }, {} as Record<string, Story[]>) : 
    sprintStoriesByStatus;
  
  
  // Define the status columns
  // When viewing a specific sprint (not all sprints), hide icebox and backlog columns
  const allStatusColumns = [
    { id: 'icebox', name: 'Icebox' as const, storyIds: [] },
    { id: 'backlog', name: 'Backlog' as const, storyIds: [] },
    { id: 'todo', name: 'To Do' as const, storyIds: [] },
    { id: 'progress', name: 'In Progress' as const, storyIds: [] },
    { id: 'review', name: 'Review' as const, storyIds: [] },
    { id: 'done', name: 'Done' as const, storyIds: [] }
  ];
  
  const statusColumns = showAllSprints 
    ? allStatusColumns 
    : allStatusColumns.filter(col => col.id !== 'icebox' && col.id !== 'backlog');
  const [, moveStory] = useAtom(moveStoryAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  // const [, deleteStory] = useAtom(deleteStoryAtom);
  // const [, addStory] = useAtom(addStoryAtom);
  // const [, updateStory] = useAtom(updateStoryAtom);
  
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [, setLastSelectedIndex] = useState<number | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousColumnId?: string;
    story?: Story;
  }>>([]);
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleMoveToColumn = (storyId: string, targetColumnId: string) => {
    // Find which column the story is currently in
    let fromColumnId = '';
    for (const [columnId, stories] of Object.entries(storiesByStatus)) {
      if (stories.some(story => story.id === storyId)) {
        fromColumnId = columnId;
        break;
      }
    }

    if (fromColumnId && fromColumnId !== targetColumnId) {
      // Add to undo stack before moving
      setUndoStack(prev => [...prev, {
        type: 'move',
        storyId,
        previousColumnId: fromColumnId
      }]);
      moveStory(storyId, targetColumnId);
    }
  };

  const allColumnIds = statusColumns.map(col => col.id);

  const handleDragStart = (event: DragStartEvent) => {
    const storyId = event.active.id as string;
    setActiveId(storyId);
    
    // Find the active story
    const story = Object.values(storiesByStatus)
      .flat()
      .find(s => s.id === storyId);
    setActiveStory(story || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find the active story
    const activeStory = Object.values(storiesByStatus)
      .flat()
      .find(story => story.id === activeId);

    if (!activeStory) return;

    // Find the target status
    const targetStatus = statusColumns.find(col => col.id === overId);
    if (!targetStatus) return;

    // Prevent dragging to icebox/backlog when viewing a specific sprint
    if (!showAllSprints && (targetStatus.id === 'icebox' || targetStatus.id === 'backlog')) {
      return;
    }

    // Set drag over column for visual feedback
    setDragOverColumn(targetStatus.id);

    // Check if story is already in this status
    if (activeStory.status === targetStatus.id) return;

    // Handle recurring instances differently
    if (activeStory._isRecurringInstance && activeStory._originalId) {
      // For recurring instances, we need to update the instance status in the original story
      const originalStory = allStories.find(s => s.id === activeStory._originalId);
      if (originalStory && originalStory.repeat) {
        const instanceDate = activeStory._instanceDate;
        if (instanceDate) {
          // Update the instance status in the original story's repeat.instances
          const updatedRepeat = {
            ...originalStory.repeat,
            instances: {
              ...originalStory.repeat.instances,
              [instanceDate]: {
                ...originalStory.repeat.instances?.[instanceDate],
                status: targetStatus.id as any,
                modified: true
              }
            }
          };
          
          // Update the story with the new repeat configuration
          updateStory(originalStory.id, { repeat: updatedRepeat });
        }
      }
    } else {
      // For regular stories, use the normal move logic
      moveStory(activeId, targetStatus.id);
    }
  };

  const handleDragEnd = (_event: DragEndEvent) => {
    setActiveId(null);
    setActiveStory(null);
    setDragOverColumn(null);
  };

  const handleStoryClick = (storyId: string, event: React.MouseEvent, _storyList?: Story[], _index?: number) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedStories(prev => 
        prev.includes(storyId) 
          ? prev.filter(id => id !== storyId)
          : [...prev, storyId]
      );
      setLastSelectedIndex(selectedStories.length);
    } else {
      // Single select
      setSelectedStories([storyId]);
      setLastSelectedIndex(0);
    }
  };


  const handleUndo = () => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return;

    if (lastAction.type === 'delete' && lastAction.story) {
      // Restore the story - would need to implement story restoration
      // Restore story from undo history
    } else if (lastAction.type === 'move' && lastAction.previousColumnId) {
      // Move story back to previous status
      moveStory(lastAction.storyId, lastAction.previousColumnId);
    }

    // Remove from undo stack
    setUndoStack(prev => prev.slice(0, -1));
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStory(null);
  };


  // Clear selection when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.story-card') && !target.closest('.kanban-column')) {
        setSelectedStories([]);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Undo Button */}
        {undoStack.length > 0 && (
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              className="gap-2"
            >
              <Undo className="h-4 w-4" />
              Undo
            </Button>
          </div>
        )}

        {/* Column Header Row - Desktop */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-2">
          {statusColumns.map((column) => {
            const columnStories = storiesByStatus[column.id] || [];
            const statusColor = storySettings.getStatusColor(column.id);
            return (
              <div
                key={column.id}
                onClick={() => {
                  // Scroll to the column on desktop
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
                  {column.name} {columnStories.length}
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
                const columnStories = storiesByStatus[column.id] || [];
                const statusColor = storySettings.getStatusColor(column.id);
                const isActive = statusColumns[currentMobileColumnIndex]?.id === column.id;
                return (
                  <div
                    key={column.id}
                    onClick={() => setCurrentMobileColumnIndex(index)}
                    className={`flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                      isActive ? 'ring-2 ring-offset-1' : ''
                    }`}
                    style={{ 
                      backgroundColor: `${statusColor}20`,
                      ...(isActive && { '--tw-ring-color': statusColor } as React.CSSProperties)
                    }}
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: statusColor }}
                    />
                    <span className="text-xs font-medium truncate flex-1 min-w-0" style={{ color: statusColor }}>
                      {column.name} {columnStories.length}
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
        {/* Desktop Grid Layout */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {statusColumns.map((column) => (
            <div key={column.id} className="min-w-0" data-column-id={column.id}>
              <KanbanColumn
                column={column}
                stories={storiesByStatus[column.id] || []}
                onStoryClick={handleStoryClick}
                onEditStory={handleEditStory}
                selectedStories={selectedStories}
                isDragOver={dragOverColumn === column.id}
                activeStoryId={activeId || undefined}
                activeStory={activeStory}
                allColumnIds={allColumnIds}
                onMoveToColumn={handleMoveToColumn}
              />
            </div>
          ))}
        </div>

        {/* Mobile Single Column Layout */}
        <div className="sm:hidden">
          {statusColumns.map((column, index) => (
            <div
              key={column.id}
              className={index === currentMobileColumnIndex ? 'block' : 'hidden'}
            >
              <KanbanColumn
                column={column}
                stories={storiesByStatus[column.id] || []}
                onStoryClick={handleStoryClick}
                onEditStory={handleEditStory}
                selectedStories={selectedStories}
                isDragOver={dragOverColumn === column.id}
                activeStoryId={activeId || undefined}
                activeStory={activeStory}
                allColumnIds={allColumnIds}
                onMoveToColumn={handleMoveToColumn}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingStory && (
        <EditStoryModal
          story={editingStory}
          open={showEditModal}
          onOpenChange={handleCloseEditModal}
        />
      )}

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (() => {
          const story = Object.values(storiesByStatus)
            .flat()
            .find(story => story.id === activeId);
          return story ? (
            <div className="opacity-50">
              <StoryCard
                story={story}
                isSelected={false}
              />
            </div>
          ) : null;
        })() : null}
      </DragOverlay>
    </DndContext>
  );
}
