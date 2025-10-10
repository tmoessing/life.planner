import { parseISO, isValid } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { Story, Sprint, Priority, Role, Label, Vision, Settings } from '@/types';
import { getCurrentWeek, getWeekDates, createSprintId } from './date';

// Re-export organized utilities
export * from './date';
export * from './color';
export * from './story';
export * from './validation';
export * from './formatting';

// Sprint utilities

export const generateSprints = (weeksAhead: number = 12): Sprint[] => {
  const { isoWeek, year } = getCurrentWeek();
  const sprints: Sprint[] = [];
  
  for (let i = 0; i < weeksAhead; i++) {
    const weekNumber = isoWeek + i;
    const sprintYear = year + Math.floor((weekNumber - 1) / 52);
    const normalizedWeek = ((weekNumber - 1) % 52) + 1;
    
    const { startDate, endDate } = getWeekDates(normalizedWeek, sprintYear);
    
    sprints.push({
      id: createSprintId(normalizedWeek, sprintYear),
      isoWeek: normalizedWeek,
      year: sprintYear,
      startDate,
      endDate
    });
  }
  
  return sprints;
};

// Entity creation utilities

export const createRole = (overrides: Partial<Role> = {}): Role => ({
  id: uuidv4(),
  name: '',
  color: '#3B82F6',
  ...overrides
});

export const createLabel = (overrides: Partial<Label> = {}): Label => ({
  id: uuidv4(),
  name: '',
  color: '#3B82F6',
  ...overrides
});

export const createVision = (overrides: Partial<Vision> = {}): Vision => ({
  id: uuidv4(),
  title: '',
  name: '', // alias for title
  description: '',
  type: 'Intellectual',
  order: 0,
  ...overrides
});

