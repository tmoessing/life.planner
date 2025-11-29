import { googleSheetsService } from '@/services/googleSheetsService';
import { syncService } from '@/services/syncService';
import { applyDataMerge, type MergeOptions } from './dataMerge';

export type ImportMode = 'merge' | 'overwrite';

export interface ImportOptions {
  mode: ImportMode;
  importStories: boolean;
  importGoals: boolean;
  importProjects: boolean;
  importVisions: boolean;
  importBucketlist: boolean;
  importImportantDates: boolean;
  importTraditions: boolean;
  importSprints: boolean;
  importRoles: boolean;
  importClasses: boolean;
  importAssignments: boolean;
  importSettings: boolean;
}

export const defaultImportOptions: ImportOptions = {
  mode: 'overwrite',
  importStories: true,
  importGoals: true,
  importProjects: true,
  importVisions: true,
  importBucketlist: true,
  importImportantDates: true,
  importTraditions: true,
  importSprints: false, // Usually don't import sprints as they're generated
  importRoles: true,
  importClasses: true,
  importAssignments: true,
  importSettings: false // Usually don't import settings to preserve user preferences
};

// Parse CSV data into structured format
export const parseCSVData = (csvContent: string) => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  const data: any = {
    stories: [],
    goals: [],
    projects: [],
    visions: [],
    bucketlist: [],
    importantDates: [],
    traditions: [],
    sprints: [],
    roles: [],
    labels: [],
    classes: [],
    assignments: []
  };

  let currentSection = '';

  for (const line of lines) {
    if (line.startsWith('=== ')) {
      // New section - handle both uppercase and lowercase
      currentSection = line.replace('=== ', '').replace(' ===', '').toLowerCase().trim();
    } else if (line.includes(',')) {
      const values = parseCSVLine(line);
      
      // Skip header rows (lines that start with the first column name)
      if (values[0] === 'Story' || values[0] === 'Goal' || values[0] === 'Project' || 
          values[0] === 'Vision' || values[0] === 'Bucketlist Item' || values[0] === 'Important Date' || 
          values[0] === 'Tradition' || values[0] === 'Sprint' || values[0] === 'Role' || values[0] === 'Label' ||
          values[0] === 'Class' || values[0] === 'Assignment') {
        continue;
      }
      
      // For each section, use predefined headers based on the section type
      let sectionHeaders: string[] = [];
      switch (currentSection) {
        case 'important dates':
          sectionHeaders = ['Title', 'Date', 'Category', 'Created At', 'Updated At'];
          break;
        case 'traditions':
          sectionHeaders = ['Title', 'Description', 'Type', 'Created At', 'Updated At'];
          break;
        case 'roles':
          sectionHeaders = ['Name', 'Color'];
          break;
        case 'labels':
          sectionHeaders = ['Name', 'Color'];
          break;
        case 'stories':
          sectionHeaders = ['Title', 'Description', 'Priority', 'Type', 'Size', 'Weight', 'Status', 'SprintId', 'RoleId', 'VisionId', 'ProjectId', 'GoalId', 'Labels', 'Task Categories', 'Due Date', 'Scheduled Date', 'Location', 'Created At', 'Updated At'];
          break;
        case 'goals':
          sectionHeaders = ['Title', 'Description', 'Category', 'Type', 'Priority', 'Status', 'Target Date', 'Story Ids', 'Order', 'Vision Id', 'Role Id', 'Project Id', 'Completed', 'Created At', 'Updated At'];
          break;
        case 'projects':
          sectionHeaders = ['Name', 'Description', 'Status', 'Priority', 'Start Date', 'End Date', 'Story Ids', 'Created At', 'Updated At'];
          break;
        case 'visions':
          sectionHeaders = ['Title', 'Description', 'Type', 'Priority', 'Order', 'Created At', 'Updated At'];
          break;
        case 'bucketlist':
          sectionHeaders = ['Title', 'Description', 'Type', 'Priority', 'Status', 'Completed', 'Completed At', 'Category', 'Role Id', 'Vision Id', 'Due Date', 'Order', 'Country', 'State', 'City', 'Experience Category', 'Created At', 'Updated At'];
          break;
        case 'sprints':
          sectionHeaders = ['Id', 'Iso Week', 'Year', 'Start Date', 'End Date', 'Created At', 'Updated At'];
          break;
        case 'classes':
          sectionHeaders = ['Title', 'Class Code', 'Semester', 'Year', 'Credit Hours', 'Class Type', 'Schedule', 'Assignment Ids', 'Created At', 'Updated At'];
          break;
        case 'assignments':
          sectionHeaders = ['Class Id', 'Title', 'Type', 'Description', 'Due Date', 'Due Time', 'Status', 'Weight', 'Recurrence Pattern', 'Story Id', 'Created At', 'Updated At'];
          break;
      }

      if (sectionHeaders.length > 0) {
        // Data row
        const rowData: any = {};
        sectionHeaders.forEach((header, index) => {
          const value = values[index];
          // Preserve empty strings but trim whitespace
          // Use the exact header name (with spaces) as the key
          rowData[header] = value !== undefined && value !== null ? String(value).trim() : '';
        });

        // Add to appropriate section
        switch (currentSection) {
          case 'stories':
            if (rowData.Title) {
              data.stories.push(parseStoryData(rowData));
            }
            break;
          case 'goals':
            if (rowData.Title) {
              data.goals.push(parseGoalData(rowData));
            }
            break;
          case 'projects':
            if (rowData.Name) {
              data.projects.push(parseProjectData(rowData));
            }
            break;
          case 'visions':
            if (rowData.Title) {
              data.visions.push(parseVisionData(rowData));
            }
            break;
          case 'bucketlist':
            if (rowData.Title) {
              const bucketlistItem = parseBucketlistData(rowData);
              data.bucketlist.push(bucketlistItem);
            }
            break;
          case 'important dates':
            if (rowData.Title) {
              data.importantDates.push(parseImportantDateData(rowData));
            }
            break;
          case 'traditions':
            if (rowData.Title) {
              data.traditions.push(parseTraditionData(rowData));
            }
            break;
          case 'sprints':
            if (rowData.Id) {
              data.sprints.push(parseSprintData(rowData));
            }
            break;
          case 'roles':
            if (rowData.Name) {
              data.roles.push(parseRoleData(rowData));
            }
            break;
          case 'labels':
            if (rowData.Name) {
              data.labels.push(parseLabelData(rowData));
            }
            break;
          case 'classes':
            if (rowData.Title) {
              data.classes.push(parseClassData(rowData));
            }
            break;
          case 'assignments':
            if (rowData.Title) {
              data.assignments.push(parseAssignmentData(rowData));
            }
            break;
        }
      }
    }
  }

  return data;
};

