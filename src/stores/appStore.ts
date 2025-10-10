// Re-export all atoms from domain-specific stores for backward compatibility
export * from './storyStore';
export * from './goalStore';
export * from './projectStore';
export * from './uiStore';
export * from './priorityStore';
export * from './typeStore';
export * from './statusStore';

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
import { DEFAULT_COLUMNS, DEFAULT_BOARD, STORAGE_KEYS } from '@/constants';
import { storiesAtom } from './storyStore';
import { rolesAtom, visionsAtom, bucketlistAtom, importantDatesAtom, traditionsAtom, settingsAtom } from './settingsStore';
import { goalsAtom } from './goalStore';
import { projectsAtom } from './projectStore';
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

// Sprint-specific stories by status atom
export const sprintStoriesByStatusAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const selectedSprintId = get(selectedSprintIdAtom);
    
    const statuses = ['icebox', 'backlog', 'todo', 'progress', 'review', 'done'];
    const result: Record<string, Story[]> = {};
    
    statuses.forEach(status => {
      const statusStories = stories.filter(story => 
        !story.deleted && 
        story.sprintId === selectedSprintId &&
        story.status === status
      );
      
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
    if (data.settings) set(settingsAtom, data.settings);
  }
);

// Enhanced import atom with merge/overwrite options
export const importDataWithOptionsAtom = atom(
  null,
  (get, set, data: any, options: any) => {
    const existingData = {
      stories: get(storiesAtom),
      goals: get(goalsAtom),
      projects: get(projectsAtom),
      visions: get(visionsAtom),
      bucketlist: get(bucketlistAtom),
      importantDates: get(importantDatesAtom),
      traditions: get(traditionsAtom),
      roles: get(rolesAtom),
      sprints: get(sprintsAtom)
    };

    // Apply import based on options
    if (options.importStories && data.stories) {
      if (options.mode === 'overwrite') {
        set(storiesAtom, data.stories);
      } else {
        // Merge: combine and deduplicate by title
        const existingTitles = new Set(existingData.stories.map((s: any) => s.title));
        const newStories = data.stories.filter((s: any) => !existingTitles.has(s.title));
        set(storiesAtom, [...existingData.stories, ...newStories]);
      }
    }

    if (options.importGoals && data.goals) {
      if (options.mode === 'overwrite') {
        set(goalsAtom, data.goals);
      } else {
        const existingTitles = new Set(existingData.goals.map((g: any) => g.title));
        const newGoals = data.goals.filter((g: any) => !existingTitles.has(g.title));
        set(goalsAtom, [...existingData.goals, ...newGoals]);
      }
    }

    if (options.importProjects && data.projects) {
      if (options.mode === 'overwrite') {
        set(projectsAtom, data.projects);
      } else {
        const existingNames = new Set(existingData.projects.map((p: any) => p.name));
        const newProjects = data.projects.filter((p: any) => !existingNames.has(p.name));
        set(projectsAtom, [...existingData.projects, ...newProjects]);
      }
    }

    if (options.importVisions && data.visions) {
      if (options.mode === 'overwrite') {
        set(visionsAtom, data.visions);
      } else {
        const existingTitles = new Set(existingData.visions.map((v: any) => v.title));
        const newVisions = data.visions.filter((v: any) => !existingTitles.has(v.title));
        set(visionsAtom, [...existingData.visions, ...newVisions]);
      }
    }

    if (options.importBucketlist && data.bucketlist) {
      if (options.mode === 'overwrite') {
        set(bucketlistAtom, data.bucketlist);
      } else {
        const existingTitles = new Set(existingData.bucketlist.map((b: any) => b.title));
        const newBucketlist = data.bucketlist.filter((b: any) => !existingTitles.has(b.title));
        set(bucketlistAtom, [...existingData.bucketlist, ...newBucketlist]);
      }
    }

    if (options.importSprints && data.sprints) {
      if (options.mode === 'overwrite') {
        set(sprintsAtom, data.sprints);
      } else {
        const existingIds = new Set(existingData.sprints.map((s: any) => s.id));
        const newSprints = data.sprints.filter((s: any) => !existingIds.has(s.id));
        set(sprintsAtom, [...existingData.sprints, ...newSprints]);
      }
    }

    if (options.importRoles && data.roles) {
      if (options.mode === 'overwrite') {
        set(rolesAtom, data.roles);
      } else {
        const existingNames = new Set(existingData.roles.map((r: any) => r.name));
        const newRoles = data.roles.filter((r: any) => !existingNames.has(r.name));
        set(rolesAtom, [...existingData.roles, ...newRoles]);
      }
    }


    if (options.importImportantDates && data.importantDates) {
      if (options.mode === 'overwrite') {
        set(importantDatesAtom, data.importantDates);
      } else {
        const existingTitles = new Set(existingData.importantDates.map((d: any) => d.title));
        const newImportantDates = data.importantDates.filter((d: any) => !existingTitles.has(d.title));
        set(importantDatesAtom, [...existingData.importantDates, ...newImportantDates]);
      }
    }

    if (options.importTraditions && data.traditions) {
      if (options.mode === 'overwrite') {
        set(traditionsAtom, data.traditions);
      } else {
        const existingTitles = new Set(existingData.traditions.map((t: any) => t.title));
        const newTraditions = data.traditions.filter((t: any) => !existingTitles.has(t.title));
        set(traditionsAtom, [...existingData.traditions, ...newTraditions]);
      }
    }

    if (options.importSettings && data.settings) {
      set(settingsAtom, data.settings);
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