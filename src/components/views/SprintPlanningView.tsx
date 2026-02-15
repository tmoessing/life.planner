import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { storiesAtom, safeSprintsAtom, updateStoryAtom, deleteStoryAtom, addStoryAtom, currentSprintAtom } from '@/stores/appStore';
import { generateRecurrenceInstances } from '@/utils/recurrenceUtils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StoryCard } from '@/components/shared/StoryCard';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { Calendar, Target, Clock, Undo } from 'lucide-react';
import type { Story } from '@/types';

export function SprintPlanningView() {
  const [stories] = useAtom(storiesAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  const [, addStory] = useAtom(addStoryAtom);
  const [currentSprint] = useAtom(currentSprintAtom);

  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);
  const [dragOverSprintId, setDragOverSprintId] = useState<string | null>(null);
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousSprintId?: string;
    story?: Story;
  }>>([]);

  // Helper function to get expanded stories for a sprint (including recurring instances)
  const getExpandedStoriesForSprint = (sprint: any) => {
    // Get all recurring stories (regardless of which sprint they're assigned to)
    const recurringStories = stories.filter(story =>
      !story.deleted &&
      story.repeat &&
      story.repeat.cadence !== 'none'
    );

    // Get non-recurring stories for the sprint
    const nonRecurringStories = stories.filter(story =>
      !story.deleted &&
      story.sprintId === sprint.id &&
      (!story.repeat || story.repeat.cadence === 'none')
    );

    // Expand recurring stories into virtual instances for the sprint
    const expandedStories: (Story & { _isRecurringInstance?: boolean; _instanceDate?: string; _originalId?: string })[] = [];

    // Add non-recurring stories
    expandedStories.push(...nonRecurringStories);

    // Generate instances for recurring stories within the sprint date range
    recurringStories.forEach(story => {
      const instances = generateRecurrenceInstances(
        story,
        new Date(sprint.startDate),
        new Date(sprint.endDate)
      );

      instances.forEach(instance => {
        expandedStories.push({
          ...story,
          id: `${story.id}-${instance.date}`,
          status: instance.status,
          _isRecurringInstance: true,
          _instanceDate: instance.date,
          _originalId: story.id
        });
      });
    });

    return expandedStories;
  };

  // Get stories that are not assigned to any sprint
  const unassignedStories = stories.filter(story => !story.sprintId && !story.deleted);

  // Helper function to get range of stories between two indices
  const getStoriesInRange = (storyList: Story[], startIndex: number, endIndex: number): string[] => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return storyList.slice(start, end + 1).map(story => story.id);
  };

  const handleAssignToSprint = (storyId: string, sprintId: string) => {
    updateStory(storyId, { sprintId });
  };

  const handleStoryClick = (e: React.MouseEvent, storyId: string, storyList?: Story[], currentIndex?: number) => {
    // Don't handle click if it's a drag operation
    if (e.defaultPrevented) return;

    if (e.ctrlKey && e.shiftKey && storyList && currentIndex !== undefined && lastSelectedIndex !== null) {
      // Range selection with Ctrl+Shift
      const rangeStoryIds = getStoriesInRange(storyList, lastSelectedIndex, currentIndex);
      setSelectedStoryIds(prev => {
        const newSet = new Set(prev);
        rangeStoryIds.forEach(id => newSet.add(id));
        return newSet;
      });
    } else if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedStoryIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(storyId)) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    } else {
      // Single select
      setSelectedStoryIds(new Set([storyId]));
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    }
  };

  const clearSelection = () => {
    setSelectedStoryIds(new Set());
    setLastSelectedIndex(null);
  };

  const handleDeleteSelected = () => {
    if (selectedStoryIds.size > 0) {
      selectedStoryIds.forEach(storyId => {
        const story = stories.find(s => s.id === storyId);
        if (story) {
          // Add to undo stack before deleting
          setUndoStack(prev => [...prev, {
            type: 'delete',
            storyId,
            story: { ...story }
          }]);
          deleteStory(storyId);
        }
      });
      clearSelection();
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];

      if (lastAction.type === 'delete' && lastAction.story) {
        // Restore deleted story by adding it back
        const storyToRestore = { ...lastAction.story, deleted: false };
        addStory(storyToRestore);
      } else if (lastAction.type === 'move' && lastAction.previousSprintId !== undefined) {
        // Restore previous sprint assignment
        updateStory(lastAction.storyId, { sprintId: lastAction.previousSprintId });
      }

      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStoryIds.size > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStoryIds, deleteStory, undoStack]);

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditStoryModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditStoryModal(false);
    setEditingStory(null);
  };

  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    setDraggedStoryId(storyId);
    e.dataTransfer.effectAllowed = 'move';

    // If this story is part of a multi-select, drag all selected stories
    const storiesToDrag = selectedStoryIds.has(storyId) && selectedStoryIds.size > 1
      ? Array.from(selectedStoryIds)
      : [storyId];

    const dragData = JSON.stringify(storiesToDrag);
    e.dataTransfer.setData('text/plain', dragData);

    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedStoryId(null);
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragOverSprint = (e: React.DragEvent, sprintId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSprintId(sprintId);
  };

  const handleDragLeaveSprint = () => {
    setDragOverSprintId(null);
  };

  const handleDrop = (e: React.DragEvent, targetSprintId: string) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');

    if (data) {
      try {
        const storyIds = JSON.parse(data);
        if (Array.isArray(storyIds)) {
          // Move multiple stories
          storyIds.forEach(storyId => {
            const story = stories.find(s => s.id === storyId);
            if (story) {
              // Add to undo stack before moving
              setUndoStack(prev => [...prev, {
                type: 'move',
                storyId,
                previousSprintId: story.sprintId
              }]);
            }
            updateStory(storyId, { sprintId: targetSprintId });
          });
        } else {
          // Single story (backward compatibility)
          const story = stories.find(s => s.id === data);
          if (story) {
            // Add to undo stack before moving
            setUndoStack(prev => [...prev, {
              type: 'move',
              storyId: data,
              previousSprintId: story.sprintId
            }]);
          }
          updateStory(data, { sprintId: targetSprintId });
        }
      } catch (error) {
        // Fallback for single story
        const story = stories.find(s => s.id === data);
        if (story) {
          setUndoStack(prev => [...prev, {
            type: 'move',
            storyId: data,
            previousSprintId: story.sprintId
          }]);
        }
        updateStory(data, { sprintId: targetSprintId });
      }
    }
    setDraggedStoryId(null);
    setDragOverSprintId(null);
    clearSelection();
  };

  const handleDropToUnassigned = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      try {
        const storyIds = JSON.parse(data);
        if (Array.isArray(storyIds)) {
          // Move multiple stories to unassigned
          storyIds.forEach(storyId => {
            const story = stories.find(s => s.id === storyId);
            if (story) {
              // Add to undo stack before moving
              setUndoStack(prev => [...prev, {
                type: 'move',
                storyId,
                previousSprintId: story.sprintId
              }]);
            }
            updateStory(storyId, { sprintId: undefined });
          });
        } else {
          // Single story (backward compatibility)
          const story = stories.find(s => s.id === data);
          if (story) {
            setUndoStack(prev => [...prev, {
              type: 'move',
              storyId: data,
              previousSprintId: story.sprintId
            }]);
          }
          updateStory(data, { sprintId: undefined });
        }
      } catch {
        // Fallback for single story
        const story = stories.find(s => s.id === data);
        if (story) {
          setUndoStack(prev => [...prev, {
            type: 'move',
            storyId: data,
            previousSprintId: story.sprintId
          }]);
        }
        updateStory(data, { sprintId: undefined });
      }
    }
    setDraggedStoryId(null);
    setDragOverSprintId(null);
    clearSelection();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">

          {selectedStoryIds.size > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {selectedStoryIds.size} selected
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={clearSelection}
                className="text-xs h-11 sm:h-6 touch-target sm:min-h-0"
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDeleteSelected}
                className="text-xs h-11 sm:h-6 touch-target sm:min-h-0"
              >
                Delete
              </Button>
            </div>
          )}
          {undoStack.length > 0 && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleUndo}
                className="text-xs h-11 sm:h-6 touch-target sm:min-h-0"
              >
                <Undo className="h-3 w-3 mr-1" />
                Undo
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Unassigned Stories */}
      <Card
        onDragOver={handleDragOver}
        onDrop={handleDropToUnassigned}
        className={`transition-colors ${draggedStoryId && !dragOverSprintId ? 'ring-2 ring-green-500 bg-green-50' : ''
          }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-orange-500" />
              Unassigned Backlog
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {unassignedStories.length} Stories
              </Badge>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                {unassignedStories.reduce((acc, story) => acc + (story.weight || 0), 0)} Weight
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {unassignedStories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No unassigned stories</p>
              <p className="text-sm">Create a new story or assign existing stories to sprints</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {unassignedStories.map((story, index) => (
                <div
                  key={story.id}
                  className={`cursor-move transition-all ${draggedStoryId === story.id ? 'opacity-50 scale-95' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, story.id)}
                  onDragEnd={handleDragEnd}
                  onClick={(e) => handleStoryClick(e, story.id, unassignedStories, index)}
                >
                  <StoryCard
                    story={story}
                    showActions={false}
                    isSelected={selectedStoryIds.has(story.id)}
                    className="mb-2"
                    onEdit={handleEditStory}
                  />

                  {/* Assign to Sprint Controls */}
                  <div className="pl-1 pr-1 pb-1">
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-muted-foreground self-center mr-1">Assign:</span>
                      {sprints.slice(0, 3).map((sprint) => (
                        <Button
                          key={sprint.id}
                          size="sm"
                          variant="outline"
                          className="text-[10px] h-6 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignToSprint(story.id, sprint.id);
                          }}
                        >
                          W{sprint.isoWeek}
                        </Button>
                      ))}
                      {sprints.length > 3 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-[10px] h-6 px-1"
                        >
                          +{sprints.length - 3}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sprint Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sprints.slice(0, 6).map((sprint) => {
          const sprintStories = getExpandedStoriesForSprint(sprint);
          return (
            <Card
              key={sprint.id}
              className={`hover:shadow-md transition-all ${dragOverSprintId === sprint.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
              onDragOver={(e) => handleDragOverSprint(e, sprint.id)}
              onDragLeave={handleDragLeaveSprint}
              onDrop={(e) => handleDrop(e, sprint.id)}
            >
              <CardHeader className="pb-2 sm:pb-3">
                {/* Mobile: Stacked layout, Desktop: Side by side */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <CardTitle className="text-base font-semibold">
                        Week {sprint.isoWeek}, {sprint.year}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200">
                        {sprintStories.length} Stories
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                        {sprintStories.reduce((acc, s) => acc + (s.weight || 0), 0)} Weight
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground border-t pt-2 mt-1">
                    <span className="font-medium text-foreground">
                      {new Date(sprint.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(sprint.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2 sm:pt-4">
                <div className="space-y-1.5 sm:space-y-2">
                  {sprintStories.slice(0, 3).map((story, index) => (
                    <div
                      key={story.id}
                      className={`cursor-move transition-all ${draggedStoryId === story.id ? 'opacity-50 scale-95' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, story.id)}
                      onDragEnd={handleDragEnd}
                      onClick={(e) => handleStoryClick(e, story.id, sprintStories, index)}
                    >
                      <StoryCard
                        story={story}
                        showActions={false}
                        isSelected={selectedStoryIds.has(story.id)}
                        className={`hover:shadow-md transition-all ${draggedStoryId === story.id ? 'opacity-50' : ''}`}
                        onClick={(e) => handleStoryClick(e, story.id, sprintStories, index)}
                      />
                    </div>
                  ))}
                  {sprintStories.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center py-1.5 sm:py-2 font-medium">
                      +{sprintStories.length - 3} more {sprintStories.length - 3 === 1 ? 'story' : 'stories'}
                    </div>
                  )}
                  {sprintStories.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No stories assigned
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddStoryModal
        open={showAddStoryModal}
        onOpenChange={setShowAddStoryModal}
        initialData={{ sprintId: currentSprint?.id }}
      />

      {
        editingStory && (
          <EditStoryModal
            open={showEditStoryModal}
            onOpenChange={handleCloseEditModal}
            story={editingStory}
          />
        )
      }
    </div >
  );
}
