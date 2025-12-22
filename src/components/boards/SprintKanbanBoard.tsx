import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAtom } from 'jotai';
import { sprintStoriesByStatusAtom, storiesAtom, moveStoryAtom, updateStoryAtom, deleteStoryAtom } from '@/stores/appStore';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverlay, useDroppable } from '@dnd-kit/core';
import { StoryCard } from '@/components/shared/StoryCard';
import { Button } from '@/components/ui/button';
import { Undo, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
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
  const scrollTargetRef = useRef<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update mobile column index when showAllSprints changes (but don't reset if user has manually selected a column)
  const hasUserSelectedColumn = useRef(false);
  
  useEffect(() => {
    // Only auto-reset if user hasn't manually selected a column
    if (!hasUserSelectedColumn.current) {
      if (showAllSprints) {
        const backlogIdx = statusColumns.findIndex(col => col.id === 'backlog');
        if (backlogIdx >= 0) {
          setCurrentMobileColumnIndex(backlogIdx);
        }
      } else {
        const todoIdx = statusColumns.findIndex(col => col.id === 'todo');
        if (todoIdx >= 0) {
          setCurrentMobileColumnIndex(todoIdx);
        }
      }
    }
  }, [showAllSprints, statusColumns]);

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

        {/* Column Header Row - Desktop */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-2">
          {statusColumns.map((column) => {
            const columnStories = storiesByStatus[column.id] || [];
            const statusColor = storySettings.getStatusColor(column.id);
            return (
              <button
                key={column.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Mark that user has manually selected a column
                  hasUserSelectedColumn.current = true;
                  
                  // Find the scrollable container (main element or window)
                  const mainElement = document.querySelector('main');
                  
                  // Use double requestAnimationFrame to ensure DOM is ready
                  requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                      const columnElement = document.querySelector(`[data-column-id="${column.id}"]`);
                      if (columnElement) {
                        // Store scroll target to prevent interference
                        scrollTargetRef.current = column.id;
                        
                        // Get current scroll position to prevent reset
                        const currentScrollY = window.scrollY;
                        const currentScrollX = window.scrollX;
                        
                        // Scroll the element into view
                        columnElement.scrollIntoView({ 
                          behavior: 'smooth', 
                          block: 'start',
                          inline: 'nearest'
                        });
                        
                        // Prevent any scroll reset by maintaining position if needed
                        const preventScrollReset = () => {
                          // Check if scroll was reset
                          if (Math.abs(window.scrollY - currentScrollY) > 50 && scrollTargetRef.current === column.id) {
                            // Scroll was reset, restore it
                            const elementTop = columnElement.getBoundingClientRect().top + window.pageYOffset;
                            window.scrollTo({
                              top: elementTop - 120,
                              behavior: 'smooth'
                            });
                          }
                        };
                        
                        // Check for scroll reset after a short delay
                        setTimeout(() => {
                          preventScrollReset();
                        }, 100);
                        
                        // Clear the target after scroll completes
                        setTimeout(() => {
                          scrollTargetRef.current = null;
                        }, 1000);
                      }
                    });
                  });
                }}
                className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity text-left w-full"
                style={{ backgroundColor: `${statusColor}20` }}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: statusColor }}
                />
                <span className="text-sm font-medium" style={{ color: statusColor }}>
                  {column.name} {columnStories.length}
                </span>
              </button>
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
                  <button
                    key={column.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      hasUserSelectedColumn.current = true;
                      setCurrentMobileColumnIndex(index);
                    }}
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
                  </button>
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
                onDeleteStory={handleDeleteStory}
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
                onDeleteStory={handleDeleteStory}
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
