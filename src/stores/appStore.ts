// Re-export all atoms from domain-specific stores for backward compatibility
export * from './storyStore';
export * from './goalStore';
export * from './projectStore';
export * from './classStore';
export * from './uiStore';
export * from './priorityStore';
export * from './typeStore';
export * from './statusStore';

// Import utilities for recurring stories
import { generateRecurrenceInstances } from '@/utils/recurrenceUtils';

// Export specific atoms from settingsStore to avoid circular dependencies
export {
  rolesAtom,
  labelsAtom,
  visionsAtom,
  bucketlistAtom,
  importantDatesAtom,
  traditionsAtom,
  settingsAtom,
  addRoleAtom,
  updateRoleAtom,
  deleteRoleAtom,
  addLabelAtom,
  updateLabelAtom,
  deleteLabelAtom,
  addVisionAtom,
  updateVisionAtom,
  deleteVisionAtom,
  reorderVisionsAtom,
  addBucketlistItemAtom,
  updateBucketlistItemAtom,
  deleteBucketlistItemAtom,
  deleteAllVisionsAtom,
  deleteAllBucketlistAtom,
  traditionTypesAtom,
  traditionalCategoriesAtom,
  addTraditionTypeAtom,
  updateTraditionTypeAtom,
  deleteTraditionTypeAtom,
  addTraditionalCategoryAtom,
  updateTraditionalCategoryAtom,
  deleteTraditionalCategoryAtom
} from './settingsStore';

// Sprint and board specific atoms that weren't moved
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Sprint, Board, Column, Story } from '@/types';
import { generateSprints, getCurrentWeek, createSprintId, filterStories } from '@/utils';
import { DEFAULT_COLUMNS, DEFAULT_BOARD } from '@/constants/story';
import { STORAGE_KEYS } from '@/constants/storage';
import { storiesAtom } from './storyStore';
import { rolesAtom, visionsAtom, bucketlistAtom, importantDatesAtom, traditionsAtom, settingsAtom } from './settingsStore';
import { goalsAtom } from './goalStore';
import { projectsAtom } from './projectStore';
import { classesAtom } from './classStore';
import { assignmentsAtom } from './assignmentStore';
import { selectedSprintIdAtom, filterTextAtom, filterKeywordsAtom, filterDueSoonAtom } from './uiStore';

// Initialize default data
const defaultSprints = generateSprints(12);
const defaultColumns = DEFAULT_COLUMNS;
const defaultBoard: Board = DEFAULT_BOARD;

// Get current week sprint ID for default selection
const getCurrentWeekSprintId = () => {
  const { isoWeek, year } = getCurrentWeek();
  return createSprintId(isoWeek, year);
};

// Core data atoms with localStorage persistence
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

export const columnsAtom = atomWithStorage<Column[]>(STORAGE_KEYS.COLUMNS, defaultColumns);

// Ensure columns are never empty - add a fallback
export const safeColumnsAtom = atom(
  (get) => {
    const columns = get(columnsAtom);
    return columns.length > 0 ? columns : defaultColumns;
  },
  (_, set, newColumns: Column[]) => {
    set(columnsAtom, newColumns.length > 0 ? newColumns : defaultColumns);
  }
);

export const boardsAtom = atomWithStorage<Board[]>(STORAGE_KEYS.BOARDS, [defaultBoard]);

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

export const filteredStoriesAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const text = get(filterTextAtom);
    const keywords = get(filterKeywordsAtom);
    const dueSoon = get(filterDueSoonAtom);
    const roles = get(rolesAtom);
    
    return filterStories(stories, text, keywords, dueSoon, roles, []);
  }
);

export const storiesByColumnAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const columns = get(columnsAtom);
    const currentSprint = get(currentSprintAtom);
    
    const result: Record<string, Story[]> = {};
    
    columns.forEach(column => {
      result[column.id] = column.storyIds
        .map(id => stories.find(story => story.id === id))
        .filter((story): story is Story => 
          story !== undefined && 
          !story.deleted && 
          story.sprintId === currentSprint?.id
        );
    });
    
    return result;
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

