import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type {
  Role,
  Label,
  Vision,
  BucketlistItem,
  ImportantDate,
  Tradition,
  Settings,
  TraditionTypeConfig
} from '@/types';
import {
  createRole,
  createLabel,
  createVision
} from '@/utils';

// Core settings atoms - using string literals to avoid circular dependency
export const visionsAtom = atomWithStorage<Vision[]>('life-scrum-visions', []);
export const bucketlistAtom = atomWithStorage<BucketlistItem[]>('life-scrum-bucketlist', []);
export const importantDatesAtom = atomWithStorage<ImportantDate[]>('life-scrum-important-dates', []);
export const traditionsAtom = atomWithStorage<Tradition[]>('life-scrum-traditions', []);

// Settings atom with migration
const migrateSettings = (settings: any): Settings => {
  // If priorityColors is missing, add it
  if (!settings.priorityColors) {
    settings.priorityColors = {
      'Q1': '#EF4444', // Red for Urgent & Important
      'Q2': '#10B981', // Green for Important, Not Urgent
      'Q3': '#F59E0B', // Yellow for Urgent, Not Important
      'Q4': '#6B7280', // Gray for Not Urgent, Not Important
      'high': '#EF4444',
      'medium': '#F59E0B',
      'low': '#6B7280'
    };
  }

  // If projectPriorityColors is missing, add it
  if (!settings.projectPriorityColors) {
    settings.projectPriorityColors = {
      'high': '#EF4444',
      'medium': '#F59E0B',
      'low': '#6B7280'
    };
  }

  // If assignmentWeightBaseColor is missing, default to weightBaseColor or blue
  if (!settings.assignmentWeightBaseColor) {
    settings.assignmentWeightBaseColor = settings.weightBaseColor || '#3B82F6';
  }

  // If bucketlistCategories is missing, add default categories
  if (!settings.bucketlistCategories || settings.bucketlistCategories.length === 0) {
    settings.bucketlistCategories = [
      { name: 'Adventure', color: '#EF4444' },
      { name: 'Travel', color: '#3B82F6' },
      { name: 'Learning', color: '#8B5CF6' },
      { name: 'Experience', color: '#10B981' },
      { name: 'Achievement', color: '#F59E0B' },
      { name: 'Personal', color: '#EC4899' }
    ];
  }

  // If projectTypes is missing, add default project types
  if (!settings.projectTypes || settings.projectTypes.length === 0) {
    settings.projectTypes = [
      { name: 'Code', color: '#3B82F6' },
      { name: 'Organization', color: '#8B5CF6' },
      { name: 'Creative', color: '#10B981' },
      { name: 'Work', color: '#EF4444' },
      { name: 'Personal', color: '#F59E0B' },
      { name: 'Learning', color: '#8B5CF6' },
      { name: 'Health', color: '#22C55E' }
    ];
  }

  // If projectSizes is missing, add default project sizes
  if (!settings.projectSizes || settings.projectSizes.length === 0) {
    settings.projectSizes = [
      { name: 'XS', color: '#10B981' },
      { name: 'S', color: '#3B82F6' },
      { name: 'M', color: '#F59E0B' },
      { name: 'L', color: '#EF4444' },
      { name: 'XL', color: '#8B5CF6' }
    ];
  }

  // If rules is missing, add it
  if (!settings.rules) {
    settings.rules = [];
  }

  return settings as Settings;
};

// Migration function to move data from separate atoms to settingsAtom
const migrateLegacyData = (): { roles: Role[], labels: Label[] } => {
  let roles: Role[] = [];
  let labels: Label[] = [];

  try {
    // Check for existing roles data
    const existingRoles = localStorage.getItem('life-scrum-roles');
    if (existingRoles) {
      roles = JSON.parse(existingRoles);
      // Remove the old key after migration
      localStorage.removeItem('life-scrum-roles');
    }

    // Check for existing labels data
    const existingLabels = localStorage.getItem('life-scrum-labels');
    if (existingLabels) {
      labels = JSON.parse(existingLabels);
      // Remove the old key after migration
      localStorage.removeItem('life-scrum-labels');
    }
  } catch (error) {
    console.warn('Error migrating legacy data:', error);
  }

  return { roles, labels };
};

