import { format } from 'date-fns';
import { googleSheetsService } from '@/services/googleSheetsService';
import { syncService } from '@/services/syncService';

// Export data to CSV format (can be opened in Excel)
export const exportToCSV = (data: any[], filename: string) => {
  if (data.length === 0) {
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.join(','),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle arrays and objects
        if (Array.isArray(value)) {
          return `"${value.join('; ')}"`;
        }
        if (typeof value === 'object' && value !== null) {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Handle strings with commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export all data to multiple CSV files
export const exportAllData = (data: {
  stories: any[];
  sprints: any[];
  goals: any[];
  projects: any[];
  visions: any[];
  bucketlist: any[];
  roles: any[];
  labels: any[];
  importantDates: any[];
  traditions: any[];
  classes?: any[];
  assignments?: any[];
}) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  
  // Export each data type to its own CSV file
  if (data.stories.length > 0) {
    exportToCSV(data.stories, `stories_${timestamp}`);
  }
  
  if (data.sprints.length > 0) {
    exportToCSV(data.sprints, `sprints_${timestamp}`);
  }
  
  if (data.goals.length > 0) {
    exportToCSV(data.goals, `goals_${timestamp}`);
  }
  
  if (data.projects.length > 0) {
    exportToCSV(data.projects, `projects_${timestamp}`);
  }
  
  if (data.visions.length > 0) {
    exportToCSV(data.visions, `visions_${timestamp}`);
  }
  
  if (data.bucketlist.length > 0) {
    exportToCSV(data.bucketlist, `bucketlist_${timestamp}`);
  }
  
  if (data.roles.length > 0) {
    exportToCSV(data.roles, `roles_${timestamp}`);
  }
  
  if (data.labels.length > 0) {
    exportToCSV(data.labels, `labels_${timestamp}`);
  }
  
  if (data.importantDates.length > 0) {
    exportToCSV(data.importantDates, `important-dates_${timestamp}`);
  }
  
  if (data.traditions.length > 0) {
    exportToCSV(data.traditions, `traditions_${timestamp}`);
  }
  
  if (data.classes && data.classes.length > 0) {
    exportToCSV(data.classes, `classes_${timestamp}`);
  }
  
  if (data.assignments && data.assignments.length > 0) {
    exportToCSV(data.assignments, `assignments_${timestamp}`);
  }
};

// Create a comprehensive Excel-like export with multiple sheets
export const exportToExcel = (data: {
  stories: any[];
  sprints: any[];
  goals: any[];
  projects: any[];
  visions: any[];
  bucketlist: any[];
  roles: any[];
  labels: any[];
  importantDates: any[];
  traditions: any[];
  classes?: any[];
  assignments?: any[];
}) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
  
  // Create a comprehensive CSV with all data
  const allData = [
    // Stories section
    ...(data.stories.length > 0 ? [
      ['=== STORIES ==='],
      ...data.stories.map(story => [
        story.title || '',
        story.description || '',
        story.priority || '',
        story.type || '',
        story.size || '',
        story.weight || '',
        story.status || '',
        story.sprintId || '',
        story.roleId || '',
        story.visionId || '',
        story.projectId || '',
        story.goalId || '',
        story.labels?.join('; ') || '',
        story.taskCategories?.join('; ') || '',
        story.dueDate || '',
        story.scheduledDate || '',
        story.location || '',
        story.createdAt || '',
        story.updatedAt || ''
      ])
    ] : []),
    
    // Goals section
    ...(data.goals.length > 0 ? [
      ['=== GOALS ==='],
      ...data.goals.map(goal => [
        goal.title || '',
        goal.description || '',
        goal.category || '',
        goal.goalType || '',
        goal.priority || '',
        goal.status || '',
        goal.targetDate || '',
        goal.storyIds?.join('; ') || '',
        goal.order || 0,
        goal.visionId || '',
        goal.roleId || '',
        goal.projectId || '',
        goal.completed ? 'true' : 'false',
        goal.createdAt || '',
        goal.updatedAt || ''
      ])
    ] : []),
    
    // Projects section
    ...(data.projects.length > 0 ? [
      ['=== PROJECTS ==='],
      ...data.projects.map(project => [
        project.name || '',
        project.description || '',
        project.status || '',
        project.priority || '',
        project.startDate || '',
        project.endDate || '',
        project.storyIds?.join('; ') || '',
        project.createdAt || '',
        project.updatedAt || ''
      ])
    ] : []),
    
    // Visions section
    ...(data.visions.length > 0 ? [
      ['=== VISIONS ==='],
      ...data.visions.map(vision => [
        vision.title || '',
        vision.description || '',
        vision.type || '',
        vision.priority || '',
        vision.order || '',
        vision.createdAt || '',
        vision.updatedAt || ''
      ])
    ] : []),
    
    // Bucketlist section
    ...(data.bucketlist.length > 0 ? [
      ['=== BUCKETLIST ==='],
      ...data.bucketlist.map(item => [
        item.title || '',
        item.description || '',
        item.bucketlistType || '',
        item.priority || '',
        item.status || '',
        item.completed ? 'true' : 'false',
        item.completedAt || '',
        item.category || '',
        item.roleId || '',
        item.visionId || '',
        item.dueDate || '',
        item.order || '',
        item.country || '',
        item.state || '',
        item.city || '',
        item.experienceCategory || '',
        item.createdAt || '',
        item.updatedAt || ''
      ])
    ] : []),
    
    // Important Dates section
    ...(data.importantDates.length > 0 ? [
      ['=== IMPORTANT DATES ==='],
      ...data.importantDates.map(date => [
        date.title || '',
        date.date || '',
        date.category || '',
        date.createdAt || '',
        date.updatedAt || ''
      ])
    ] : []),
    
    // Traditions section
    ...(data.traditions.length > 0 ? [
      ['=== TRADITIONS ==='],
      ...data.traditions.map(tradition => [
        tradition.title || '',
        tradition.description || '',
        tradition.type || '',
        tradition.createdAt || '',
        tradition.updatedAt || ''
      ])
    ] : []),
    
    // Sprints section
    ...(data.sprints.length > 0 ? [
      ['=== SPRINTS ==='],
      ...data.sprints.map(sprint => [
        sprint.id || '',
        sprint.isoWeek || '',
        sprint.year || '',
        sprint.startDate || '',
        sprint.endDate || '',
        sprint.createdAt || '',
        sprint.updatedAt || ''
      ])
    ] : []),
    
    // Roles section
    ...(data.roles.length > 0 ? [
      ['=== ROLES ==='],
      ...data.roles.map(role => [
        role.name || '',
        role.color || ''
      ])
    ] : []),
    
    // Labels section
    ...(data.labels.length > 0 ? [
      ['=== LABELS ==='],
      ...data.labels.map(label => [
        label.name || '',
        label.color || ''
      ])
    ] : []),
    
    // Classes section
    ...(data.classes && data.classes.length > 0 ? [
      ['=== CLASSES ==='],
      ...data.classes.map(cls => [
        cls.title || '',
        cls.classCode || '',
        cls.semester || '',
        cls.year || '',
        cls.creditHours || '',
        cls.classType || '',
        cls.schedule ? JSON.stringify(cls.schedule) : '',
        cls.assignmentIds?.join('; ') || '',
        cls.createdAt || '',
        cls.updatedAt || ''
      ])
    ] : []),
    
    // Assignments section
    ...(data.assignments && data.assignments.length > 0 ? [
      ['=== ASSIGNMENTS ==='],
      ...data.assignments.map(assignment => [
        assignment.classId || '',
        assignment.title || '',
        assignment.type || '',
        assignment.description || '',
        assignment.dueDate || '',
        assignment.dueTime || '',
        assignment.status || '',
        assignment.weight || '',
        assignment.recurrencePattern ? JSON.stringify(assignment.recurrencePattern) : '',
        assignment.storyId || '',
        assignment.createdAt || '',
        assignment.updatedAt || ''
      ])
    ] : [])
  ];
  
  // Create CSV content
  const csvContent = allData.map(row => 
    row.map(cell => {
      if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `life-planner-export_${timestamp}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data to Google Sheets
export const exportToGoogleSheets = async (data: {
  stories: any[];
  sprints: any[];
  goals: any[];
  projects: any[];
  visions: any[];
  bucketlist: any[];
  roles: any[];
  labels: any[];
  importantDates: any[];
  traditions: any[];
  classes?: any[];
  assignments?: any[];
  settings: any;
}): Promise<{ success: boolean; sheetUrl?: string; error?: string }> => {
  try {
    // Check if authenticated
    if (!googleSheetsService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated with Google Sheets' };
    }

    // Prepare data for Google Sheets
    const sheetData = {
      stories: data.stories,
      goals: data.goals,
      projects: data.projects,
      visions: data.visions,
      bucketlist: data.bucketlist,
      importantDates: data.importantDates,
      traditions: data.traditions,
      sprints: data.sprints,
      classes: data.classes || [],
      assignments: data.assignments || [],
      settings: data.settings
    };

    // Save to Google Sheets
    await googleSheetsService.saveAllData(sheetData);

    // Get sheet URL
    const sheetId = googleSheetsService.getSheetId();
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

    return { success: true, sheetUrl };
  } catch (error) {
    console.error('Export to Google Sheets failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Export to a new Google Sheet
export const exportToNewGoogleSheet = async (data: {
  stories: any[];
  sprints: any[];
  goals: any[];
  projects: any[];
  visions: any[];
  bucketlist: any[];
  roles: any[];
  labels: any[];
  importantDates: any[];
  traditions: any[];
  classes?: any[];
  assignments?: any[];
  settings: any;
}): Promise<{ success: boolean; sheetUrl?: string; error?: string }> => {
  try {
    // Check if authenticated
    if (!googleSheetsService.isAuthenticated()) {
      return { success: false, error: 'Not authenticated with Google Sheets' };
    }

    // Create a new spreadsheet
    const response = await (gapi.client as any).sheets.spreadsheets.create({
      resource: {
        properties: {
          title: `Life Planner Export - ${format(new Date(), 'yyyy-MM-dd HH:mm')}`
        }
      }
    });

    const newSheetId = response.result.spreadsheetId;
    if (!newSheetId) {
      return { success: false, error: 'Failed to create new spreadsheet' };
    }

    // Set the new sheet ID
    googleSheetsService.setSheetId(newSheetId);

    // Initialize sheet structure
    await googleSheetsService.initializeSheet();

    // Prepare data for Google Sheets
    const sheetData = {
      stories: data.stories,
      goals: data.goals,
      projects: data.projects,
      visions: data.visions,
      bucketlist: data.bucketlist,
      importantDates: data.importantDates,
      traditions: data.traditions,
      sprints: data.sprints,
      classes: data.classes || [],
      assignments: data.assignments || [],
      settings: data.settings
    };

    // Save to Google Sheets
    await googleSheetsService.saveAllData(sheetData);

    // Get sheet URL
    const sheetUrl = `https://docs.google.com/spreadsheets/d/${newSheetId}`;

    return { success: true, sheetUrl };
  } catch (error) {
    console.error('Export to new Google Sheet failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Sync current data to Google Sheets
export const syncToGoogleSheets = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const result = await syncService.triggerSync();
    return { success: result.success, error: result.errors.join(', ') };
  } catch (error) {
    console.error('Sync to Google Sheets failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Get Google Sheets status
export const getGoogleSheetsStatus = () => {
  return {
    isAuthenticated: googleSheetsService.isAuthenticated(),
    isOnline: syncService.isOnline(),
    syncStatus: syncService.getSyncStatus(),
    connectionState: syncService.getConnectionState()
  };
};
