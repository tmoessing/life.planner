import { format } from 'date-fns';

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
  importSettings: boolean;
}

export const defaultImportOptions: ImportOptions = {
  mode: 'merge',
  importStories: true,
  importGoals: true,
  importProjects: true,
  importVisions: true,
  importBucketlist: true,
  importImportantDates: true,
  importTraditions: true,
  importSprints: false, // Usually don't import sprints as they're generated
  importRoles: true,
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
    labels: []
  };

  let currentSection = '';
  let headers: string[] = [];

  for (const line of lines) {
    if (line.startsWith('=== ')) {
      // New section - handle both uppercase and lowercase
      currentSection = line.replace('=== ', '').replace(' ===', '').toLowerCase().trim();
      headers = [];
      console.log('Found section:', currentSection);
    } else if (line.includes(',')) {
      const values = parseCSVLine(line);
      
      // Skip header rows (lines that start with the first column name)
      if (values[0] === 'Story' || values[0] === 'Goal' || values[0] === 'Project' || 
          values[0] === 'Vision' || values[0] === 'Bucketlist Item' || values[0] === 'Important Date' || 
          values[0] === 'Tradition' || values[0] === 'Sprint' || values[0] === 'Role' || values[0] === 'Label') {
        console.log('Skipping header row:', values[0]);
        continue;
      }
      
      // For each section, use predefined headers based on the section type
      let sectionHeaders: string[] = [];
      switch (currentSection) {
        case 'important dates':
          sectionHeaders = ['Title', 'Date', 'Created At', 'Updated At'];
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
          sectionHeaders = ['Title', 'Description', 'Category', 'Type', 'Priority', 'Status', 'Target Date', 'Story Ids', 'Created At', 'Updated At'];
          break;
        case 'projects':
          sectionHeaders = ['Name', 'Description', 'Status', 'Priority', 'Start Date', 'End Date', 'Story Ids', 'Created At', 'Updated At'];
          break;
        case 'visions':
          sectionHeaders = ['Title', 'Description', 'Type', 'Priority', 'Order', 'Created At', 'Updated At'];
          break;
        case 'bucketlist':
          sectionHeaders = ['Title', 'Description', 'Type', 'Priority', 'Status', 'Created At', 'Updated At'];
          break;
        case 'sprints':
          sectionHeaders = ['Id', 'Iso Week', 'Year', 'Start Date', 'End Date', 'Created At', 'Updated At'];
          break;
      }

      if (sectionHeaders.length > 0) {
        // Data row
        const rowData: any = {};
        sectionHeaders.forEach((header, index) => {
          rowData[header.trim()] = (values[index] || '').trim();
        });

        // Add to appropriate section
        switch (currentSection) {
          case 'stories':
            if (rowData.Title) {
              console.log('Parsing story:', rowData.Title);
              data.stories.push(parseStoryData(rowData));
            }
            break;
          case 'goals':
            if (rowData.Title) {
              console.log('Parsing goal:', rowData.Title);
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
              data.bucketlist.push(parseBucketlistData(rowData));
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
        }
      }
    }
  }

  console.log('Parsed data summary:', {
    stories: data.stories.length,
    goals: data.goals.length,
    projects: data.projects.length,
    visions: data.visions.length,
    bucketlist: data.bucketlist.length,
    importantDates: data.importantDates.length,
    traditions: data.traditions.length,
    roles: data.roles.length,
    labels: data.labels.length
  });

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

// Parse different data types
const parseStoryData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  description: row['Description'] || '',
  priority: row['Priority'] || 'Q4',
  type: row['Type'] || 'Intellectual',
  size: row['Size'] || 'M',
  weight: parseInt(row['Weight']) || 1,
  status: row['Status'] || 'backlog',
  sprintId: row['SprintId'] || undefined,
  roleId: row['RoleId'] || undefined,
  visionId: row['VisionId'] || undefined,
  projectId: row['ProjectId'] || undefined,
  goalId: row['GoalId'] || undefined,
  labels: row['Labels'] ? row['Labels'].split('; ').filter(Boolean) : [],
  taskCategories: row['Task Categories'] ? row['Task Categories'].split('; ').filter(Boolean) : [],
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
  description: row['Description'] || '',
  category: row['Category'] || 'target',
  type: row['Type'] || 'Spiritual',
  priority: row['Priority'] || 'medium',
  status: row['Status'] || 'backlog',
  targetDate: row['Target Date'] || undefined,
  storyIds: row['Story Ids'] ? row['Story Ids'].split('; ').filter(Boolean) : [],
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
  storyIds: row['Story Ids'] ? row['Story Ids'].split('; ').filter(Boolean) : [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseVisionData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  description: row['Description'] || '',
  type: row['Type'] || 'Spiritual',
  priority: row['Priority'] || 'medium',
  order: parseInt(row['Order']) || 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseBucketlistData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  description: row['Description'] || '',
  completed: false,
  bucketlistType: (row['Type'] || 'Experience').toLowerCase() === 'experience' ? 'experience' : 'location',
  priority: row['Priority'] || 'Q2',
  status: row['Status'] === 'pending' ? 'not-started' : 
          row['Status'] === 'completed' ? 'completed' : 
          row['Status'] === 'in-progress' ? 'in-progress' : 'not-started',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

const parseImportantDateData = (row: any) => ({
  id: generateId(),
  title: row['Title'] || '',
  date: row['Date'] || '',
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
  isoWeek: parseInt(row['Iso Week']) || 1,
  year: parseInt(row['Year']) || new Date().getFullYear(),
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

// Generate a simple ID
const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Merge data with existing data
export const mergeData = (existingData: any, importedData: any, options: ImportOptions) => {
  const result = { ...existingData };

  if (options.importStories && importedData.stories) {
    if (options.mode === 'overwrite') {
      result.stories = importedData.stories;
    } else {
      // Merge: combine and deduplicate by title
      const existingTitles = new Set(existingData.stories.map((s: any) => s.title));
      const newStories = importedData.stories.filter((s: any) => !existingTitles.has(s.title));
      result.stories = [...existingData.stories, ...newStories];
    }
  }

  if (options.importGoals && importedData.goals) {
    if (options.mode === 'overwrite') {
      result.goals = importedData.goals;
    } else {
      const existingTitles = new Set(existingData.goals.map((g: any) => g.title));
      const newGoals = importedData.goals.filter((g: any) => !existingTitles.has(g.title));
      result.goals = [...existingData.goals, ...newGoals];
    }
  }

  if (options.importProjects && importedData.projects) {
    if (options.mode === 'overwrite') {
      result.projects = importedData.projects;
    } else {
      const existingNames = new Set(existingData.projects.map((p: any) => p.name));
      const newProjects = importedData.projects.filter((p: any) => !existingNames.has(p.name));
      result.projects = [...existingData.projects, ...newProjects];
    }
  }

  if (options.importVisions && importedData.visions) {
    if (options.mode === 'overwrite') {
      result.visions = importedData.visions;
    } else {
      const existingTitles = new Set(existingData.visions.map((v: any) => v.title));
      const newVisions = importedData.visions.filter((v: any) => !existingTitles.has(v.title));
      result.visions = [...existingData.visions, ...newVisions];
    }
  }

  if (options.importBucketlist && importedData.bucketlist) {
    if (options.mode === 'overwrite') {
      result.bucketlist = importedData.bucketlist;
    } else {
      const existingTitles = new Set(existingData.bucketlist.map((b: any) => b.title));
      const newBucketlist = importedData.bucketlist.filter((b: any) => !existingTitles.has(b.title));
      result.bucketlist = [...existingData.bucketlist, ...newBucketlist];
    }
  }

  if (options.importImportantDates && importedData.importantDates) {
    if (options.mode === 'overwrite') {
      result.importantDates = importedData.importantDates;
    } else {
      const existingTitles = new Set(existingData.importantDates.map((d: any) => d.title));
      const newDates = importedData.importantDates.filter((d: any) => !existingTitles.has(d.title));
      result.importantDates = [...existingData.importantDates, ...newDates];
    }
  }

  if (options.importTraditions && importedData.traditions) {
    if (options.mode === 'overwrite') {
      result.traditions = importedData.traditions;
    } else {
      const existingTitles = new Set(existingData.traditions.map((t: any) => t.title));
      const newTraditions = importedData.traditions.filter((t: any) => !existingTitles.has(t.title));
      result.traditions = [...existingData.traditions, ...newTraditions];
    }
  }

  if (options.importSprints && importedData.sprints) {
    if (options.mode === 'overwrite') {
      result.sprints = importedData.sprints;
    } else {
      const existingIds = new Set(existingData.sprints.map((s: any) => s.id));
      const newSprints = importedData.sprints.filter((s: any) => !existingIds.has(s.id));
      result.sprints = [...existingData.sprints, ...newSprints];
    }
  }

  if (options.importRoles && importedData.roles) {
    if (options.mode === 'overwrite') {
      result.roles = importedData.roles;
    } else {
      const existingNames = new Set(existingData.roles.map((r: any) => r.name));
      const newRoles = importedData.roles.filter((r: any) => !existingNames.has(r.name));
      result.roles = [...existingData.roles, ...newRoles];
    }
  }


  return result;
};
