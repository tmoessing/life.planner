import type { Story, Priority, StoryType, Role, Label, Vision, Goal, Project } from '@/types';

/**
 * Story utility functions for common operations
 */

export const getRoleName = (roleId: string | undefined, roles: Role[]): string => {
  const role = roles.find(r => r.id === roleId);
  return role?.name || 'No Role';
};

export const getVisionName = (visionId: string | undefined, visions: Vision[]): string => {
  const vision = visions.find(v => v.id === visionId);
  return vision?.name || 'No Vision';
};

export const getGoalName = (goalId: string | undefined, goals: Goal[]): string => {
  const goal = goals.find(g => g.id === goalId);
  return goal?.name || 'No Goal';
};

export const getProjectName = (projectId: string | undefined, projects: Project[]): string => {
  const project = projects.find(p => p.id === projectId);
  return project?.name || 'No Project';
};

export const getLabelNames = (labelIds: string[], labels: Label[]): string[] => {
  return labelIds
    .map(id => labels.find(l => l.id === id))
    .filter(Boolean)
    .map(label => label!.name);
};

export const getLabelObjects = (labelIds: string[], labels: Label[]): Label[] => {
  return labelIds
    .map(id => labels.find(l => l.id === id))
    .filter((label): label is Label => label !== undefined);
};

export const getPriorityOrder = (priority: Priority): number => {
  const order: Record<Priority, number> = { 
    Q1: 1, 
    Q2: 2, 
    Q3: 3, 
    Q4: 4,
    high: 1,
    medium: 3,
    low: 5
  };
  return order[priority] || 5;
};

export const getPriorityColor = (priority: Priority, settings: any): string => {
  return settings.priorityColors?.[priority] || '#6B7280';
};

export const getTypeColor = (type: StoryType, settings: any): string => {
  const storyType = settings.storyTypes?.find((t: any) => t.name === type);
  return storyType?.color || '#6B7280';
};

export const getStatusColor = (status: string, settings: any): string => {
  return settings.statusColors?.[status] || '#6B7280';
};

export const getTaskCategoryColor = (category: string, settings: any): string => {
  const taskCategory = settings.taskCategories?.find((tc: any) => tc.name === category);
  return taskCategory?.color || '#6B7280';
};

export const getStoryCompletionPercentage = (story: Story): number => {
  if (story.checklist.length === 0) return 0;
  
  const completedItems = story.checklist.filter(item => item.done).length;
  return (completedItems / story.checklist.length) * 100;
};

export const isStoryOverdue = (story: Story): boolean => {
  if (!story.dueDate) return false;
  
  const now = new Date();
  const dueDate = new Date(story.dueDate);
  return dueDate < now && story.status !== 'done';
};

export const isStoryDueSoon = (story: Story, daysAhead: number = 7): boolean => {
  if (!story.dueDate) return false;
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
  const dueDate = new Date(story.dueDate);
  
  return dueDate >= now && dueDate <= futureDate;
};

export const formatStoryDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export const getStoryAge = (story: Story): number => {
  const created = new Date(story.createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
};

export const getStoryProgress = (story: Story): {
  completed: number;
  total: number;
  percentage: number;
} => {
  const total = story.checklist.length;
  const completed = story.checklist.filter(item => item.done).length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  
  return { completed, total, percentage };
};

export const getStoryWeightClass = (weight: number): string => {
  if (weight <= 3) return 'light';
  if (weight <= 8) return 'medium';
  if (weight <= 13) return 'heavy';
  return 'very-heavy';
};

export const getStorySizeClass = (size: string): string => {
  const sizeMap: Record<string, string> = {
    'XS': 'extra-small',
    'S': 'small',
    'M': 'medium',
    'L': 'large',
    'XL': 'extra-large'
  };
  return sizeMap[size] || 'medium';
};

export const getStoryPriorityClass = (priority: Priority): string => {
  const priorityMap: Record<Priority, string> = {
    'Q1': 'critical',
    'Q2': 'high',
    'Q3': 'medium',
    'Q4': 'low',
    'high': 'high',
    'medium': 'medium',
    'low': 'low'
  };
  return priorityMap[priority] || 'low';
};

export const getStoryStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    'icebox': 'icebox',
    'backlog': 'backlog',
    'todo': 'todo',
    'progress': 'progress',
    'review': 'review',
    'done': 'done'
  };
  return statusMap[status] || 'backlog';
};

