import { useAtom } from 'jotai';
import { settingsAtom } from '@/stores/settingsStore';
import { bucketlistStatusesAtom, storyStatusesAtom } from '@/stores/statusStore';
import type { Settings, Priority, StoryType } from '@/types';

/**
 * Settings Mirror System - Single Source of Truth
 * 
 * This system ensures that all components use settings as their source of truth
 * instead of hardcoded values. When settings change, all components automatically
 * reflect those changes.
 */

// ============================================================================
// STORY SETTINGS MIRROR
// ============================================================================

export const useStorySettings = () => {
  const [settings] = useAtom(settingsAtom);
  
  return {
    // Status colors from settings
    statusColors: settings.statusColors,
    
    // Priority colors from settings  
    priorityColors: settings.priorityColors,
    
    // Type colors from settings
    typeColors: settings.storyTypes.reduce((acc, type) => {
      acc[type.name] = type.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Size colors from settings
    sizeColors: settings.storySizes.reduce((acc, size) => {
      acc[size.name] = size.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Task category colors from settings
    taskCategoryColors: settings.taskCategories.reduce((acc, category) => {
      acc[category.name] = category.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Weight base color from settings
    weightBaseColor: settings.weightBaseColor,
    
    // Roadmap scheduled color from settings
    roadmapScheduledColor: settings.roadmapScheduledColor,
    
    // Chart colors from settings
    chartColors: {
      ideal: settings.chartColors?.ideal || '#8884d8',
      actual: settings.chartColors?.actual || '#82ca9d'
    },
    
    // Labels from settings
    labels: settings.labels,
    
    // Roles from settings
    roles: settings.roles,
    
    // Vision types from settings
    visionTypes: settings.visionTypes,
    
    // Story types from settings
    storyTypes: settings.storyTypes,
    
    // Story sizes from settings
    storySizes: settings.storySizes,
    
    // Task categories from settings
    taskCategories: settings.taskCategories,
    
    // Get color for specific attributes
    getStatusColor: (status: string) => settings.statusColors[status] || '#6B7280',
    getPriorityColor: (priority: Priority) => settings.priorityColors[priority] || '#6B7280',
    getTypeColor: (type: string) => {
      const storyType = settings.storyTypes.find(t => t.name === type);
      return storyType?.color || '#6B7280';
    },
    getSizeColor: (size: string) => {
      const storySize = settings.storySizes.find(s => s.name === size);
      return storySize?.color || '#6B7280';
    },
    getTaskCategoryColor: (category: string) => {
      const taskCategory = settings.taskCategories.find(c => c.name === category);
      return taskCategory?.color || '#6B7280';
    },
    
    getVisionTypeColor: (type: string) => {
      const visionType = settings.visionTypes.find(vt => vt.name === type);
      return visionType?.color || '#6B7280';
    }
  };
};

// ============================================================================
// GOAL SETTINGS MIRROR
// ============================================================================

export const useGoalSettings = () => {
  const [settings] = useAtom(settingsAtom);
  
  return {
    // Status colors for goals - use goal statuses from settings
    statusColors: settings.goalStatuses?.reduce((acc, status) => {
      const statusId = status.name.toLowerCase().replace(' ', '-');
      acc[statusId] = status.color;
      return acc;
    }, {} as Record<string, string>) || {
      'icebox': '#6B7280',
      'backlog': '#3B82F6',
      'todo': '#F59E0B',
      'in-progress': '#10B981',
      'review': '#8B5CF6',
      'done': '#22C55E'
    },
    
    // Goal statuses from settings
    goalStatuses: settings.goalStatuses || [
      { name: 'Icebox', color: '#6B7280' },
      { name: 'Backlog', color: '#3B82F6' },
      { name: 'To Do', color: '#F59E0B' },
      { name: 'In Progress', color: '#10B981' },
      { name: 'Review', color: '#8B5CF6' },
      { name: 'Done', color: '#22C55E' }
    ],
    
    // Priority colors for goals
    priorityColors: {
      'high': settings.bucketlistPriorityColors?.high || '#EF4444',
      'medium': settings.bucketlistPriorityColors?.medium || '#F97316', 
      'low': settings.bucketlistPriorityColors?.low || '#6B7280'
    },
    
    // Goal types from settings
    goalTypes: settings.goalTypes,
    
    // Goal categories from settings
    goalCategories: settings.goalCategories,
    
    // Type colors from settings
    typeColors: settings.goalTypes.reduce((acc, type) => {
      acc[type.name] = type.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Category colors from settings
    categoryColors: settings.goalCategories.reduce((acc, category) => {
      acc[category.name] = category.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Weight base color from settings
    weightBaseColor: settings.weightBaseColor,
    
    // Get weight gradient color (for goal complexity/importance)
    getWeightGradientColor: (weight: number, maxValue: number = 10) => {
      // Import dynamically
      return settings.weightBaseColor;
    },
    
    // Get color for specific attributes
    getStatusColor: (status: string) => {
      // Use goal statuses from settings
      const goalStatus = settings.goalStatuses?.find(s => s.name.toLowerCase().replace(' ', '-') === status);
      return goalStatus?.color || settings.statusColors?.[status] || '#6B7280';
    },
    
    getPriorityColor: (priority: string) => {
      const priorityMap: Record<string, string> = {
        'high': settings.bucketlistPriorityColors?.high || '#EF4444',
        'medium': settings.bucketlistPriorityColors?.medium || '#F97316',
        'low': settings.bucketlistPriorityColors?.low || '#6B7280'
      };
      return priorityMap[priority] || '#6B7280';
    },
    getTypeColor: (type: string) => {
      const goalType = settings.goalTypes.find(t => t.name === type);
      return goalType?.color || '#6B7280';
    },
    getCategoryColor: (category: string) => {
      const goalCategory = settings.goalCategories.find(c => c.name === category);
      return goalCategory?.color || '#6B7280';
    }
  };
};

// ============================================================================
// BUCKETLIST SETTINGS MIRROR
// ============================================================================

export const useBucketlistSettings = () => {
  const [settings] = useAtom(settingsAtom);
  const [bucketlistStatuses] = useAtom(bucketlistStatusesAtom);
  
  return {
    // Status colors for bucketlist - use bucketlistStatusesAtom as source of truth
    statusColors: bucketlistStatuses.reduce((acc, status) => {
      acc[status.id] = status.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Priority colors for bucketlist
    priorityColors: {
      'high': settings.bucketlistPriorityColors?.high || '#EF4444',
      'medium': settings.bucketlistPriorityColors?.medium || '#F97316',
      'low': settings.bucketlistPriorityColors?.low || '#6B7280'
    },
    
    // Type colors from settings
    typeColors: (settings.bucketlistTypes || []).reduce((acc, type) => {
      acc[type.name] = type.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Category colors from settings
    categoryColors: (settings.bucketlistCategories || []).reduce((acc, category) => {
      acc[category.name] = category.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Experience category colors (using experience categories from settings)
    experienceCategoryColors: (settings.experienceCategories || []).reduce((acc, category) => {
      acc[category] = '#8B5CF6'; // Default color for experience categories
      return acc;
    }, {} as Record<string, string>),
    
    // Country colors (using countries from settings)
    countryColors: (settings.countries || []).reduce((acc, country) => {
      acc[country] = '#3B82F6'; // Default color for countries
      return acc;
    }, {} as Record<string, string>),
    
    // State colors (using US states from settings)
    stateColors: (settings.usStates || []).reduce((acc, state) => {
      acc[state] = '#10B981'; // Default color for states
      return acc;
    }, {} as Record<string, string>),
    
    // Bucketlist types from settings
    bucketlistTypes: settings.bucketlistTypes,
    
    // Bucketlist categories from settings
    bucketlistCategories: settings.bucketlistCategories,
    
    // Countries from settings
    countries: settings.countries,
    
    // US states from settings
    usStates: settings.usStates,
    
    // Experience categories from settings
    experienceCategories: settings.experienceCategories,
    
    // Roles from settings
    roles: settings.roles,
    
    // Get color for specific attributes
    getStatusColor: (status: string) => {
      const bucketlistStatus = bucketlistStatuses.find(s => s.id === status);
      return bucketlistStatus?.color || '#6B7280';
    },
    getPriorityColor: (priority: string) => {
      const priorityColors = settings.bucketlistPriorityColors || {
        'high': '#EF4444',
        'medium': '#F59E0B',
        'low': '#6B7280'
      };
      return priorityColors[priority] || '#6B7280';
    },
    getTypeColor: (type: string) => {
      const bucketlistType = (settings.bucketlistTypes || []).find(t => t.name === type);
      return bucketlistType?.color || '#6B7280';
    },
    
    getCategoryColor: (category: string) => {
      const bucketlistCategory = (settings.bucketlistCategories || []).find(c => c.name === category);
      return bucketlistCategory?.color || '#6B7280';
    },
    
    getExperienceCategoryColor: (category: string) => {
      // Use experience categories from settings with default color
      return (settings.experienceCategories || []).includes(category) ? '#8B5CF6' : '#6B7280';
    },
    
    getCountryColor: (country: string) => {
      // Use countries from settings with default color
      return (settings.countries || []).includes(country) ? '#3B82F6' : '#6B7280';
    },
    
    getStateColor: (state: string) => {
      // Use US states from settings with default color
      return (settings.usStates || []).includes(state) ? '#10B981' : '#6B7280';
    },
    
    getCityColor: (city: string) => {
      // Default color for cities (could be enhanced with city settings)
      return '#8B5CF6';
    },
    
    // Get bucketlist type color (location vs experience)
    getBucketlistTypeColor: (bucketlistType: 'location' | 'experience') => {
      const typeMap: Record<string, string> = {
        'location': '#3B82F6',   // Blue for location
        'experience': '#8B5CF6'   // Purple for experience
      };
      return typeMap[bucketlistType] || '#6B7280';
    }
  };
};

// ============================================================================
// PROJECT SETTINGS MIRROR
// ============================================================================

export const useProjectSettings = () => {
  const [settings] = useAtom(settingsAtom);
  const [storyStatuses] = useAtom(storyStatusesAtom);
  
  // Create a map of story status IDs to colors from storyStatusesAtom
  const storyStatusColorMap = storyStatuses.reduce((acc, status) => {
    acc[status.id] = status.color;
    return acc;
  }, {} as Record<string, string>);
  
  // Map project status IDs to story status IDs
  const projectToStoryStatusMap: Record<string, string> = {
    'icebox': 'icebox',
    'backlog': 'backlog',
    'to-do': 'todo',
    'in-progress': 'progress',
    'done': 'done',
    // Handle actual project status values
    'Icebox': 'icebox',
    'Backlog': 'backlog',
    'To do': 'todo',
    'In Progress': 'progress',
    'Done': 'done'
  };
  
  return {
    // Status colors for projects - using story status colors from storyStatusesAtom
    statusColors: {
      'icebox': storyStatusColorMap['icebox'] || '#6B7280',
      'backlog': storyStatusColorMap['backlog'] || '#3B82F6',
      'to-do': storyStatusColorMap['todo'] || '#F59E0B',
      'in-progress': storyStatusColorMap['progress'] || '#F97316',
      'done': storyStatusColorMap['done'] || '#10B981'
    },
    
    // Priority colors for projects
    priorityColors: {
      'high': settings.projectPriorityColors?.high || '#EF4444',
      'medium': settings.projectPriorityColors?.medium || '#F59E0B',
      'low': settings.projectPriorityColors?.low || '#6B7280'
    },
    
    // Project types from settings
    projectTypes: settings.projectTypes || [],
    
    // Project sizes from settings
    projectSizes: settings.projectSizes || [],
    
    // Type colors from settings
    typeColors: (settings.projectTypes || []).reduce((acc, type) => {
      acc[type.name] = type.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Size colors from settings
    sizeColors: (settings.projectSizes || []).reduce((acc, size) => {
      acc[size.name] = size.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Roles from settings
    roles: settings.roles,
    
    // Get color for specific attributes - using story status colors from storyStatusesAtom
    getStatusColor: (status: string) => {
      const storyStatusId = projectToStoryStatusMap[status];
      if (storyStatusId && storyStatusColorMap[storyStatusId]) {
        return storyStatusColorMap[storyStatusId];
      }
      // Fallback to settings.statusColors if story status not found
      return settings.statusColors?.[storyStatusId || status] || '#6B7280';
    },
    getPriorityColor: (priority: string) => {
      const priorityMap: Record<string, string> = {
        'high': settings.bucketlistPriorityColors?.high || '#EF4444',
        'medium': settings.bucketlistPriorityColors?.medium || '#F97316',
        'low': settings.bucketlistPriorityColors?.low || '#6B7280'
      };
      return priorityMap[priority] || '#6B7280';
    },
    getTypeColor: (type: string) => {
      const projectType = (settings.projectTypes || []).find(t => t.name === type);
      return projectType?.color || '#6B7280';
    },
    getSizeColor: (size: string) => {
      const projectSize = (settings.projectSizes || []).find(s => s.name === size);
      return projectSize?.color || '#6B7280';
    }
  };
};

// ============================================================================
// TRADITION SETTINGS MIRROR
// ============================================================================

export const useTraditionSettings = () => {
  const [settings] = useAtom(settingsAtom);
  
  return {
    // Tradition types from settings
    traditionTypes: settings.traditionTypes,
    
    // Traditional categories from settings
    traditionalCategories: settings.traditionalCategories,
    
    // Tradition type colors from settings
    traditionTypeColors: settings.traditionTypes.reduce((acc, type) => {
      acc[type.name] = type.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Traditional category colors from settings
    traditionalCategoryColors: settings.traditionalCategories.reduce((acc, category) => {
      acc[category.name] = category.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Helper methods
    getTraditionTypeColor: (type: string) => {
      const traditionType = settings.traditionTypes.find(t => t.name === type);
      return traditionType?.color || '#6B7280';
    },
    getTraditionalCategoryColor: (category: string) => {
      const traditionalCategory = settings.traditionalCategories.find(c => c.name === category);
      return traditionalCategory?.color || '#6B7280';
    },
    // Alias methods for compatibility
    getTypeColor: (type: string) => {
      const traditionType = settings.traditionTypes.find(t => t.name === type);
      return traditionType?.color || '#6B7280';
    },
    getCategoryColor: (category: string) => {
      const traditionalCategory = settings.traditionalCategories.find(c => c.name === category);
      return traditionalCategory?.color || '#6B7280';
    }
  };
};

// ============================================================================
// IMPORTANT DATE SETTINGS MIRROR
// ============================================================================

export const useImportantDateSettings = () => {
  const [settings] = useAtom(settingsAtom);
  
  return {
    // Important date types from settings
    importantDateTypes: settings.importantDateTypes,
    
    // Date type colors from settings
    dateTypeColors: settings.importantDateTypes.reduce((acc, type) => {
      acc[type.name] = type.color;
      return acc;
    }, {} as Record<string, string>),
    
    // Priority colors for important dates
    priorityColors: {
      'high': settings.bucketlistPriorityColors?.high || '#EF4444',
      'medium': settings.bucketlistPriorityColors?.medium || '#F97316',
      'low': settings.bucketlistPriorityColors?.low || '#6B7280'
    },
    
    // Get color for specific attributes
    getDateTypeColor: (type: string) => {
      const importantDateType = settings.importantDateTypes.find(t => t.name === type);
      return importantDateType?.color || '#6B7280';
    },
    getPriorityColor: (priority: string) => {
      const priorityMap: Record<string, string> = {
        'high': settings.bucketlistPriorityColors?.high || '#EF4444',
        'medium': settings.bucketlistPriorityColors?.medium || '#F97316',
        'low': settings.bucketlistPriorityColors?.low || '#6B7280'
      };
      return priorityMap[priority] || '#6B7280';
    }
  };
};

// ============================================================================
// UNIVERSAL SETTINGS HELPERS
// ============================================================================

/**
 * Get all available settings for a specific item type
 */
export const useItemTypeSettings = (itemType: 'story' | 'goal' | 'bucketlist' | 'project' | 'tradition' | 'important-date') => {
  switch (itemType) {
    case 'story':
      return useStorySettings();
    case 'goal':
      return useGoalSettings();
    case 'bucketlist':
      return useBucketlistSettings();
    case 'project':
      return useProjectSettings();
    case 'tradition':
      return useTraditionSettings();
    case 'important-date':
      return useImportantDateSettings();
    default:
      return useStorySettings();
  }
};

/**
 * Get color for any attribute across all item types
 */
export const useColorHelper = () => {
  const [settings] = useAtom(settingsAtom);
  
  return {
    getColor: (itemType: string, attribute: string, value: string) => {
      switch (itemType) {
        case 'story':
          switch (attribute) {
            case 'status':
              return settings.statusColors[value] || '#6B7280';
            case 'priority':
              return settings.priorityColors[value as Priority] || '#6B7280';
            case 'type':
              return settings.storyTypes.find(t => t.name === value)?.color || '#6B7280';
            case 'size':
              return settings.storySizes.find(s => s.name === value)?.color || '#6B7280';
            default:
              return '#6B7280';
          }
        case 'goal':
          switch (attribute) {
            case 'status':
              const goalStatusMap: Record<string, string> = {
                'icebox': settings.statusColors.icebox || '#6B7280',
                'backlog': settings.statusColors.backlog || '#3B82F6',
                'todo': settings.statusColors.todo || '#F59E0B',
                'in-progress': settings.statusColors.progress || '#10B981',
                'review': settings.statusColors.review || '#8B5CF6',
                'done': settings.statusColors.done || '#22C55E'
              };
              return goalStatusMap[value] || '#6B7280';
            case 'type':
              return settings.goalTypes.find(t => t.name === value)?.color || '#6B7280';
            default:
              return '#6B7280';
          }
        default:
          return '#6B7280';
      }
    }
  };
};
