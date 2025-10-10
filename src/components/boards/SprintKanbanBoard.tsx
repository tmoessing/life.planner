import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { sprintStoriesByStatusAtom, storiesAtom, moveStoryAtom } from '@/stores/appStore';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { StoryCard } from '@/components/boards/StoryCard';
import { Button } from '@/components/ui/button';
import { Undo } from 'lucide-react';
import type { Story } from '@/types';

interface SprintKanbanBoardProps {
  showAllSprints?: boolean;
}

export function SprintKanbanBoard({ showAllSprints = false }: SprintKanbanBoardProps) {
  const [sprintStoriesByStatus] = useAtom(sprintStoriesByStatusAtom);
  const [allStories] = useAtom(storiesAtom);
  
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
  const statusColumns = [
    { id: 'icebox', name: 'Icebox' as const, storyIds: [] },
    { id: 'backlog', name: 'Backlog' as const, storyIds: [] },
    { id: 'todo', name: 'To Do' as const, storyIds: [] },
    { id: 'progress', name: 'In Progress' as const, storyIds: [] },
    { id: 'review', name: 'Review' as const, storyIds: [] },
    { id: 'done', name: 'Done' as const, storyIds: [] }
  ];
  const [, moveStory] = useAtom(moveStoryAtom);
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

    // Set drag over column for visual feedback
    setDragOverColumn(targetStatus.id);

    // Check if story is already in this status
    if (activeStory.status === targetStatus.id) return;

    // Move the story to the target status
    moveStory(activeId, targetStatus.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
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

  const handleStoryDoubleClick = (_story: Story) => {
    // Handle double click if needed
  };

  const handleDeleteStory = (_storyId: string) => {
    // Handle delete if needed
  };

  const handleUndo = () => {
    const lastAction = undoStack[undoStack.length - 1];
    if (!lastAction) return;

    if (lastAction.type === 'delete' && lastAction.story) {
      // Restore the story - would need to implement story restoration
      console.log('Restore story:', lastAction.story);
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

  const handleSaveStory = (_updatedStory: Story) => {
    // Handle save if needed
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

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusColumns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              stories={storiesByStatus[column.id] || []}
              onStoryClick={handleStoryClick}
              onEditStory={handleEditStory}
              selectedStories={selectedStories}
              isDragOver={dragOverColumn === column.id}
              activeStoryId={activeId || undefined}
              activeStory={activeStory}
            />
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