// Default settings to avoid circular dependency
const getDefaultSettings = (): Settings => {
  // Migrate existing data from separate atoms
  const { roles: migratedRoles, labels: migratedLabels } = migrateLegacyData();

  return {
    theme: 'system',
    roles: migratedRoles.length > 0 ? migratedRoles : [
      { id: 'disciple', name: 'Disciple of Christ', color: '#8B5CF6' },
      { id: 'individual', name: 'Individual/Development', color: '#3B82F6' },
      { id: 'family', name: 'Family Member', color: '#F59E0B' },
      { id: 'friend', name: 'Friend', color: '#10B981' },
      { id: 'student', name: 'Student', color: '#3B82F6' },
      { id: 'employer', name: 'Employer', color: '#EF4444' },
      { id: 'future-employer', name: 'Future Employer', color: '#8B5CF6' }
    ],
    labels: migratedLabels.length > 0 ? migratedLabels : [
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
      { name: 'Involve Others', color: '#F59E0B' },
      { name: 'Buying', color: '#EF4444' },
      { name: 'Travel', color: '#3B82F6' }
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
      'United States', 'Canada', 'Mexico', 'United Kingdom', 'France', 'Germany', 'Italy', 'Spain',
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
    projectTypes: [
      { name: 'Code', color: '#3B82F6' },
      { name: 'Organization', color: '#8B5CF6' },
      { name: 'Creative', color: '#10B981' },
      { name: 'Work', color: '#EF4444' },
      { name: 'Personal', color: '#F59E0B' },
      { name: 'Learning', color: '#8B5CF6' },
      { name: 'Health', color: '#22C55E' }
    ],
    projectSizes: [
      { name: 'XS', color: '#10B981' }, // Green - Very small projects
      { name: 'S', color: '#3B82F6' },  // Blue - Small projects
      { name: 'M', color: '#F59E0B' },  // Yellow - Medium projects
      { name: 'L', color: '#EF4444' },  // Red - Large projects
      { name: 'XL', color: '#8B5CF6' }  // Purple - Extra large projects
    ],
    traditionTypes: [
      { name: 'Spiritual', color: '#8B5CF6' },
      { name: 'Physical', color: '#10B981' },
      { name: 'Intellectual', color: '#F59E0B' },
      { name: 'Social', color: '#3B82F6' }
    ],
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
    importantDateTypes: [
      { name: 'School', color: '#3B82F6' },  // Blue
      { name: 'Work', color: '#EF4444' },    // Red
      { name: 'Other', color: '#6B7280' }    // Gray
    ],
    priorityColors: {
      'Q1': '#EF4444',
      'Q2': '#10B981',
      'Q3': '#F59E0B',
      'Q4': '#6B7280',
      'high': '#EF4444',
      'medium': '#F59E0B',
      'low': '#6B7280'
    },
    bucketlistPriorityColors: {
      'high': '#EF4444',
      'medium': '#F59E0B',
      'low': '#6B7280'
    },
    projectPriorityColors: {
      'high': '#EF4444',
      'medium': '#F59E0B',
      'low': '#6B7280'
    },
    weightBaseColor: '#3B82F6',
    assignmentWeightBaseColor: '#3B82F6', // Default to same as story weights, but can be customized
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
      'icebox': '#6B7280',
      'backlog': '#3B82F6',
      'todo': '#F59E0B',
      'progress': '#F97316',
      'review': '#8B5CF6',
      'done': '#10B981'
    },
    roadmapScheduledColor: '#8B5CF6',
    sizeColors: {
      'XS': '#10B981',
      'S': '#3B82F6',
      'M': '#F59E0B',
      'L': '#EF4444',
      'XL': '#8B5CF6'
    },
    chartColors: {
      ideal: '#8884d8',
      actual: '#82ca9d'
    },
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
        sidebar: false,
        classes: true
      },
      componentOrder: {
        header: ['title', 'navigation', 'actions'],
        navigation: ['groups'],
        content: ['main'],
        sidebar: []
      }
    },
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
    },
    rules: []
  };
};

// Base settings atom
const baseSettingsAtom = atomWithStorage<Settings>('life-scrum-settings', getDefaultSettings());

// Settings atom with migration
export const settingsAtom = atom(
  (get) => {
    const settings = get(baseSettingsAtom);
    return migrateSettings(settings);
  },
  (_, set, newSettings: Settings) => {
    set(baseSettingsAtom, newSettings);
  }
);

