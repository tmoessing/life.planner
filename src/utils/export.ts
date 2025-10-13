import { format } from 'date-fns';

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
        goal.type || '',
        goal.priority || '',
        goal.status || '',
        goal.targetDate || '',
        goal.storyIds?.join('; ') || '',
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