export const sortStoriesByPriority = (stories: Story[]): Story[] => {
  return stories.sort((a, b) => {
    const priorityA = getPriorityOrder(a.priority);
    const priorityB = getPriorityOrder(b.priority);
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return b.weight - a.weight;
  });
};

export const sortStoriesByWeight = (stories: Story[]): Story[] => {
  return stories.sort((a, b) => b.weight - a.weight);
};

export const sortStoriesByDate = (stories: Story[], dateField: 'dueDate' | 'scheduledDate' | 'createdAt' | 'updatedAt' = 'dueDate'): Story[] => {
  return stories.sort((a, b) => {
    const dateA = a[dateField] ? new Date(a[dateField]!).getTime() : 0;
    const dateB = b[dateField] ? new Date(b[dateField]!).getTime() : 0;
    return dateA - dateB;
  });
};

export const sortStoriesByTitle = (stories: Story[]): Story[] => {
  return stories.sort((a, b) => a.title.localeCompare(b.title));
};

export const groupStoriesByPriority = (stories: Story[]): Record<Priority, Story[]> => {
  return stories.reduce((groups, story) => {
    if (!groups[story.priority]) {
      groups[story.priority] = [];
    }
    groups[story.priority].push(story);
    return groups;
  }, {} as Record<Priority, Story[]>);
};

export const groupStoriesByStatus = (stories: Story[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    if (!groups[story.status]) {
      groups[story.status] = [];
    }
    groups[story.status].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
};

export const groupStoriesByType = (stories: Story[]): Record<StoryType, Story[]> => {
  return stories.reduce((groups, story) => {
    if (!groups[story.type]) {
      groups[story.type] = [];
    }
    groups[story.type].push(story);
    return groups;
  }, {} as Record<StoryType, Story[]>);
};

export const groupStoriesByRole = (stories: Story[], roles: Role[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    const roleName = getRoleName(story.roleId, roles);
    if (!groups[roleName]) {
      groups[roleName] = [];
    }
    groups[roleName].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
};

export const groupStoriesByVision = (stories: Story[], visions: Vision[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    const visionName = getVisionName(story.visionId, visions);
    if (!groups[visionName]) {
      groups[visionName] = [];
    }
    groups[visionName].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
};

export const groupStoriesByGoal = (stories: Story[], goals: Goal[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    const goalName = getGoalName(story.goalId, goals);
    if (!groups[goalName]) {
      groups[goalName] = [];
    }
    groups[goalName].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
};

export const groupStoriesByProject = (stories: Story[], projects: Project[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    const projectName = getProjectName(story.projectId, projects);
    if (!groups[projectName]) {
      groups[projectName] = [];
    }
    groups[projectName].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
};

export const groupStoriesByWeight = (stories: Story[]): Record<number, Story[]> => {
  return stories.reduce((groups, story) => {
    if (!groups[story.weight]) {
      groups[story.weight] = [];
    }
    groups[story.weight].push(story);
    return groups;
  }, {} as Record<number, Story[]>);
};

export const groupStoriesBySize = (stories: Story[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    if (!groups[story.size]) {
      groups[story.size] = [];
    }
    groups[story.size].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
};

export const groupStoriesByLocation = (stories: Story[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    const location = story.location || 'No Location';
    if (!groups[location]) {
      groups[location] = [];
    }
    groups[location].push(story);
    return groups;
  }, {} as Record<string, Story[]>);
};

export const groupStoriesByTaskCategory = (stories: Story[]): Record<string, Story[]> => {
  return stories.reduce((groups, story) => {
    if (story.taskCategories && story.taskCategories.length > 0) {
      story.taskCategories.forEach(category => {
        if (!groups[category]) {
          groups[category] = [];
        }
        groups[category].push(story);
      });
    } else {
      const noCategory = 'No Category';
      if (!groups[noCategory]) {
        groups[noCategory] = [];
      }
      groups[noCategory].push(story);
    }
    return groups;
  }, {} as Record<string, Story[]>);
};
