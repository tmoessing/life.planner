import { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { StoryCard } from '@/components/shared/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { BoardGridLayout } from '@/components/shared/BoardGridLayout';
import {
  storiesAtom,
  columnsAtom,
  moveStoryAtom
} from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import type { Project, Story } from '@/types';

interface ProjectKanbanBoardProps {
  project: Project;
  onClose: () => void;
}

export function ProjectKanbanBoard({ project, onClose }: ProjectKanbanBoardProps) {
  const [stories] = useAtom(storiesAtom);
  const [columns] = useAtom(columnsAtom);
  const [, moveStory] = useAtom(moveStoryAtom);
  const storySettings = useStorySettings();
  // const [, updateStory] = useAtom(updateStoryAtom);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(0);

  // Get project stories
  const projectStories = stories.filter(story =>
    project.storyIds?.includes(story.id) && !story.deleted
  );

  // Group stories by column
  const storiesByColumn = columns.reduce((acc, column) => {
    acc[column.id] = projectStories.filter(story =>
      column.storyIds.includes(story.id)
    );
    return acc;
  }, {} as Record<string, Story[]>);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const storyId = active.id as string;
    const overId = over.id as string;

    // Find the target column
    const targetColumn = columns.find(col => col.id === overId);
    if (targetColumn) {
      // Move story to target column
      const fromColumn = columns.find(col => col.storyIds.includes(storyId));
      if (fromColumn && fromColumn.id !== targetColumn.id) {
        moveStory(storyId, targetColumn.id);
      }
    }
  };

  const activeStory = activeId ? stories.find(s => s.id === activeId) : null;

  const handleStoryClick = (storyId: string, _event: React.MouseEvent) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      setEditingStory(story);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  const handleMoveToColumn = (storyId: string, targetColumnId: string) => {
    // Find which column the story is currently in
    const fromColumn = columns.find(col => col.storyIds.includes(storyId));
    const targetColumn = columns.find(col => col.id === targetColumnId);

    if (fromColumn && targetColumn && fromColumn.id !== targetColumn.id) {
      moveStory(storyId, targetColumnId);
    }
  };

  const allColumnIds = columns.map(col => col.id);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header - positioned below main app header */}
      <div className="border-b p-4 flex items-center justify-between mt-14 md:mt-16">
        <div>
          <h2 className="text-xl font-bold">{project.name} - Kanban Board</h2>
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        <button
          onClick={onClose}
          className="text-2xl font-bold hover:text-muted-foreground"
        >
          ×
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-4 overflow-hidden pb-20 lg:pb-4">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <BoardGridLayout
            columns={columns.map((column) => ({
              id: column.id,
              label: column.name,
              items: storiesByColumn[column.id] || [],
              color: storySettings.getStatusColor(column.id)
            }))}
            renderItem={() => null}
            renderColumn={(column) => (
              <div className="flex-shrink-0 w-80">
                <KanbanColumn
                  column={{ id: column.id, name: column.label as any, storyIds: [] }} // Mapping BoardColumn back to KanbanColumn props
                  stories={column.items}
                  selectedStories={[]}
                  onStoryClick={handleStoryClick}
                  onEditStory={handleEditStory}
                  projectId={project.id}
                  allColumnIds={allColumnIds}
                  onMoveToColumn={handleMoveToColumn}
                />
              </div>
            )}
            currentMobileColumnIndex={currentMobileColumnIndex}
            onMobileColumnChange={setCurrentMobileColumnIndex}
            // Use flex display for horizontal scrolling behavior if desired, or grid for standard grid
            // The original used flex horizontal scrolling.
            // BoardGridLayout uses grid by default.
            // If we want horizontal scrolling on desktop, we might need to override gridClassName and styles.
            // But user asked for "grid".
            gridClassName="gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          />

          <DragOverlay>
            {activeStory ? (
              <div className="opacity-50">
                <StoryCard story={activeStory} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Edit Story Modal */}
      {editingStory && (
        <EditStoryModal
          open={!!editingStory}
          onOpenChange={(open) => !open && setEditingStory(null)}
          story={editingStory}
        />
      )}
    </div>
  );
}