// Derived atoms for backward compatibility - these read/write from settingsAtom
export const rolesAtom = atom(
  (get) => get(settingsAtom).roles,
  (get, set, newRoles: Role[]) => {
    const settings = get(settingsAtom);
    set(settingsAtom, { ...settings, roles: newRoles });
  }
);

export const labelsAtom = atom(
  (get) => get(settingsAtom).labels,
  (get, set, newLabels: Label[]) => {
    const settings = get(settingsAtom);
    set(settingsAtom, { ...settings, labels: newLabels });
  }
);

// Role management atoms
export const addRoleAtom = atom(
  null,
  (get, set, name: string, color: string) => {
    const newRole = createRole({ name, color });
    const settings = get(settingsAtom);
    set(settingsAtom, { ...settings, roles: [...settings.roles, newRole] });
    return newRole;
  }
);

export const updateRoleAtom = atom(
  null,
  (get, set, roleId: string, name: string, color: string) => {
    const settings = get(settingsAtom);
    const updatedRoles = settings.roles.map(role =>
      role.id === roleId ? { ...role, name, color } : role
    );
    set(settingsAtom, { ...settings, roles: updatedRoles });
  }
);

export const deleteRoleAtom = atom(
  null,
  (get, set, roleId: string) => {
    const settings = get(settingsAtom);
    const updatedRoles = settings.roles.filter(role => role.id !== roleId);
    set(settingsAtom, { ...settings, roles: updatedRoles });
  }
);

// Label management atoms
export const addLabelAtom = atom(
  null,
  (get, set, name: string, color: string) => {
    const newLabel = createLabel({ name, color });
    const settings = get(settingsAtom);
    set(settingsAtom, { ...settings, labels: [...settings.labels, newLabel] });
    return newLabel;
  }
);

export const updateLabelAtom = atom(
  null,
  (get, set, labelId: string, name: string, color: string) => {
    const settings = get(settingsAtom);
    const updatedLabels = settings.labels.map(label =>
      label.id === labelId ? { ...label, name, color } : label
    );
    set(settingsAtom, { ...settings, labels: updatedLabels });
  }
);

export const deleteLabelAtom = atom(
  null,
  (get, set, labelId: string) => {
    const settings = get(settingsAtom);
    const updatedLabels = settings.labels.filter(label => label.id !== labelId);
    set(settingsAtom, { ...settings, labels: updatedLabels });
  }
);

// Vision management atoms
export const addVisionAtom = atom(
  null,
  (get, set, visionData: Partial<Vision>) => {
    const newVision = createVision(visionData);
    const currentVisions = get(visionsAtom);
    set(visionsAtom, [...currentVisions, newVision]);
    return newVision;
  }
);

export const updateVisionAtom = atom(
  null,
  (get, set, visionId: string, updates: Partial<Vision>) => {
    const visions = get(visionsAtom);
    const updatedVisions = visions.map(vision =>
      vision.id === visionId ? { ...vision, ...updates } : vision
    );
    set(visionsAtom, updatedVisions);
  }
);

export const deleteVisionAtom = atom(
  null,
  (get, set, visionId: string) => {
    const visions = get(visionsAtom);
    const updatedVisions = visions.filter(vision => vision.id !== visionId);
    set(visionsAtom, updatedVisions);
  }
);

export const reorderVisionsAtom = atom(
  null,
  (get, set, visionIds: string[]) => {
    const visions = get(visionsAtom);
    const reorderedVisions = visionIds.map((id, index) => {
      const vision = visions.find(v => v.id === id);
      return vision ? { ...vision, order: index } : null;
    }).filter((vision): vision is Vision => vision !== null);

    set(visionsAtom, reorderedVisions);
  }
);

