import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { StoryCard } from '@/components/boards/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { 
  projectsAtom,
  storiesAtom, 
  columnsAtom,
  moveStoryAtom
} from '@/stores/appStore';
import type { Project, Story } from '@/types';

interface ProjectKanbanBoardProps {
  project: Project;
  onClose: () => void;
}

export function ProjectKanbanBoard({ project, onClose }: ProjectKanbanBoardProps) {
  const [projects] = useAtom(projectsAtom);
  const [stories] = useAtom(storiesAtom);
  const [columns] = useAtom(columnsAtom);
  const [, moveStory] = useAtom(moveStoryAtom);
  // const [, updateStory] = useAtom(updateStoryAtom);

  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

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

  const handleStoryClick = (storyId: string, event: React.MouseEvent) => {
    const story = stories.find(s => s.id === storyId);
    if (story) {
      setEditingStory(story);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
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
      <div className="flex-1 p-4 overflow-hidden">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto">
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80">
                <KanbanColumn
                  column={column}
                  stories={storiesByColumn[column.id] || []}
                  selectedStories={[]}
                  onStoryClick={handleStoryClick}
                  onEditStory={handleEditStory}
                  projectId={project.id}
                />
              </div>
            ))}
          </div>

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