// Default settings
export const getDefaultSettings = (): Settings => ({
  theme: 'system',
  roles: [
    { id: 'disciple', name: 'Disciple of Christ', color: '#8B5CF6' },
    { id: 'individual', name: 'Individual/Development', color: '#3B82F6' },
    { id: 'family', name: 'Family Member', color: '#F59E0B' },
    { id: 'friend', name: 'Friend', color: '#10B981' },
    { id: 'student', name: 'Student', color: '#3B82F6' },
    { id: 'employer', name: 'Employer', color: '#EF4444' },
    { id: 'future-employer', name: 'Future Employer', color: '#8B5CF6' }
  ],
  labels: [
    { id: 'workout', name: 'workout', color: '#EF4444' },
    { id: 'study', name: 'study', color: '#3B82F6' },
    { id: 'family', name: 'family', color: '#F59E0B' },
    { id: 'spiritual', name: 'spiritual', color: '#8B5CF6' }
  ],
  storyTypes: [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' }
  ],
  storySizes: [
    { name: 'XS', color: '#10B981', timeEstimate: '15 min' },
    { name: 'S', color: '#3B82F6', timeEstimate: '30 min' },
    { name: 'M', color: '#F59E0B', timeEstimate: '1 hour' },
    { name: 'L', color: '#EF4444', timeEstimate: '2-4 hours' },
    { name: 'XL', color: '#8B5CF6', timeEstimate: '1+ days' }
  ],
  taskCategories: [
    { name: 'Decisions', color: '#8B5CF6' },
    { name: 'Actions', color: '#10B981' },
    { name: 'Involve Others', color: '#F59E0B' }
  ],
  visionTypes: [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' }
  ],
  goalCategories: [
    { name: 'Target', color: '#3B82F6' },
    { name: 'Lifestyle/Value', color: '#10B981' }
  ],
  goalTypes: [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' },
    { name: 'Financial', color: '#F59E0B' },
    { name: 'Protector', color: '#81E6D9' }
  ],
  goalStatuses: [
    { name: 'Icebox', color: '#6B7280' },
    { name: 'Backlog', color: '#3B82F6' },
    { name: 'To Do', color: '#F59E0B' },
    { name: 'In Progress', color: '#10B981' },
    { name: 'Review', color: '#8B5CF6' },
    { name: 'Done', color: '#22C55E' }
  ],
  bucketlistTypes: [
    { name: 'Location', color: '#3B82F6' },
    { name: 'Experience', color: '#10B981' }
  ],
  bucketlistCategories: [
    { name: 'Adventure', color: '#EF4444' },
    { name: 'Travel', color: '#3B82F6' },
    { name: 'Learning', color: '#8B5CF6' },
    { name: 'Experience', color: '#10B981' },
    { name: 'Achievement', color: '#F59E0B' },
    { name: 'Personal', color: '#EC4899' }
  ],
  countries: [
    'US', 'Canada', 'Mexico', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain', 
    'Japan', 'China', 'India', 'Australia', 'Brazil', 'Argentina', 'Chile', 'Peru',
    'South Africa', 'Egypt', 'Morocco', 'Nigeria', 'Kenya', 'Thailand', 'Vietnam',
    'Indonesia', 'Philippines', 'South Korea', 'Singapore', 'Malaysia', 'New Zealand'
  ],
  usStates: [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
    'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
    'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
    'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
    'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
    'Wisconsin', 'Wyoming'
  ],
  experienceCategories: [
    'Adventure', 'Cultural', 'Educational', 'Entertainment', 'Food & Drink', 'Nature',
    'Sports', 'Wellness', 'Art & Music', 'History', 'Technology', 'Business',
    'Volunteer', 'Spiritual', 'Social', 'Personal Growth'
  ],
  
  // Project types for project settings mirror
  projectTypes: [
    { name: 'Work', color: '#3B82F6' },
    { name: 'Personal', color: '#8B5CF6' },
    { name: 'Learning', color: '#10B981' },
    { name: 'Health', color: '#EF4444' }
  ],
  
  // Tradition types for tradition settings mirror
  traditionTypes: [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#10B981' },
    { name: 'Intellectual', color: '#F59E0B' },
    { name: 'Social', color: '#3B82F6' }
  ],
  
  // Traditional categories for tradition settings mirror
  traditionalCategories: [
    { name: 'Christmas', color: '#EF4444' },
    { name: 'Birthday', color: '#F59E0B' },
    { name: 'New Year', color: '#8B5CF6' },
    { name: 'Easter', color: '#10B981' },
    { name: 'Thanksgiving', color: '#F97316' },
    { name: 'Halloween', color: '#7C3AED' },
    { name: 'Valentine\'s Day', color: '#EC4899' },
    { name: 'Anniversary', color: '#06B6D4' }
  ],
  
  // Important date types for important date settings mirror
  importantDateTypes: [
    { name: 'Birthday', color: '#F59E0B' },
    { name: 'Anniversary', color: '#EC4899' },
    { name: 'Holiday', color: '#EF4444' },
    { name: 'Reminder', color: '#3B82F6' },
    { name: 'Event', color: '#10B981' }
  ],
  priorityColors: {
    'Q1': '#EF4444', // Red for Urgent & Important
    'Q2': '#10B981', // Green for Important, Not Urgent
    'Q3': '#F59E0B', // Yellow for Urgent, Not Important
    'Q4': '#6B7280', // Gray for Not Urgent, Not Important
    'high': '#EF4444',
    'medium': '#F59E0B',
    'low': '#6B7280'
  },
  bucketlistPriorityColors: {
    'high': '#EF4444', // Red for High Priority
    'medium': '#F59E0B', // Yellow for Medium Priority
    'low': '#6B7280'  // Gray for Low Priority
  },
  weightBaseColor: '#3B82F6', // Base color for weight gradient
  roleToTypeMap: {
    'disciple': 'Spiritual',
    'individual': 'Intellectual',
    'family': 'Social',
    'friend': 'Social',
    'student': 'Intellectual',
    'employer': 'Social',
    'future-employer': 'Social'
  },
  statusColors: {
    'icebox': '#6B7280',    // Gray
    'backlog': '#3B82F6',   // Blue
    'todo': '#F59E0B',      // Yellow
    'progress': '#F97316',  // Orange
    'review': '#8B5CF6',    // Purple
    'done': '#10B981'       // Green
  },
  projectStatusColors: {
    'icebox': '#6B7280',
    'backlog': '#3B82F6',
    'to-do': '#F59E0B',
    'in-progress': '#F97316',
    'done': '#10B981'
  },
  roadmapScheduledColor: '#8B5CF6', // Purple for scheduled items
  sizeColors: {
    'XS': '#10B981', // Green
    'S': '#3B82F6',  // Blue
    'M': '#F59E0B',  // Yellow
    'L': '#EF4444',  // Red
    'XL': '#8B5CF6'  // Purple
  },
  chartColors: {
    ideal: '#8884d8', // Purple for ideal line
    actual: '#82ca9d'  // Green for actual line
  },
  
  // UI Customization
  ui: {
    theme: 'system',
    primaryColor: '#3B82F6',
    accentColor: '#8B5CF6',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#1f2937',
    mutedTextColor: '#6b7280',
    borderColor: '#e5e7eb',
    
    fontFamily: 'system',
    fontSize: 'medium',
    fontWeight: 'normal',
    lineHeight: 'normal',
    
    spacing: 'normal',
    borderRadius: 'medium',
    shadowIntensity: 'medium',
    
    header: {
      show: true,
      showTitle: true,
      showNavigation: true,
      showAddButton: true,
      showPlannerButton: true,
      showSettingsButton: true,
      compactMode: false
    },
    
    navigation: {
      show: true,
      showGroupLabels: true,
      showDescriptions: true,
      compactMode: false,
      position: 'top'
    },
    
    addDropdown: {
      show: true,
      showSingleAdd: true,
      showBulkAdd: true,
      showLabels: true,
      compactMode: false
    },
    
    buttons: {
      style: 'default',
      size: 'medium',
      showIcons: true,
      showLabels: true,
      hoverEffects: true,
      clickEffects: true
    },
    
    cards: {
      style: 'default',
      showBorders: true,
      showShadows: true,
      hoverEffects: true,
      compactMode: false
    },
    
    modals: {
      backdrop: 'blur',
      animation: 'slide',
      size: 'medium',
      position: 'center'
    },
    
    forms: {
      inputStyle: 'default',
      showLabels: true,
      showHelpText: true,
      validationStyle: 'inline',
      autoSave: false
    }
  },
  
  // Layout Customization
  layout: {
    containerWidth: 'normal',
    sidebarWidth: 'normal',
    sidebarPosition: 'none',
    
    headerHeight: 'medium',
    headerSticky: true,
    headerTransparent: false,
    
    navigationStyle: 'horizontal',
    navigationPosition: 'top',
    showNavigationLabels: true,
    showNavigationIcons: true,
    
    contentPadding: 'medium',
    contentMaxWidth: 'xl',
    contentCentered: true,
    
    storyGridColumns: 3,
    projectGridColumns: 2,
    goalGridColumns: 2,
    
    mobileLayout: 'stack',
    tabletLayout: 'side-by-side',
    desktopLayout: 'full',
    
    sections: {
      header: true,
      navigation: true,
      content: true,
      footer: false,
      sidebar: false
    },
    
    componentOrder: {
      header: ['title', 'navigation', 'actions'],
      navigation: ['groups'],
      content: ['main'],
      sidebar: []
    }
  },
  
  // Behavior Customization
  behavior: {
    interactions: {
      hoverDelay: 150,
      clickDelay: 0,
      doubleClickDelay: 300,
      dragThreshold: 5,
      scrollSensitivity: 1
    },
    
    animations: {
      enabled: true,
      duration: 'normal',
      easing: 'ease',
      reduceMotion: false
    },
    
    autoSave: {
      enabled: false,
      interval: 30,
      showIndicator: true,
      showNotifications: false
    },
    
    shortcuts: {
      enabled: true,
      showHints: true,
      customShortcuts: {}
    },
    
    data: {
      confirmDeletes: true,
      confirmOverwrites: true,
      autoBackup: false,
      backupInterval: 24,
      maxBackups: 5
    },
    
    navigation: {
      rememberLastView: true,
      showBreadcrumbs: false,
      autoCloseDropdowns: true,
      keyboardNavigation: true
    },
    
    forms: {
      autoFocus: true,
      validateOnBlur: true,
      validateOnChange: false,
      showValidationErrors: true,
      autoComplete: true
    },
    
    modals: {
      closeOnEscape: true,
      closeOnBackdrop: true,
      preventScroll: true,
      restoreFocus: true
    }
  },
  
  // Accessibility Customization
  accessibility: {
    visual: {
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      colorBlindFriendly: false,
      focusIndicators: true
    },
    
    motor: {
      largeTouchTargets: false,
      reducedPrecisionRequired: false,
      voiceControl: false,
      switchControl: false
    },
    
    cognitive: {
      simplifiedInterface: false,
      clearLabels: true,
      progressIndicators: true,
      errorPrevention: true,
      helpText: true
    },
    
    screenReader: {
      announceChanges: true,
      describeImages: true,
      skipLinks: true,
      landmarks: true
    },
    
    keyboard: {
      tabOrder: 'logical',
      focusTrapping: true,
      escapeHandling: true,
      arrowKeyNavigation: true
    }
  }
});

