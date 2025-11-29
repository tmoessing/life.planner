import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Sprint, Story } from '@/types';
import { generateSprints, getCurrentWeek, createSprintId } from '@/utils';
import { STORAGE_KEYS } from '@/constants/storage';
import { storiesAtom } from './storyStore';
import { selectedSprintIdAtom } from './uiStore';
import { generateRecurrenceInstances } from '@/utils/recurrenceUtils';

// Initialize default data
const defaultSprints = generateSprints(12);

// Get current week sprint ID for default selection
const getCurrentWeekSprintId = () => {
  const { isoWeek, year } = getCurrentWeek();
  return createSprintId(isoWeek, year);
};

// Core sprint atoms with localStorage persistence
export const sprintsAtom = atomWithStorage<Sprint[]>(STORAGE_KEYS.SPRINTS, defaultSprints);

// Ensure sprints are never empty - add a fallback
export const safeSprintsAtom = atom(
  (get) => {
    const sprints = get(sprintsAtom);
    return sprints.length > 0 ? sprints : defaultSprints;
  },
  (_, set, newSprints: Sprint[]) => {
    set(sprintsAtom, newSprints.length > 0 ? newSprints : defaultSprints);
  }
);

// Derived atoms for computed values
export const currentSprintAtom = atom(
  (get) => {
    const sprints = get(sprintsAtom);
    const selectedId = get(selectedSprintIdAtom);
    
    // First try to find the selected sprint
    let currentSprint = sprints.find(sprint => sprint.id === selectedId);
    
    // If not found, try to find the current week sprint
    if (!currentSprint) {
      const currentWeekId = getCurrentWeekSprintId();
      currentSprint = sprints.find(sprint => sprint.id === currentWeekId);
    }
    
    // Fallback to first sprint if still not found
    return currentSprint || sprints[0];
  }
);

// Sprint-specific stories by status atom (with recurring story expansion)
export const sprintStoriesByStatusAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const selectedSprintId = get(selectedSprintIdAtom);
    const currentSprint = get(currentSprintAtom);
    const sprints = get(safeSprintsAtom);
    
    const statuses = ['icebox', 'backlog', 'todo', 'progress', 'review', 'done'];
    const result: Record<string, Story[]> = {};
    
    // Get the target sprint for date range
    const targetSprint = sprints.find(s => s.id === selectedSprintId) || currentSprint;
    if (!targetSprint) return result;
    
    // Get all recurring stories (regardless of which sprint they're assigned to)
    const recurringStories = stories.filter(story => 
      !story.deleted && 
      story.repeat && 
      story.repeat.cadence !== 'none'
    );
    
    // Get non-recurring stories for the selected sprint
    const nonRecurringStories = stories.filter(story => 
      !story.deleted && 
      story.sprintId === selectedSprintId &&
      (!story.repeat || story.repeat.cadence === 'none')
    );
    
    // Expand recurring stories into virtual instances for the target sprint
    const expandedStories: (Story & { _isRecurringInstance?: boolean; _instanceDate?: string; _originalId?: string })[] = [];
    
    // Add non-recurring stories
    expandedStories.push(...nonRecurringStories);
    
    // Generate instances for recurring stories within the target sprint date range
    recurringStories.forEach(story => {
      const instances = generateRecurrenceInstances(
        story,
        new Date(targetSprint.startDate),
        new Date(targetSprint.endDate)
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
    
    statuses.forEach(status => {
      const statusStories = expandedStories.filter(story => story.status === status);
      result[status] = statusStories;
    });
    
    return result;
  }
);