// Export/Import atoms
export const exportDataAtom = atom(
  (get) => {
    return {
      stories: get(storiesAtom),
      sprints: get(sprintsAtom),
      roles: get(rolesAtom),
      visions: get(visionsAtom),
      projects: get(projectsAtom),
      classes: get(classesAtom),
      columns: get(columnsAtom),
      boards: get(boardsAtom),
      settings: get(settingsAtom),
      exportDate: new Date().toISOString()
    };
  }
);

export const importDataAtom = atom(
  null,
  (get, set, data: any) => {
    if (data.stories) set(storiesAtom, data.stories);
    // Only set sprints if they exist and are not empty
    if (data.sprints && data.sprints.length > 0) {
      set(sprintsAtom, data.sprints);
    }
    // Handle roles through settingsAtom
    if (data.roles) {
      // Get current settings and merge with new roles
      const currentSettings = get(settingsAtom);
      const updatedSettings = {
        ...currentSettings,
        roles: data.roles
      };
      set(settingsAtom, updatedSettings);
    }
    if (data.visions) set(visionsAtom, data.visions);
    // Only set columns if they exist and are not empty
    if (data.columns && data.columns.length > 0) {
      set(columnsAtom, data.columns);
    }
    // Only set boards if they exist and are not empty
    if (data.boards && data.boards.length > 0) {
      set(boardsAtom, data.boards);
    }
    if (data.projects) set(projectsAtom, data.projects);
    if (data.classes) set(classesAtom, data.classes);
    if (data.settings) set(settingsAtom, data.settings);
  }
);

import { applyDataMerge, type MergeOptions } from '@/utils/dataMerge';

// Enhanced import atom with merge/overwrite options
export const importDataWithOptionsAtom = atom(
  null,
  (get, set, data: any, options: MergeOptions) => {
    const existingData = {
      stories: get(storiesAtom),
      goals: get(goalsAtom),
      projects: get(projectsAtom),
      classes: get(classesAtom),
      assignments: get(assignmentsAtom),
      visions: get(visionsAtom),
      bucketlist: get(bucketlistAtom),
      importantDates: get(importantDatesAtom),
      traditions: get(traditionsAtom),
      roles: get(rolesAtom),
      sprints: get(sprintsAtom),
      settings: get(settingsAtom)
    };

    // Apply merge operations
    const mergedData = applyDataMerge(existingData, data, options);

    // Update atoms with merged data
    if (options.importStories) {
      set(storiesAtom, mergedData.stories);
    }
    if (options.importGoals) {
      set(goalsAtom, mergedData.goals);
    }
    if (options.importProjects) {
      set(projectsAtom, mergedData.projects);
    }
    if (options.importVisions) {
      set(visionsAtom, mergedData.visions);
    }
    if (options.importBucketlist) {
      set(bucketlistAtom, mergedData.bucketlist);
    }
    if (options.importImportantDates) {
      set(importantDatesAtom, mergedData.importantDates);
    }
    if (options.importTraditions) {
      set(traditionsAtom, mergedData.traditions);
    }
    if (options.importSprints) {
      set(sprintsAtom, mergedData.sprints);
    }
    if (options.importRoles) {
      set(rolesAtom, mergedData.roles);
    }
    if (options.importClasses) {
      set(classesAtom, mergedData.classes);
    }
    if (options.importAssignments) {
      set(assignmentsAtom, mergedData.assignments);
    }
    if (options.importSettings) {
      set(settingsAtom, mergedData.settings);
    }
  }
);

// Bulk delete atoms for Settings
export const deleteAllDataAtom = atom(
  null,
  (get, set) => {
    // Clear all atoms
    set(storiesAtom, []);
    set(goalsAtom, []);
    set(projectsAtom, []);
    set(visionsAtom, []);
    set(bucketlistAtom, []);
    set(importantDatesAtom, []);
    set(traditionsAtom, []);
    set(rolesAtom, []);
    set(columnsAtom, []);
    set(boardsAtom, []);
    set(sprintsAtom, []);
    
    // Also manually clear localStorage for important dates and traditions
    localStorage.removeItem('important-dates');
    localStorage.removeItem('life-scrum-important-dates');
    localStorage.removeItem('traditions');
    localStorage.removeItem('life-scrum-traditions');
  }
);