// Description template generation
export const generateDescription = (
  role?: Role,
  vision?: Vision,
  customText?: string
): string => {
  if (customText) return customText;
  
  const roleName = role?.name || 'person';
  const visionText = vision ? ` so that I fulfill (${vision.title})` : '';
  
  return `As a ${roleName} I need to <...>${visionText}`;
};

// Filter utilities
export const parseFilterKeywords = (keywords: string): Record<string, string[]> => {
  const filters: Record<string, string[]> = {};
  
  if (!keywords.trim()) return filters;
  
  const parts = keywords.split(/\s+/);
  
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value) {
      const values = value.split(',').map(v => v.trim());
      filters[key] = values;
    }
  }
  
  return filters;
};

// Story filtering
export const filterStories = (
  stories: Story[],
  text: string,
  keywords: string,
  dueSoon: boolean,
  roles: Role[],
  labels: Label[],
  // visions: Vision[]
): Story[] => {
  let filtered = stories.filter(story => !story.deleted);
  
  // Text search
  if (text.trim()) {
    const searchText = text.toLowerCase();
    filtered = filtered.filter(story => 
      story.title.toLowerCase().includes(searchText) ||
      story.description.toLowerCase().includes(searchText)
    );
  }
  
  // Keyword filters
  const keywordFilters = parseFilterKeywords(keywords);
  
  for (const [key, values] of Object.entries(keywordFilters)) {
    filtered = filtered.filter(story => {
      switch (key) {
        case 'weight':
          return values.includes(story.weight.toString());
        case 'size':
          return values.includes(story.size);
        case 'priority':
          return values.includes(story.priority);
        case 'type':
          return values.includes(story.type);
        case 'role':
          const role = roles.find(r => r.id === story.roleId);
          return role && values.includes(role.name.toLowerCase());
        case 'label':
          return story.labels.some(labelId => {
            const label = labels.find(l => l.id === labelId);
            return label && values.includes(label.name.toLowerCase());
          });
        case 'sprint':
          if (values.includes('current')) {
            // Logic for current sprint
            return true; // Placeholder
          }
          return true; // Placeholder
        default:
          return true;
      }
    });
  }
  
  // Due soon filter
  if (dueSoon) {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    filtered = filtered.filter(story => {
      if (!story.dueDate) return false;
      const dueDate = parseISO(story.dueDate);
      return isValid(dueDate) && dueDate <= sevenDaysFromNow;
    });
  }
  
  return filtered;
};

