import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { useDroppable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/shared/StoryCard';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { currentSprintAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { Plus, Weight } from 'lucide-react';
import type { Column, Story } from '@/types';

interface KanbanColumnProps {
  column: Column;
  stories: Story[];
  selectedStories: string[];
  onStoryClick: (storyId: string, event: React.MouseEvent, storyList?: Story[], index?: number) => void;
  onEditStory: (story: Story) => void;
  projectId?: string;
  activeStory?: Story | null;
  isDragOver?: boolean;
  activeStoryId?: string;
  // Kanban board context for swipe-to-move
  allColumnIds?: string[];
  onMoveToColumn?: (storyId: string, targetColumnId: string) => void;
  columnColor?: string; // Optional color override (e.g., from project settings)
}

export function KanbanColumn({ column, stories, selectedStories, onStoryClick, onEditStory, projectId, activeStory, allColumnIds, onMoveToColumn, columnColor: propColumnColor }: KanbanColumnProps) {
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [currentSprint] = useAtom(currentSprintAtom);
  const storySettings = useStorySettings();
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
    },
  });

  const getColumnColor = () => {
    // Use provided color if available, otherwise get from story settings
    const statusColor = propColumnColor || storySettings.getStatusColor(column.id);
    return {
      backgroundColor: `${statusColor}20`,
      borderColor: `${statusColor}40`,
      color: statusColor
    };
  };

  const columnColor = getColumnColor();

  // Check if we're dragging from Review to Done
  const isDraggingFromReviewToDone = () => {
    if (!activeStory || !isOver || column.name !== 'Done') return false;
    
    return activeStory.status === 'review';
  };

  const isDraggingFromReviewToDoneValue = isDraggingFromReviewToDone();

  return (
    <>
      <Card 
        ref={setDroppableRef}
        className={`${
          isOver ? 'ring-2 ring-blue-400 bg-blue-50' : ''
        } ${
          isDraggingFromReviewToDoneValue 
            ? 'ring-2 ring-red-500 ring-opacity-75 bg-red-50 border-red-300 shadow-lg' 
            : ''
        } h-fit sm:h-auto transition-all duration-200`}
        style={columnColor}
      >
        <CardHeader className="pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle 
              className={`text-xs sm:text-sm font-medium truncate ${
                isDraggingFromReviewToDoneValue ? 'text-red-600 font-bold' : ''
              }`}
              style={!isDraggingFromReviewToDoneValue ? { color: columnColor.color } : undefined}
            >
              {column.name} {stories.length}
              {isDraggingFromReviewToDoneValue && (
                <span className="ml-2 text-xs text-red-500">⚠️ Complete Retro</span>
              )}
            </CardTitle>
            <div className="flex items-center gap-1.5">
              {(() => {
                const totalWeight = stories.reduce((sum, story) => sum + (story.weight || 0), 0);
                return totalWeight > 0 ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Weight className="h-3 w-3" />
                    <span>{totalWeight}</span>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        </CardHeader>
        
        <CardContent 
          ref={setDroppableRef}
          className="space-y-2 min-h-[150px] sm:min-h-[200px]"
        >
          {stories.map((story, index) => (
            <StoryCard 
              key={story.id} 
              story={story}
              index={index}
              isSelected={selectedStories.includes(story.id)}
              onClick={(event) => onStoryClick(story.id, event, stories, index)}
              onEdit={onEditStory}
              draggable={true}
              kanbanMode={!!allColumnIds && allColumnIds.length > 0}
              currentColumnId={column.id}
              allColumnIds={allColumnIds || []}
              onMoveToColumn={onMoveToColumn}
            />
          ))}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground text-xs sm:text-sm"
            onClick={() => setShowAddStoryModal(true)}
          >
            <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Add Story</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </CardContent>
      </Card>
      
      <AddStoryModal
        open={showAddStoryModal}
        onOpenChange={setShowAddStoryModal}
        targetColumnId={column.id}
        initialData={{ 
          sprintId: currentSprint?.id,
          projectId: projectId,
          status: column.id as "icebox" | "backlog" | "todo" | "progress" | "review" | "done"
        }}
      />
    </>
  );
}