// Bucketlist management atoms
export const addBucketlistItemAtom = atom(
  null,
  (get, set, itemData: Partial<BucketlistItem>) => {
    const newItem: BucketlistItem = {
      id: `bucketlist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: itemData.title || '',
      description: itemData.description,
      completed: itemData.completed || false,
      completedAt: itemData.completedAt,
      category: itemData.category,
      priority: itemData.priority || 'Q2',
      bucketlistType: itemData.bucketlistType || 'experience',
      status: itemData.status,
      roleId: itemData.roleId,
      visionId: itemData.visionId,
      dueDate: itemData.dueDate,
      order: itemData.order,
      // Location fields
      country: itemData.country,
      state: itemData.state,
      city: itemData.city,
      // Experience fields
      experienceCategory: itemData.experienceCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentItems = get(bucketlistAtom);
    set(bucketlistAtom, [...currentItems, newItem]);
    return newItem;
  }
);

export const updateBucketlistItemAtom = atom(
  null,
  (get, set, itemId: string, updates: Partial<BucketlistItem>) => {
    const items = get(bucketlistAtom);
    const updatedItems = items.map(item =>
      item.id === itemId ? {
        ...item,
        ...updates,
        updatedAt: new Date().toISOString(),
        completedAt: updates.completed ? new Date().toISOString() : item.completedAt
      } : item
    );
    set(bucketlistAtom, updatedItems);
  }
);

export const deleteBucketlistItemAtom = atom(
  null,
  (get, set, itemId: string) => {
    const items = get(bucketlistAtom);
    const updatedItems = items.filter(item => item.id !== itemId);
    set(bucketlistAtom, updatedItems);
  }
);

// Bulk delete atoms
export const deleteAllVisionsAtom = atom(
  null,
  (_get, set) => {
    set(visionsAtom, []);
  }
);

export const deleteAllBucketlistAtom = atom(
  null,
  (_get, set) => {
    set(bucketlistAtom, []);
  }
);

// Tradition Types Management
export const traditionTypesAtom = atomWithStorage<TraditionTypeConfig[]>('life-scrum-tradition-types', [
  { id: '1', name: 'Spiritual', color: '#8B5CF6' },
  { id: '2', name: 'Physical', color: '#10B981' },
  { id: '3', name: 'Intellectual', color: '#F59E0B' },
  { id: '4', name: 'Social', color: '#3B82F6' }
]);

// Traditional Categories Management  
export const traditionalCategoriesAtom = atomWithStorage<TraditionTypeConfig[]>('life-scrum-traditional-categories', [
  { id: '1', name: 'Christmas', color: '#EF4444' },
  { id: '2', name: 'Birthday', color: '#F59E0B' },
  { id: '3', name: 'New Year', color: '#8B5CF6' },
  { id: '4', name: 'Easter', color: '#10B981' },
  { id: '5', name: 'Thanksgiving', color: '#F97316' },
  { id: '6', name: 'Halloween', color: '#7C3AED' },
  { id: '7', name: 'Valentine\'s Day', color: '#EC4899' },
  { id: '8', name: 'Anniversary', color: '#06B6D4' }
]);

export const addTraditionTypeAtom = atom(
  null,
  (get, set, name: string, color: string) => {
    const currentTypes = get(traditionTypesAtom);
    const newType: TraditionTypeConfig = {
      id: `tradition-type-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color
    };
    set(traditionTypesAtom, [...currentTypes, newType]);
  }
);

export const updateTraditionTypeAtom = atom(
  null,
  (get, set, id: string, name: string, color: string) => {
    const currentTypes = get(traditionTypesAtom);
    set(traditionTypesAtom, currentTypes.map(type =>
      type.id === id ? { ...type, name, color } : type
    ));
  }
);

export const deleteTraditionTypeAtom = atom(
  null,
  (get, set, id: string) => {
    const currentTypes = get(traditionTypesAtom);
    set(traditionTypesAtom, currentTypes.filter(type => type.id !== id));
  }
);

// Traditional Categories Management Atoms
export const addTraditionalCategoryAtom = atom(
  null,
  (get, set, name: string, color: string) => {
    const currentCategories = get(traditionalCategoriesAtom);
    const newCategory: TraditionTypeConfig = {
      id: `traditional-category-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      color
    };
    set(traditionalCategoriesAtom, [...currentCategories, newCategory]);
  }
);

export const updateTraditionalCategoryAtom = atom(
  null,
  (get, set, id: string, name: string, color: string) => {
    const currentCategories = get(traditionalCategoriesAtom);
    set(traditionalCategoriesAtom, currentCategories.map(category =>
      category.id === id ? { ...category, name, color } : category
    ));
  }
);

export const deleteTraditionalCategoryAtom = atom(
  null,
  (get, set, id: string) => {
    const currentCategories = get(traditionalCategoriesAtom);
    set(traditionalCategoriesAtom, currentCategories.filter(category => category.id !== id));
  }
);