// Local storage utilities
export const saveToLocalStorage = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    return defaultValue;
  }
};

// Story storage helpers
export const loadStories = (): any[] => {
  try {
    const stories = localStorage.getItem('life-scrum-stories');
    return stories ? JSON.parse(stories) : [];
  } catch (error) {
    return [];
  }
};

export const saveStories = (stories: any[]): void => {
  try {
    localStorage.setItem('life-scrum-stories', JSON.stringify(stories));
  } catch (error) {
  }
};

// Backup and restore utilities
export const exportAllData = (data: any) => {
  // Filter out deleted stories for export
  const activeStories = data.stories ? data.stories.filter((story: any) => !story.deleted) : [];
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    stories: activeStories,
    sprints: data.sprints || [],
    goals: data.goals || [],
    projects: data.projects || [],
    roles: data.roles || [],
    visions: data.visions || [],
    bucketlist: data.bucketlist || [],
    importantDates: data.importantDates || [],
    traditions: data.traditions || [],
    columns: data.columns || [],
    boards: data.boards || [],
    settings: data.settings || {}
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `backup-${timestamp}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Legacy function for backward compatibility
export const exportStories = (stories: any[]) => {
  const activeStories = stories.filter(story => !story.deleted);
  exportAllData({ stories: activeStories });
};

export const importAllData = (file: File): Promise<{ data: any, mode: 'overwrite' | 'merge' }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Handle different import formats
        if (Array.isArray(data)) {
          // Legacy format: Direct array of stories
          resolve({ 
            data: { stories: data }, 
            mode: 'overwrite' 
          });
        } else if (data.stories && Array.isArray(data.stories)) {
          // Full backup format: Object with all data
          resolve({ 
            data: {
              stories: data.stories || [],
              sprints: data.sprints || [],
              goals: data.goals || [],
              projects: data.projects || [],
              roles: data.roles || [],
              visions: data.visions || [],
              bucketlist: data.bucketlist || [],
              importantDates: data.importantDates || [],
              traditions: data.traditions || [],
              columns: data.columns || [],
              boards: data.boards || [],
              settings: data.settings || {}
            }, 
            mode: 'overwrite' 
          });
        } else {
          throw new Error('Invalid file format. Expected array of stories or full backup object.');
        }
      } catch (error) {
        reject(new Error('Invalid JSON file or unsupported format.'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file.'));
    };
    
    reader.readAsText(file);
  });
};

// Legacy function for backward compatibility
export const importStories = (file: File): Promise<{ stories: any[], mode: 'overwrite' | 'merge' }> => {
  return importAllData(file).then(result => ({
    stories: result.data.stories || [],
    mode: result.mode
  }));
};

export const createBackupBeforeImport = (): void => {
  const currentStories = loadStories();
  const activeStories = currentStories.filter(story => !story.deleted);
  if (activeStories.length > 0) {
    exportStories(activeStories);
  }
};

// Export/Import utilities
export const exportData = (data: any): string => {
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
};

// Brain level mapping for Planner
export const getBrainLevelWeights = (level: 'low' | 'moderate' | 'high'): number[] => {
  switch (level) {
    case 'low':
      return [1, 3];
    case 'moderate':
      return [5, 8];
    case 'high':
      return [8, 13, 21];
    default:
      return [1, 3, 5, 8, 13, 21];
  }
};

// Brain level mapping for Planner