// Parse a single CSV line, handling quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

import { generateId, parseStringArray, parseIntSafe, parseBoolean, parseOptionalString } from './importParsers';

// Parse different data types
const parseStoryData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  description: row['Description'] || '',
  priority: row['Priority'] || 'Q4',
  type: row['Type'] || 'Intellectual',
  size: row['Size'] || 'M',
  weight: parseIntSafe(row['Weight'], 1),
  status: row['Status'] || 'backlog',
  sprintId: row['SprintId'] || undefined,
  roleId: row['RoleId'] || undefined,
  visionId: row['VisionId'] || undefined,
  projectId: row['ProjectId'] || undefined,
  goalId: row['GoalId'] || undefined,
  labels: parseStringArray(row['Labels']),
  taskCategories: parseStringArray(row['Task Categories']),
  dueDate: row['Due Date'] || undefined,
  scheduledDate: row['Scheduled Date'] || undefined,
  location: row['Location'] || undefined,
  checklist: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseGoalData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  name: row['Title'] || '', // alias for title
  description: row['Description'] || '',
  category: row['Category'] || 'target',
  goalType: row['Type'] || 'Spiritual',
  priority: row['Priority'] || 'medium',
  status: row['Status'] || 'backlog',
  order: parseIntSafe(row['Order'], 0),
  storyIds: parseStringArray(row['Story Ids']),
  visionId: row['Vision Id'] || undefined,
  roleId: row['Role Id'] || undefined,
  projectId: row['Project Id'] || undefined,
  completed: parseBoolean(row['Completed']),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseProjectData = (row: any) => ({
  id: generateId(),
  name: row['Name'] || '',
  description: row['Description'] || '',
  status: row['Status'] || 'active',
  priority: row['Priority'] || 'medium',
  startDate: row['Start Date'] || undefined,
  endDate: row['End Date'] || undefined,
  storyIds: parseStringArray(row['Story Ids']),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseVisionData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  description: row['Description'] || '',
  type: row['Type'] || 'Spiritual',
  priority: row['Priority'] || 'medium',
  order: parseIntSafe(row['Order']),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseBucketlistData = (row: any) => {
  const typeValue = (row['Type'] || '').toLowerCase().trim();
  let bucketlistType: 'location' | 'experience';
  
  if (typeValue === 'location') {
    bucketlistType = 'location';
  } else if (typeValue === 'experience') {
    bucketlistType = 'experience';
  } else {
    // Default to experience if type is not specified or unrecognized
    bucketlistType = 'experience';
  }
  
  return {
    id: generateId(),
    title: row['Title'] || '',
    description: row['Description'] || '',
    completed: parseBoolean(row['Completed']),
    completedAt: row['Completed At'] || undefined,
    category: row['Category'] || undefined,
    bucketlistType,
    priority: row['Priority'] || 'Q2',
    status: row['Status'] === 'completed' ? 'completed' : 
            row['Status'] === 'in-progress' ? 'in-progress' : 'in-progress',
    roleId: row['Role Id'] || undefined,
    visionId: row['Vision Id'] || undefined,
    dueDate: row['Due Date'] || undefined,
    order: parseIntSafe(row['Order']),
    country: parseOptionalString(row['Country']),
    state: parseOptionalString(row['State']),
    city: parseOptionalString(row['City']),
    experienceCategory: parseOptionalString(row['Experience Category']),
    createdAt: row['Created At'] || new Date().toISOString(),
    updatedAt: row['Updated At'] || new Date().toISOString()
  };
};

const parseImportantDateData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  date: row['Date'] || '',
  category: row['Category'] || undefined,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseTraditionData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  description: row['Description'] || '',
  type: row['Type'] || 'Spiritual',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseSprintData = (row: any) => ({
  id: row['Id'] || generateId(),
  isoWeek: parseIntSafe(row['Iso Week'], 1),
  year: parseIntSafe(row['Year'], new Date().getFullYear()),
  startDate: row['Start Date'] || '',
  endDate: row['End Date'] || '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseRoleData = (row: any) => ({
  id: generateId(),
  name: row['Name'] || '',
  color: row['Color'] || '#6B7280'
});

const parseLabelData = (row: any) => ({
  id: generateId(),
  name: row['Name'] || '',
  color: row['Color'] || '#6B7280'
});

const parseClassData = (row: any) => {
  let schedule: Array<{ time: string; endTime?: string; days: string[]; startDate?: string; endDate?: string }> = [];
  try {
    if (row['Schedule']) {
      schedule = JSON.parse(row['Schedule']);
    }
  } catch (e) {
    // If parsing fails, leave as empty array
    schedule = [];
  }

  return {
    id: generateId(),
    title: row['Title'] || '',
    classCode: row['Class Code'] || '',
    semester: row['Semester'] || 'Fall',
    year: parseIntSafe(row['Year'], new Date().getFullYear()),
    creditHours: parseIntSafe(row['Credit Hours'], 3),
    classType: row['Class Type'] || 'Major',
    schedule: schedule,
    assignmentIds: parseStringArray(row['Assignment Ids']),
    createdAt: row['Created At'] || new Date().toISOString(),
    updatedAt: row['Updated At'] || new Date().toISOString()
  };
};

const parseAssignmentData = (row: any) => {
  let recurrencePattern: any = undefined;
  try {
    if (row['Recurrence Pattern']) {
      recurrencePattern = JSON.parse(row['Recurrence Pattern']);
    }
  } catch (e) {
    // If parsing fails, leave as undefined
    recurrencePattern = undefined;
  }

  return {
    id: generateId(),
    classId: row['Class Id'] || '',
    title: row['Title'] || '',
    type: row['Type'] || 'homework',
    description: row['Description'] || undefined,
    dueDate: row['Due Date'] || undefined,
    dueTime: row['Due Time'] || undefined,
    status: row['Status'] || 'not-started',
    weight: parseIntSafe(row['Weight'], 3) as 1 | 3 | 5 | 8 | 13 | 21,
    recurrencePattern: recurrencePattern,
    storyId: row['Story Id'] || undefined,
    createdAt: row['Created At'] || new Date().toISOString(),
    updatedAt: row['Updated At'] || new Date().toISOString()
  };
};

// Merge data with existing data
export const mergeData = (existingData: any, importedData: any, options: ImportOptions) => {
  // Convert ImportOptions to MergeOptions format
  const mergeOptions: MergeOptions = {
    mode: options.mode,
    importStories: options.importStories,
    importGoals: options.importGoals,
    importProjects: options.importProjects,
    importVisions: options.importVisions,
    importBucketlist: options.importBucketlist,
    importImportantDates: options.importImportantDates,
    importTraditions: options.importTraditions,
    importSprints: options.importSprints,
    importRoles: options.importRoles,
    importClasses: options.importClasses,
    importAssignments: options.importAssignments,
    importSettings: options.importSettings
  };

  return applyDataMerge(existingData, importedData, mergeOptions);
};

// Import data from Google Sheets
export const importFromGoogleSheets = async (options: ImportOptions = defaultImportOptions): Promise<{
  success: boolean;
  data?: any;
  error?: string;
}> => {
  try {
    // Check if authenticated
    if (!googleSheetsService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated with Google Sheets' };
    }

    // Load data from Google Sheets
    const sheetData = await googleSheetsService.loadAllData();

    // Filter data based on import options
    const filteredData: any = {};

    if (options.importStories) {
      filteredData.stories = sheetData.stories || [];
    }
    if (options.importGoals) {
      filteredData.goals = sheetData.goals || [];
    }
    if (options.importProjects) {
      filteredData.projects = sheetData.projects || [];
    }
    if (options.importVisions) {
      filteredData.visions = sheetData.visions || [];
    }
    if (options.importBucketlist) {
      filteredData.bucketlist = sheetData.bucketlist || [];
    }
    if (options.importImportantDates) {
      filteredData.importantDates = sheetData.importantDates || [];
    }
    if (options.importTraditions) {
      filteredData.traditions = sheetData.traditions || [];
    }
    if (options.importSprints) {
      filteredData.sprints = sheetData.sprints || [];
    }
    if (options.importClasses) {
      filteredData.classes = sheetData.classes || [];
    }
    if (options.importAssignments) {
      filteredData.assignments = sheetData.assignments || [];
    }
    if (options.importSettings) {
      filteredData.settings = sheetData.settings || {};
    }

    return { success: true, data: filteredData };
  } catch (error) {
    console.error('Import from Google Sheets failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Sync data from Google Sheets (two-way sync)
export const syncFromGoogleSheets = async (): Promise<{
  success: boolean;
  conflicts?: any[];
  error?: string;
}> => {
  try {
    const result = await syncService.triggerSync();
    return { 
      success: result.success, 
      conflicts: result.conflicts,
      error: result.errors.join(', ') 
    };
  } catch (error) {
    console.error('Sync from Google Sheets failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Check if Google Sheets is available for import
export const isGoogleSheetsAvailable = (): boolean => {
  return googleSheetsService.isAuthenticated();
};

// Get Google Sheets import status
export const getGoogleSheetsImportStatus = () => {
  return {
    isAuthenticated: googleSheetsService.isAuthenticated(),
    isOnline: syncService.isOnline(),
    syncStatus: syncService.getSyncStatus(),
    connectionState: syncService.getConnectionState()
  };
};
