/**
 * Utilities for merging and importing data with overwrite/merge modes
 */

export type ImportMode = 'merge' | 'overwrite';

export interface MergeOptions {
  mode: ImportMode;
  importStories?: boolean;
  importGoals?: boolean;
  importProjects?: boolean;
  importVisions?: boolean;
  importBucketlist?: boolean;
  importImportantDates?: boolean;
  importTraditions?: boolean;
  importSprints?: boolean;
  importRoles?: boolean;
  importClasses?: boolean;
  importAssignments?: boolean;
  importSettings?: boolean;
}

/**
 * Generic merge function for arrays with deduplication
 */
export function mergeArray<T>(
  existing: T[],
  imported: T[],
  mode: ImportMode,
  getKey: (item: T) => string
): T[] {
  if (mode === 'overwrite') {
    return imported;
  }
  
  // Merge: combine and deduplicate
  const existingKeys = new Set(existing.map(getKey));
  const newItems = imported.filter(item => !existingKeys.has(getKey(item)));
  return [...existing, ...newItems];
}

/**
 * Merge stories by title
 */
export function mergeStories(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (story) => story.title);
}

/**
 * Merge goals by title
 */
export function mergeGoals(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (goal) => goal.title);
}

/**
 * Merge projects by name
 */
export function mergeProjects(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (project) => project.name);
}

/**
 * Merge visions by title
 */
export function mergeVisions(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (vision) => vision.title);
}

/**
 * Merge bucketlist items by title
 */
export function mergeBucketlist(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (item) => item.title);
}

/**
 * Merge important dates by title
 */
export function mergeImportantDates(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (date) => date.title);
}

/**
 * Merge traditions by title
 */
export function mergeTraditions(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (tradition) => tradition.title);
}

/**
 * Merge sprints by id
 */
export function mergeSprints(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (sprint) => sprint.id);
}

/**
 * Merge roles by name
 */
export function mergeRoles(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (role) => role.name);
}

/**
 * Merge classes by title and classCode
 */
export function mergeClasses(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (cls) => `${cls.title}-${cls.classCode}`);
}

/**
 * Merge assignments by classId and title
 */
export function mergeAssignments(
  existing: any[],
  imported: any[],
  mode: ImportMode
): any[] {
  return mergeArray(existing, imported, mode, (assignment) => `${assignment.classId}-${assignment.title}`);
}

/**
 * Apply merge operations based on options
 */
export function applyDataMerge(
  existingData: Record<string, any>,
  importedData: Record<string, any>,
  options: MergeOptions
): Record<string, any> {
  const result: Record<string, any> = {};

  if (options.importStories && importedData.stories) {
    result.stories = mergeStories(
      existingData.stories || [],
      importedData.stories,
      options.mode
    );
  } else {
    result.stories = existingData.stories || [];
  }

  if (options.importGoals && importedData.goals) {
    result.goals = mergeGoals(
      existingData.goals || [],
      importedData.goals,
      options.mode
    );
  } else {
    result.goals = existingData.goals || [];
  }

  if (options.importProjects && importedData.projects) {
    result.projects = mergeProjects(
      existingData.projects || [],
      importedData.projects,
      options.mode
    );
  } else {
    result.projects = existingData.projects || [];
  }

  if (options.importVisions && importedData.visions) {
    result.visions = mergeVisions(
      existingData.visions || [],
      importedData.visions,
      options.mode
    );
  } else {
    result.visions = existingData.visions || [];
  }

  if (options.importBucketlist && importedData.bucketlist) {
    result.bucketlist = mergeBucketlist(
      existingData.bucketlist || [],
      importedData.bucketlist,
      options.mode
    );
  } else {
    result.bucketlist = existingData.bucketlist || [];
  }

  if (options.importImportantDates && importedData.importantDates) {
    result.importantDates = mergeImportantDates(
      existingData.importantDates || [],
      importedData.importantDates,
      options.mode
    );
  } else {
    result.importantDates = existingData.importantDates || [];
  }

  if (options.importTraditions && importedData.traditions) {
    result.traditions = mergeTraditions(
      existingData.traditions || [],
      importedData.traditions,
      options.mode
    );
  } else {
    result.traditions = existingData.traditions || [];
  }

  if (options.importSprints && importedData.sprints) {
    result.sprints = mergeSprints(
      existingData.sprints || [],
      importedData.sprints,
      options.mode
    );
  } else {
    result.sprints = existingData.sprints || [];
  }

  if (options.importRoles && importedData.roles) {
    result.roles = mergeRoles(
      existingData.roles || [],
      importedData.roles,
      options.mode
    );
  } else {
    result.roles = existingData.roles || [];
  }

  if (options.importClasses && importedData.classes) {
    result.classes = mergeClasses(
      existingData.classes || [],
      importedData.classes,
      options.mode
    );
  } else {
    result.classes = existingData.classes || [];
  }

  if (options.importAssignments && importedData.assignments) {
    result.assignments = mergeAssignments(
      existingData.assignments || [],
      importedData.assignments,
      options.mode
    );
  } else {
    result.assignments = existingData.assignments || [];
  }

  // Settings are always overwritten if provided
  if (options.importSettings && importedData.settings) {
    result.settings = importedData.settings;
  } else {
    result.settings = existingData.settings || {};
  }

  // Preserve other existing data
  result.columns = existingData.columns || [];
  result.boards = existingData.boards || [];

  return result;
}

