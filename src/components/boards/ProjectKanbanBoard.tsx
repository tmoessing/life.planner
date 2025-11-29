import { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { StoryCard } from '@/components/shared/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

      {/* Column Header Row - Desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 px-4 mb-2">
        {columns.map((column) => {
          const columnStories = storiesByColumn[column.id] || [];
          const statusColor = storySettings.getStatusColor(column.id);
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
                {column.name} {columnStories.length}
              </span>
            </div>
          );
        })}
      </div>

      {/* Column Header Row with Navigation Arrows - Mobile */}
      <div className="sm:hidden mb-4 px-4">
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
            {columns.map((column, index) => {
              const columnStories = storiesByColumn[column.id] || [];
              const statusColor = storySettings.getStatusColor(column.id);
              const isActive = columns[currentMobileColumnIndex]?.id === column.id;
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
            onClick={() => setCurrentMobileColumnIndex(prev => Math.min(columns.length - 1, prev + 1))}
            disabled={currentMobileColumnIndex === columns.length - 1}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 p-4 overflow-hidden pb-20 lg:pb-4">
        <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 h-full overflow-x-auto mobile-scroll pb-4">
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80" data-column-id={column.id}>
                <KanbanColumn
                  column={column}
                  stories={storiesByColumn[column.id] || []}
                  selectedStories={[]}
                  onStoryClick={handleStoryClick}
                  onEditStory={handleEditStory}
                  projectId={project.id}
                  allColumnIds={allColumnIds}
                  onMoveToColumn={handleMoveToColumn}
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
