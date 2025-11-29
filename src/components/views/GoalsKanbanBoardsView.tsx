import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { StoryCard } from '@/components/shared/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { FilterBar } from '@/components/forms/FilterBar';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  goalsAtom, 
  storiesAtom, 
  updateStoryAtom,
  deleteStoryAtom,
  addStoryAtom
} from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { Target, Undo, Plus, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Story } from '@/types';

export function GoalsKanbanBoardsView() {
  const [goals] = useAtom(goalsAtom);
  const [stories] = useAtom(storiesAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  const [, addStory] = useAtom(addStoryAtom);
  const goalSettings = useGoalSettings();

  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  
  // Get the current selected goal from the goals atom
  const selectedGoal = selectedGoalId 
    ? goals.find(g => g.id === selectedGoalId) || null
    : null;
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousColumnId?: string;
    story?: Story;
  }>>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Auto-select first goal when goals load or change
  useEffect(() => {
    if (goals.length > 0 && !selectedGoalId) {
      setSelectedGoalId(goals[0].id);
    }
  }, [goals, selectedGoalId]);

  // Get goal stories
  const goalStories = selectedGoal 
    ? stories.filter(story => 
        story.goalId === selectedGoal.id && !story.deleted
      )
    : [];

  // Define status columns for Kanban using settings colors
  const statusColumns = [
    { id: 'icebox', name: 'Icebox', color: goalSettings.getStatusColor('icebox') },
    { id: 'backlog', name: 'Backlog', color: goalSettings.getStatusColor('backlog') },
    { id: 'todo', name: 'To Do', color: goalSettings.getStatusColor('todo') },
    { id: 'in-progress', name: 'In Progress', color: goalSettings.getStatusColor('in-progress') },
    { id: 'review', name: 'Review', color: goalSettings.getStatusColor('review') },
    { id: 'done', name: 'Done', color: goalSettings.getStatusColor('done') }
  ];

  // Group stories by status
  const storiesByStatus = statusColumns.reduce((acc, status) => {
    acc[status.id] = goalStories.filter(story => story.status === status.id);
    return acc;
  }, {} as Record<string, Story[]>);

  // Helper function to get range of stories between two indices
  const getStoriesInRange = (storyList: Story[], startIndex: number, endIndex: number): string[] => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return storyList.slice(start, end + 1).map(story => story.id);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      
      if (lastAction.type === 'delete' && lastAction.story) {
        // Restore deleted story by adding it back
        const storyToRestore = { ...lastAction.story, deleted: false };
        addStory(storyToRestore);
      } else if (lastAction.type === 'move' && lastAction.previousColumnId) {
        // Restore previous status
        updateStory(lastAction.storyId, { status: lastAction.previousColumnId as any });
      }
      
      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === 'Delete' && selectedStories.length > 0) {
        // Delete selected stories and add to undo stack
        selectedStories.forEach(storyId => {
          // Find the story and its status to store in undo stack
          const story = stories.find(s => s.id === storyId);
          if (story) {
            setUndoStack(prev => [...prev, {
              type: 'delete',
              storyId,
              story: { ...story, status: story.status }
            }]);
          }
          deleteStory(storyId);
        });
        setSelectedStories([]);
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStories, deleteStory, undoStack, storiesByStatus, addStory, updateStory, stories]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleMoveToColumn = (storyId: string, targetColumnId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (story && story.status !== targetColumnId) {
      // Add to undo stack before updating
      setUndoStack(prev => [...prev, {
        type: 'move',
        storyId,
        previousColumnId: story.status
      }]);
      updateStory(storyId, { status: targetColumnId as any });
    }
  };

  const allColumnIds = statusColumns.map(col => col.id);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const storyId = active.id as string;
    const overId = over.id as string;

    // Find the target status
    const targetStatus = statusColumns.find(status => status.id === overId);
    if (targetStatus) {
      // Determine which stories to move
      const storiesToMove = selectedStories.includes(storyId) ? selectedStories : [storyId];
      
      // Update all selected stories to target status
      storiesToMove.forEach(id => {
        const story = stories.find(s => s.id === id);
        if (story && story.status !== targetStatus.id) {
          // Add to undo stack before updating
          setUndoStack(prev => [...prev, {
            type: 'move',
            storyId: id,
            previousColumnId: story.status
          }]);
          updateStory(id, { status: targetStatus.id as any });
        }
      });
    }
  };

  const handleStoryClick = (storyId: string, event: React.MouseEvent, storyList?: Story[], currentIndex?: number) => {
    if (event.ctrlKey && event.shiftKey && storyList && currentIndex !== undefined && lastSelectedIndex !== null) {
      // Range selection with Ctrl+Shift
      const rangeStoryIds = getStoriesInRange(storyList, lastSelectedIndex, currentIndex);
      setSelectedStories(prev => {
        const newSet = new Set(prev);
        rangeStoryIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedStories(prev => 
        prev.includes(storyId) 
          ? prev.filter(id => id !== storyId)
          : [...prev, storyId]
      );
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    } else {
      // Single select
      setSelectedStories([storyId]);
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  const activeStory = activeId ? stories.find(s => s.id === activeId) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Goal Selector - Left aligned */}
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <Select
            value={selectedGoalId || ''}
            onValueChange={(goalId) => {
              setSelectedGoalId(goalId);
              setSelectedStories([]); // Clear selection when switching goals
            }}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a goal..." />
            </SelectTrigger>
            <SelectContent>
              {goals.length === 0 ? (
                <SelectItem value="none" disabled>
                  No goals available
                </SelectItem>
              ) : (
                goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>{goal.title}</span>
                      <span className="text-xs text-muted-foreground">
                        ({goalStories.length} stories)
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Search, Filter, and Add Story Buttons - Right aligned */}
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
            onClick={() => setShowAddStoryModal(true)}
            disabled={!selectedGoal}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Story</span>
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div>
          <FilterBar showSearchOnly={true} />
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div>
          <FilterBar showFilterOnly={true} />
        </div>
      )}

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

      {/* Content */}
      {!selectedGoal ? (
        <Card className="h-96 flex items-center justify-center">
          <CardContent className="text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goal Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select a goal from the dropdown above to view its Kanban board
            </p>
            {goals.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Create your first goal to get started
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Column Header Row - Desktop */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-2">
            {statusColumns.map((status) => {
              const columnStories = storiesByStatus[status.id] || [];
              return (
                <div
                  key={status.id}
                  onClick={() => {
                    const columnElement = document.querySelector(`[data-column-id="${status.id}"]`);
                    if (columnElement) {
                      columnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }
                  }}
                  className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: `${status.color}20` }}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: status.color }}
                  />
                  <span className="text-sm font-medium" style={{ color: status.color }}>
                    {status.name} {columnStories.length}
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
                {statusColumns.map((status, index) => {
                  const columnStories = storiesByStatus[status.id] || [];
                  const isActive = statusColumns[currentMobileColumnIndex]?.id === status.id;
                  return (
                    <div
                      key={status.id}
                      onClick={() => setCurrentMobileColumnIndex(index)}
                      className={`flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                        isActive ? 'ring-2 ring-offset-1' : ''
                      }`}
                      style={{ 
                        backgroundColor: `${status.color}20`,
                        ...(isActive && { '--tw-ring-color': status.color } as React.CSSProperties)
                      }}
                    >
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-xs font-medium truncate flex-1 min-w-0" style={{ color: status.color }}>
                        {status.name} {columnStories.length}
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
          <div className="min-h-[400px] sm:min-h-[600px]">
            <DndContext 
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              {/* Desktop Grid Layout */}
              <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
                {statusColumns.map((status) => (
                  <div key={status.id} className="min-w-0" data-column-id={status.id}>
                    <KanbanColumn
                      column={{ id: status.id, name: status.name as "Icebox" | "Backlog" | "To Do" | "In Progress" | "Review" | "Done", storyIds: [] }}
                      stories={storiesByStatus[status.id] || []}
                      selectedStories={selectedStories}
                      onStoryClick={handleStoryClick}
                      onEditStory={handleEditStory}
                      allColumnIds={allColumnIds}
                      onMoveToColumn={handleMoveToColumn}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile Single Column Layout */}
              <div className="sm:hidden">
                {statusColumns.map((status, index) => (
                  <div
                    key={status.id}
                    className={index === currentMobileColumnIndex ? 'block' : 'hidden'}
                  >
                    <KanbanColumn
                      column={{ id: status.id, name: status.name as "Icebox" | "Backlog" | "To Do" | "In Progress" | "Review" | "Done", storyIds: [] }}
                      stories={storiesByStatus[status.id] || []}
                      selectedStories={selectedStories}
                      onStoryClick={handleStoryClick}
                      onEditStory={handleEditStory}
                      allColumnIds={allColumnIds}
                      onMoveToColumn={handleMoveToColumn}
                    />
                  </div>
                ))}
              </div>

              <DragOverlay>
                {activeStory ? (
                  <div className="opacity-50">
                    {selectedStories.includes(activeStory.id) && selectedStories.length > 1 ? (
                      <div className="space-y-2">
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Moving {selectedStories.length} stories
                        </div>
                        <StoryCard story={activeStory} />
                      </div>
                    ) : (
                      <StoryCard story={activeStory} />
                    )}
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      )}

      {/* Edit Story Modal */}
      {editingStory && (
        <EditStoryModal
          open={!!editingStory}
          onOpenChange={(open) => !open && setEditingStory(null)}
          story={editingStory}
        />
      )}

      {/* Add Story Modal */}
      <AddStoryModal 
        open={showAddStoryModal} 
        onOpenChange={setShowAddStoryModal}
        initialData={{ goalId: selectedGoalId || undefined }}
      />
    </div>
  );
}