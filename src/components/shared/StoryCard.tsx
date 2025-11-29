import React, { useRef, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from '@/components/ui/card';
import type { Story } from '@/types';
import { useAtom } from 'jotai';
import { rolesAtom, labelsAtom, visionsAtom, goalsAtom, projectsAtom, moveStoryAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { useStoryKeyboardShortcuts } from '@/hooks/useStoryKeyboardShortcuts';
import { useStorySwipe } from '@/hooks/useStorySwipe';
import { openStoryInGoogleCalendar } from '@/utils/googleCalendar';
import { StoryCardMobile } from './StoryCardMobile';
import { StoryCardDesktop } from './StoryCardDesktop';

interface StoryCardProps {
  story: Story;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  onSelect?: (storyId: string, index: number, event: React.MouseEvent) => void;
  onClick?: (event: React.MouseEvent) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  showActions?: boolean;
  draggable?: boolean;
  index?: number;
  className?: string;
  // Kanban board context for swipe-to-move
  kanbanMode?: boolean;
  currentColumnId?: string;
  allColumnIds?: string[];
  onMoveToColumn?: (storyId: string, targetColumnId: string) => void;
}

export function StoryCard({
  story,
  onEdit,
  onDelete,
  onSelect,
  onClick,
  isSelected = false,
  isDragging: externalIsDragging = false,
  showActions = true,
  draggable = false,
  index = 0,
  className = '',
  kanbanMode = false,
  currentColumnId,
  allColumnIds = [],
  onMoveToColumn
}: StoryCardProps) {
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [visions] = useAtom(visionsAtom);
  const [goals] = useAtom(goalsAtom);
  const [projects] = useAtom(projectsAtom);
  const [, moveStory] = useAtom(moveStoryAtom);
  const storySettings = useStorySettings();
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Check if story is scheduled (has scheduledDate or dueDate)
  const isScheduled = !!(story.scheduledDate || story.dueDate);

  // Use sortable hook only if draggable is true
  const sortable = useSortable({
    id: story.id,
    disabled: !draggable,
    data: {
      type: 'story',
      story,
    },
  });

  const isDragging = draggable ? sortable.isDragging : externalIsDragging;
  const sortableStyle = draggable ? {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  } : {};

  // Handle Google Calendar integration
  const handleAddToGoogleCalendar = useCallback(() => {
    // Update story status to "todo" (To Do)
    moveStory(story.id, 'todo');
    // Open Google Calendar
    openStoryInGoogleCalendar(story);
  }, [story, moveStory]);

  // Keyboard shortcuts hook
  const { handleKeyDown } = useStoryKeyboardShortcuts({
    story,
    isSelected,
    cardRef,
    onEdit,
    onDelete,
    onAddToCalendar: handleAddToGoogleCalendar
  });

  // Swipe handling hook
  const { 
    swipeDirection, 
    handleTouchStart, 
    handleTouchMove, 
    handleTouchEnd 
  } = useStorySwipe({
    kanbanMode,
    currentColumnId,
    allColumnIds,
    onMoveToColumn
  });

  // Event handlers
  const handleClick = (event: React.MouseEvent) => {
    if (isDragging) return;
    
    if (onSelect) {
      onSelect(story.id, index, event);
    } else if (onClick) {
      onClick(event);
    }
  };

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isDragging && onEdit) {
      onEdit(story);
    }
  };

  const handleTouchEndWithStory = (e: React.TouchEvent) => {
    handleTouchEnd(e, story.id);
  };

  // Store sortable.setNodeRef in a ref to keep it stable
  const sortableSetNodeRefRef = useRef(sortable.setNodeRef);
  sortableSetNodeRefRef.current = sortable.setNodeRef;

  // Combine refs for sortable and our card ref
  // Memoize to prevent infinite loops from ref callback recreation
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    // Use ref to access latest setNodeRef without causing re-renders
    if (draggable && sortableSetNodeRefRef.current) {
      sortableSetNodeRefRef.current(node);
    }
    // Always set cardRef
    if (cardRef) {
      (cardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [draggable]);

  // Don't memoize cardProps - spread sortable props directly to avoid dependency issues
  // sortable.attributes and sortable.listeners are stable from the hook
  const cardProps = draggable ? {
    ref: setRefs,
    style: sortableStyle,
    ...sortable.attributes,
    ...sortable.listeners,
  } : {
    ref: cardRef
  };

  const priorityColor = storySettings.getPriorityColor(story.priority);
  
  // Color helper functions
  const getStatusColor = (status: string) => storySettings.getStatusColor(status);
  const getTaskCategoryColor = (category: string) => storySettings.getTaskCategoryColor(category);
  
  return (
    <Card 
      {...cardProps}
      tabIndex={isSelected ? 0 : -1}
      className={`
        glass-card
        ${draggable ? 'cursor-grab' : 'cursor-pointer'} 
        transition-all duration-200 hover:shadow-xl
        ${isSelected ? 'ring-2 ring-[hsl(var(--glass-ring))] outline-none shadow-[0_0_0_1px_hsl(var(--glass-ring)/0.5)]' : ''}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${draggable && isDragging ? 'cursor-grabbing' : ''}
        ${swipeDirection === 'right' && kanbanMode ? 'translate-x-4 shadow-[0_0_0_1px_rgba(34,197,94,0.45)]' : ''}
        ${swipeDirection === 'left' && kanbanMode ? '-translate-x-4 shadow-[0_0_0_1px_rgba(34,197,94,0.45)]' : ''}
        relative overflow-hidden rounded-2xl
        ${className}
      `}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEndWithStory}
    >
      {/* Priority accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: priorityColor }}
      />
      
      {/* Mobile layout */}
      <StoryCardMobile
        story={story}
        isScheduled={isScheduled}
        storySettings={storySettings}
        getStatusColor={getStatusColor}
        showActions={showActions}
        onEdit={onEdit}
        onAddToGoogleCalendar={handleAddToGoogleCalendar}
      />

      {/* Desktop layout */}
      <StoryCardDesktop
        story={story}
        isScheduled={isScheduled}
        roles={roles}
        visions={visions}
        goals={goals}
        projects={projects}
        labels={labels}
        storySettings={storySettings}
        getStatusColor={getStatusColor}
        getTaskCategoryColor={getTaskCategoryColor}
        showActions={showActions}
        draggable={draggable}
        onEdit={onEdit}
        onDelete={onDelete}
        onAddToGoogleCalendar={handleAddToGoogleCalendar}
      />
    </Card>
  );
}
