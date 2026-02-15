import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAtom } from 'jotai';
import { sprintStoriesByStatusAtom, storiesAtom, moveStoryAtom, updateStoryAtom, deleteStoryAtom } from '@/stores/appStore';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { StoryCard } from '@/components/shared/StoryCard';
import { Button } from '@/components/ui/button';
import { BoardGridLayout } from '@/components/shared/BoardGridLayout';
import { Undo, Trash2 } from 'lucide-react';
import { useStorySettings } from '@/utils/settingsMirror';
import { useShakeToUndo } from '@/hooks/useShakeToUndo';
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
  const allStatusColumns = useMemo(() => [
    { id: 'icebox', name: 'Icebox' as const, storyIds: [] },
    { id: 'backlog', name: 'Backlog' as const, storyIds: [] },
    { id: 'todo', name: 'To Do' as const, storyIds: [] },
    { id: 'progress', name: 'In Progress' as const, storyIds: [] },
    { id: 'review', name: 'Review' as const, storyIds: [] },
    { id: 'done', name: 'Done' as const, storyIds: [] }
  ], []);

  const statusColumns = useMemo(() =>
    showAllSprints
      ? allStatusColumns
      : allStatusColumns.filter(col => col.id !== 'icebox' && col.id !== 'backlog'),
    [showAllSprints, allStatusColumns]
  );
  const [, moveStory] = useAtom(moveStoryAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  // const [, addStory] = useAtom(addStoryAtom);
  // const [, updateStory] = useAtom(updateStoryAtom);

  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [, setLastSelectedIndex] = useState<number | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isOverDeleteZone, setIsOverDeleteZone] = useState(false);
  const [undoStack, setUndoStack] = useState<Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousColumnId?: string;
    story?: Story;
  }>>([]);
  // Initialize to "Backlog" column if showing all sprints, otherwise "To Do" for specific sprint
  const backlogIndex = statusColumns.findIndex(col => col.id === 'backlog');
  const todoIndex = statusColumns.findIndex(col => col.id === 'todo');
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(
    showAllSprints
      ? (backlogIndex >= 0 ? backlogIndex : 0)
      : (todoIndex >= 0 ? todoIndex : 0)
  );


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

  const handleDeleteStory = useCallback((storyId: string) => {
    // Find the story to store in undo stack
    const story = Object.values(storiesByStatus)
      .flat()
      .find(s => s.id === storyId);

    if (story) {
      // Add to undo stack before deleting
      setUndoStack(prev => [...prev, {
        type: 'delete',
        storyId,
        story: { ...story }
      }]);

      // Delete the story
      deleteStory(storyId);
    }
  }, [deleteStory, storiesByStatus]);

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
    if (!over) {
      setIsOverDeleteZone(false);
      setDragOverColumn(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if dragging over delete zone
    if (overId === 'delete-zone') {
      setIsOverDeleteZone(true);
      setDragOverColumn(null);
      return;
    } else {
      setIsOverDeleteZone(false);
    }

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    // Check if dropped on delete zone
    if (over && over.id === 'delete-zone') {
      const storyId = active.id as string;
      handleDeleteStory(storyId);
    }

    setActiveId(null);
    setActiveStory(null);
    setDragOverColumn(null);
    setIsOverDeleteZone(false);
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
      // Restore the story by setting deleted: false
      updateStory(lastAction.storyId, { deleted: false });
    } else if (lastAction.type === 'move' && lastAction.previousColumnId) {
      // Move story back to previous status
      moveStory(lastAction.storyId, lastAction.previousColumnId);
    }

    // Remove from undo stack
    setUndoStack(prev => prev.slice(0, -1));
  };

  // Enable shake to undo on mobile devices
  const hasUndoActions = undoStack.length > 0;
  useShakeToUndo({
    onUndo: handleUndo,
    enabled: hasUndoActions, // Only enable if there's something to undo
    threshold: 15,
    debounceTime: 1000
  });

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

  // Delete Zone Component
  function DeleteZone() {
    const { setNodeRef, isOver } = useDroppable({
      id: 'delete-zone',
    });

    const isHovering = isOver || isOverDeleteZone;

    return (
      <div
        ref={setNodeRef}
        className={`
          fixed left-1/2 transform -translate-x-1/2
          bottom-24 sm:bottom-6
          z-50 transition-all duration-200 ease-out
          ${activeId ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
          ${isHovering ? 'scale-110' : ''}
        `}
      >
        <div
          className={`
            flex items-center justify-center
            w-16 h-16 sm:w-20 sm:h-20 rounded-full
            transition-all duration-200
            ${isHovering
              ? 'bg-red-500 shadow-lg shadow-red-500/50 ring-4 ring-red-300/50'
              : 'bg-red-400 shadow-md'
            }
          `}
        >
          <Trash2
            className={`
              h-8 w-8 sm:h-10 sm:w-10 text-white
              transition-transform duration-200
              ${isHovering ? 'scale-110 rotate-12' : ''}
            `}
          />
        </div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Delete Zone - appears when dragging */}
        <DeleteZone />
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

        {/* Board Grid Layout */}
        <BoardGridLayout
          columns={statusColumns.map((column) => ({
            id: column.id,
            label: column.name,
            items: storiesByStatus[column.id] || [],
            color: storySettings.getStatusColor(column.id)
          }))}
          renderItem={() => null} // Handled by renderColumn
          renderColumn={(column) => (
            <div className="w-72 sm:w-auto h-full" data-column-id={column.id}>
              <KanbanColumn
                column={{ id: column.id, name: column.label as any, storyIds: [] }}
                stories={column.items}
                selectedStories={selectedStories}
                onStoryClick={handleStoryClick}
                onEditStory={handleEditStory}
                onDeleteStory={handleDeleteStory}
                isDragOver={dragOverColumn === column.id}
                activeStoryId={activeId || undefined}
                activeStory={activeStory}
                allColumnIds={allColumnIds}
                onMoveToColumn={handleMoveToColumn}
              />
            </div>
          )}
          currentMobileColumnIndex={currentMobileColumnIndex}
          onMobileColumnChange={setCurrentMobileColumnIndex}
          gridClassName="gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        />
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
