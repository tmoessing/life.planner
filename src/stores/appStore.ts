// Re-export all atoms from domain-specific stores for backward compatibility
export * from './storyStore';
export * from './goalStore';
export * from './projectStore';
export * from './classStore';
export * from './uiStore';
export * from './priorityStore';
export * from './typeStore';
export * from './statusStore';

// Import atoms needed for import/export functions
import { goalsAtom } from './goalStore';
import { projectsAtom } from './projectStore';
import { classesAtom } from './classStore';
import { assignmentsAtom } from './assignmentStore';
import { visionsAtom, bucketlistAtom, importantDatesAtom, traditionsAtom } from './settingsStore';

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

// Re-export sprint and board atoms from domain-specific stores
export {
  sprintsAtom,
  safeSprintsAtom,
  currentSprintAtom,
  sprintStoriesByStatusAtom
} from './sprintStore';

export {
  columnsAtom,
  safeColumnsAtom,
  boardsAtom,
  storiesByColumnAtom
} from './boardStore';

// Import for use in this file
import { sprintsAtom } from './sprintStore';
import { columnsAtom, boardsAtom } from './boardStore';

// Import utilities for remaining atoms
import { atom } from 'jotai';
import { filterStories } from '@/utils';
import { storiesAtom } from './storyStore';
import { rolesAtom, settingsAtom } from './settingsStore';
import { filterTextAtom, filterKeywordsAtom, filterDueSoonAtom } from './uiStore';

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

// Import sprint/board atoms for import/export (already imported above via re-exports)

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
  (_get, set) => {
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