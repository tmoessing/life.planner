import { useState, useCallback } from 'react';
import type { Story } from '@/types';

export function useStorySelection() {
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const toggleSelection = useCallback((storyId: string, index: number) => {
    setSelectedStoryIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(storyId)) {
        newSet.delete(storyId);
      } else {
        newSet.add(storyId);
      }
      return newSet;
    });
    setLastSelectedIndex(index);
  }, []);

  const selectRange = useCallback((stories: Story[], startIndex: number, endIndex: number) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    const rangeIds = stories
      .slice(start, end + 1)
      .map(story => story.id);
    
    setSelectedStoryIds(prev => {
      const newSet = new Set(prev);
      rangeIds.forEach(id => newSet.add(id));
      return newSet;
    });
  }, []);

  const selectAll = useCallback((stories: Story[]) => {
    const allIds = stories.map(story => story.id);
    setSelectedStoryIds(new Set(allIds));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedStoryIds(new Set());
    setLastSelectedIndex(null);
  }, []);

  const isSelected = useCallback((storyId: string) => {
    return selectedStoryIds.has(storyId);
  }, [selectedStoryIds]);

  const getSelectedStories = useCallback((stories: Story[]) => {
    return stories.filter(story => selectedStoryIds.has(story.id));
  }, [selectedStoryIds]);

  const handleMultiSelect = useCallback((
    storyId: string, 
    index: number, 
    stories: Story[],
    event: React.MouseEvent
  ) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd + click: toggle individual selection
      toggleSelection(storyId, index);
    } else if (event.shiftKey && lastSelectedIndex !== null) {
      // Shift + click: select range
      selectRange(stories, lastSelectedIndex, index);
    } else {
      // Regular click: clear and select single
      clearSelection();
      toggleSelection(storyId, index);
    }
  }, [toggleSelection, selectRange, clearSelection, lastSelectedIndex]);

  return {
    selectedStoryIds,
    lastSelectedIndex,
    toggleSelection,
    selectRange,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedStories,
    handleMultiSelect
  };
}
