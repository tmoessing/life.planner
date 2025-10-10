import { useState, useCallback, useMemo } from 'react';
import type { Story, Sprint } from '@/types';

export interface SprintPlanningState {
  draggedStoryId: string | null;
  dragOverSprintId: string | null;
  selectedStoryIds: Set<string>;
  lastSelectedIndex: number | null;
  undoStack: Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousSprintId?: string;
    story?: Story;
  }>;
}

export interface SprintStats {
  totalStories: number;
  storiesBySprint: Record<string, Story[]>;
  unassignedStories: Story[];
  sprintCapacity: Record<string, number>;
  sprintUtilization: Record<string, number>;
}

export function useSprintPlanningLogic(
  stories: Story[], 
  sprints: Sprint[],
  onUpdateStory: (story: Story) => void,
  onDeleteStory: (storyId: string) => void,
  onAddStory: (story: Partial<Story>) => void
) {
  const [state, setState] = useState<SprintPlanningState>({
    draggedStoryId: null,
    dragOverSprintId: null,
    selectedStoryIds: new Set(),
    lastSelectedIndex: null,
    undoStack: []
  });

  const updateState = useCallback((updates: Partial<SprintPlanningState> | ((prev: SprintPlanningState) => SprintPlanningState)) => {
    setState(prev => {
      if (typeof updates === 'function') {
        return updates(prev);
      }
      return { ...prev, ...updates };
    });
  }, []);

  const startDrag = useCallback((storyId: string) => {
    updateState({ draggedStoryId: storyId });
  }, [updateState]);

  const handleDragOver = useCallback((sprintId: string) => {
    updateState({ dragOverSprintId: sprintId });
  }, [updateState]);

  const handleDragLeave = useCallback(() => {
    updateState({ dragOverSprintId: null });
  }, [updateState]);

  const endDrag = useCallback(() => {
    updateState({ 
      draggedStoryId: null, 
      dragOverSprintId: null 
    });
  }, [updateState]);

  const moveStoryToSprint = useCallback((storyId: string, sprintId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    const previousSprintId = story.sprintId;
    
    // Add to undo stack
    updateState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack, {
        type: 'move',
        storyId,
        previousSprintId,
        story: { ...story }
      }]
    }));

    // Update story
    onUpdateStory({ ...story, sprintId });
  }, [stories, onUpdateStory, updateState]);

  const deleteStory = useCallback((storyId: string) => {
    const story = stories.find(s => s.id === storyId);
    if (!story) return;

    // Add to undo stack
    updateState(prev => ({
      ...prev,
      undoStack: [...prev.undoStack, {
        type: 'delete',
        storyId,
        previousSprintId: story.sprintId,
        story: { ...story }
      }]
    }));

    // Delete story
    onDeleteStory(storyId);
  }, [stories, onDeleteStory, updateState]);

  const undoLastAction = useCallback(() => {
    const lastAction = state.undoStack[state.undoStack.length - 1];
    if (!lastAction) return;

    if (lastAction.type === 'delete' && lastAction.story) {
      onAddStory(lastAction.story);
    } else if (lastAction.type === 'move' && lastAction.story) {
      onUpdateStory({ 
        ...lastAction.story, 
        sprintId: lastAction.previousSprintId 
      });
    }

    // Remove from undo stack
    updateState(prev => ({
      ...prev,
      undoStack: prev.undoStack.slice(0, -1)
    }));
  }, [state.undoStack, onAddStory, onUpdateStory, updateState]);

  const toggleStorySelection = useCallback((storyId: string, index: number) => {
    updateState(prev => {
      const newSelectedIds = new Set(prev.selectedStoryIds);
      if (newSelectedIds.has(storyId)) {
        newSelectedIds.delete(storyId);
      } else {
        newSelectedIds.add(storyId);
      }
      return {
        ...prev,
        selectedStoryIds: newSelectedIds,
        lastSelectedIndex: index
      };
    });
  }, [updateState]);

  const selectStoriesInRange = useCallback((stories: Story[], startIndex: number, endIndex: number) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    const rangeIds = stories
      .slice(start, end + 1)
      .map(story => story.id);
    
    updateState(prev => ({
      ...prev,
      selectedStoryIds: new Set([...prev.selectedStoryIds, ...rangeIds])
    }));
  }, [updateState]);

  const selectAllStories = useCallback((stories: Story[]) => {
    const allIds = stories.map(story => story.id);
    updateState(prev => ({
      ...prev,
      selectedStoryIds: new Set(allIds)
    }));
  }, [updateState]);

  const clearSelection = useCallback(() => {
    updateState(prev => ({
      ...prev,
      selectedStoryIds: new Set(),
      lastSelectedIndex: null
    }));
  }, [updateState]);

  const handleMultiSelect = useCallback((
    storyId: string,
    index: number,
    stories: Story[],
    event: React.MouseEvent
  ) => {
    if (event.ctrlKey || event.metaKey) {
      toggleStorySelection(storyId, index);
    } else if (event.shiftKey && state.lastSelectedIndex !== null) {
      selectStoriesInRange(stories, state.lastSelectedIndex, index);
    } else {
      clearSelection();
      toggleStorySelection(storyId, index);
    }
  }, [toggleStorySelection, selectStoriesInRange, clearSelection, state.lastSelectedIndex]);

  const getUnassignedStories = useCallback(() => {
    return stories.filter(story => !story.sprintId && !story.deleted);
  }, [stories]);

  const getStoriesBySprint = useCallback(() => {
    const result: Record<string, Story[]> = {};
    
    sprints.forEach(sprint => {
      result[sprint.id] = stories.filter(story => 
        story.sprintId === sprint.id && !story.deleted
      );
    });
    
    return result;
  }, [stories, sprints]);

  const stats = useMemo((): SprintStats => {
    const totalStories = stories.filter(s => !s.deleted).length;
    const unassignedStories = getUnassignedStories();
    const storiesBySprint = getStoriesBySprint();
    
    const sprintCapacity: Record<string, number> = {};
    const sprintUtilization: Record<string, number> = {};
    
    sprints.forEach(sprint => {
      const sprintStories = storiesBySprint[sprint.id] || [];
      const totalWeight = sprintStories.reduce((sum, story) => sum + story.weight, 0);
      
      // Assume capacity based on sprint duration (simplified)
      const capacity = 40; // 40 story points per sprint
      sprintCapacity[sprint.id] = capacity;
      sprintUtilization[sprint.id] = (totalWeight / capacity) * 100;
    });

    return {
      totalStories,
      storiesBySprint,
      unassignedStories,
      sprintCapacity,
      sprintUtilization
    };
  }, [stories, getUnassignedStories, getStoriesBySprint, sprints]);

  const canUndo = state.undoStack.length > 0;
  const hasSelection = state.selectedStoryIds.size > 0;

  return {
    state,
    startDrag,
    handleDragOver,
    handleDragLeave,
    endDrag,
    moveStoryToSprint,
    deleteStory,
    undoLastAction,
    toggleStorySelection,
    selectStoriesInRange,
    selectAllStories,
    clearSelection,
    handleMultiSelect,
    getUnassignedStories,
    getStoriesBySprint,
    stats,
    canUndo,
    hasSelection
  };
}
