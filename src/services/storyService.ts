import type { Story, Priority, StoryType, RecurrenceEditMode } from '@/types';

export interface StoryFilters {
  priority: Priority | 'all';
  type: StoryType | 'all';
  roleId: string | 'all';
  visionId: string | 'all';
  goalId: string | 'all';
  projectId: string | 'all';
  weight: number | 'all';
  size: string | 'all';
  status: string | 'all';
  location: string | 'all';
  dueDate: string | 'all';
  scheduledDate: string | 'all';
  sprintId: string | 'all';
}

export class StoryService {
  /**
   * Filter stories based on provided filters
   */
  static filterStories(stories: Story[], filters: StoryFilters): Story[] {
    return stories.filter(story => {
      if (story.deleted) return false;
      
      // Sprint filter
      if (filters.sprintId !== 'all' && story.sprintId !== filters.sprintId) {
        return false;
      }
      
      // Priority filter
      if (filters.priority !== 'all' && story.priority !== filters.priority) {
        return false;
      }
      
      // Type filter
      if (filters.type !== 'all' && story.type !== filters.type) {
        return false;
      }
      
      // Role filter
      if (filters.roleId !== 'all' && story.roleId !== filters.roleId) {
        return false;
      }
      
      // Vision filter
      if (filters.visionId !== 'all' && story.visionId !== filters.visionId) {
        return false;
      }
      
      // Goal filter
      if (filters.goalId !== 'all' && story.goalId !== filters.goalId) {
        return false;
      }
      
      // Project filter
      if (filters.projectId !== 'all' && story.projectId !== filters.projectId) {
        return false;
      }
      
      // Weight filter
      if (filters.weight !== 'all' && story.weight !== filters.weight) {
        return false;
      }
      
      // Size filter
      if (filters.size !== 'all' && story.size !== filters.size) {
        return false;
      }
      
      // Status filter
      if (filters.status !== 'all' && story.status !== filters.status) {
        return false;
      }
      
      // Location filter
      if (filters.location !== 'all' && story.location !== filters.location) {
        return false;
      }
      
      // Due date filter
      if (filters.dueDate !== 'all' && story.dueDate !== filters.dueDate) {
        return false;
      }
      
      // Scheduled date filter
      if (filters.scheduledDate !== 'all' && story.scheduledDate !== filters.scheduledDate) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Group stories by a specific attribute
   */
  static groupStoriesBy<T extends keyof Story>(
    stories: Story[], 
    attribute: T
  ): Record<string, Story[]> {
    return stories.reduce((groups, story) => {
      const value = story[attribute];
      const key = value?.toString() || 'undefined';
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(story);
      
      return groups;
    }, {} as Record<string, Story[]>);
  }

  /**
   * Sort stories by priority and weight
   */
  static sortStoriesByPriority(stories: Story[]): Story[] {
    const priorityOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
    
    return stories.sort((a, b) => {
      const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
      const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      return b.weight - a.weight;
    });
  }

  /**
   * Get story statistics
   */
  static getStoryStats(stories: Story[]) {
    const total = stories.length;
    const completed = stories.filter(story => story.status === 'done').length;
    const inProgress = stories.filter(story => 
      ['todo', 'progress', 'review'].includes(story.status)
    ).length;
    const backlog = stories.filter(story => 
      ['icebox', 'backlog'].includes(story.status)
    ).length;

    const priorityStats = stories.reduce((acc, story) => {
      acc[story.priority] = (acc[story.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);

    const typeStats = stories.reduce((acc, story) => {
      acc[story.type] = (acc[story.type] || 0) + 1;
      return acc;
    }, {} as Record<StoryType, number>);

    const weightStats = stories.reduce((acc, story) => {
      acc[story.weight] = (acc[story.weight] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      total,
      completed,
      inProgress,
      backlog,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      priorityStats,
      typeStats,
      weightStats
    };
  }

  /**
   * Get stories by sprint
   */
  static getStoriesBySprint(stories: Story[], sprintId?: string): Story[] {
    if (!sprintId) {
      return stories.filter(story => !story.sprintId);
    }
    return stories.filter(story => story.sprintId === sprintId);
  }

  /**
   * Get stories by status
   */
  static getStoriesByStatus(stories: Story[], status: string): Story[] {
    return stories.filter(story => story.status === status);
  }

  /**
   * Get stories by role
   */
  static getStoriesByRole(stories: Story[], roleId: string): Story[] {
    return stories.filter(story => story.roleId === roleId);
  }

  /**
   * Get stories by vision
   */
  static getStoriesByVision(stories: Story[], visionId: string): Story[] {
    return stories.filter(story => story.visionId === visionId);
  }

  /**
   * Get stories by goal
   */
  static getStoriesByGoal(stories: Story[], goalId: string): Story[] {
    return stories.filter(story => story.goalId === goalId);
  }

  /**
   * Get stories by project
   */
  static getStoriesByProject(stories: Story[], projectId: string): Story[] {
    return stories.filter(story => story.projectId === projectId);
  }

  /**
   * Search stories by text
   */
  static searchStories(stories: Story[], searchText: string): Story[] {
    if (!searchText.trim()) return stories;
    
    const searchLower = searchText.toLowerCase();
    return stories.filter(story => 
      story.title.toLowerCase().includes(searchLower) ||
      story.description.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get due soon stories (within next 7 days)
   */
  static getDueSoonStories(stories: Story[], daysAhead: number = 7): Story[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (daysAhead * 24 * 60 * 60 * 1000));
    
    return stories.filter(story => {
      if (!story.dueDate) return false;
      
      const dueDate = new Date(story.dueDate);
      return dueDate >= now && dueDate <= futureDate;
    });
  }

  /**
   * Get overdue stories
   */
  static getOverdueStories(stories: Story[]): Story[] {
    const now = new Date();
    
    return stories.filter(story => {
      if (!story.dueDate) return false;
      
      const dueDate = new Date(story.dueDate);
      return dueDate < now && story.status !== 'done';
    });
  }

  /**
   * Get story completion percentage based on checklist
   */
  static getStoryCompletionPercentage(story: Story): number {
    if (story.checklist.length === 0) return 0;
    
    const completedItems = story.checklist.filter(item => item.done).length;
    return (completedItems / story.checklist.length) * 100;
  }

  /**
   * Get stories with incomplete checklists
   */
  static getStoriesWithIncompleteChecklists(stories: Story[]): Story[] {
    return stories.filter(story => 
      story.checklist.length > 0 && 
      StoryService.getStoryCompletionPercentage(story) < 100
    );
  }

  /**
   * Get stories by weight range
   */
  static getStoriesByWeightRange(stories: Story[], minWeight: number, maxWeight: number): Story[] {
    return stories.filter(story => 
      story.weight >= minWeight && story.weight <= maxWeight
    );
  }

  /**
   * Get stories by size
   */
  static getStoriesBySize(stories: Story[], size: string): Story[] {
    return stories.filter(story => story.size === size);
  }

  /**
   * Get stories by location
   */
  static getStoriesByLocation(stories: Story[], location: string): Story[] {
    return stories.filter(story => story.location === location);
  }

  /**
   * Get stories by task category
   */
  static getStoriesByTaskCategory(stories: Story[], category: string): Story[] {
    return stories.filter(story => 
      story.taskCategories?.includes(category)
    );
  }

  /**
   * Get stories by label
   */
  static getStoriesByLabel(stories: Story[], labelId: string): Story[] {
    return stories.filter(story => story.labels.includes(labelId));
  }

  /**
   * Get stories by date range
   */
  static getStoriesByDateRange(
    stories: Story[], 
    startDate: Date, 
    endDate: Date,
    dateField: 'dueDate' | 'scheduledDate' | 'createdAt' | 'updatedAt' = 'dueDate'
  ): Story[] {
    return stories.filter(story => {
      const storyDate = story[dateField];
      if (!storyDate) return false;
      
      const date = new Date(storyDate);
      return date >= startDate && date <= endDate;
    });
  }

  /**
   * Update a recurring story with different edit modes
   */
  static updateRecurringStory(
    story: Story,
    updates: Partial<Story>,
    mode: RecurrenceEditMode,
    instanceDate?: string
  ): Story {
    if (!story.repeat || story.repeat.cadence === 'none') {
      // Not a recurring story, just update normally
      return { ...story, ...updates };
    }

    const updatedStory = { ...story };

    if (mode === 'this' && instanceDate) {
      // Update only this instance
      if (!updatedStory.repeat) {
        updatedStory.repeat = {
          cadence: 'none',
          instances: {}
        };
      }
      updatedStory.repeat = {
        ...updatedStory.repeat,
        cadence: updatedStory.repeat.cadence || 'none',
        instances: {
          ...updatedStory.repeat.instances,
          [instanceDate]: {
            ...updatedStory.repeat.instances?.[instanceDate],
            status: updates.status,
            modified: true
          }
        }
      };
    } else if (mode === 'future') {
      // Update repeat rules and clear future instance overrides
      if (!updatedStory.repeat) {
        updatedStory.repeat = {
          cadence: 'none',
          instances: {}
        };
      }
      updatedStory.repeat = {
        ...updatedStory.repeat,
        cadence: updates.repeat?.cadence || updatedStory.repeat.cadence || 'none',
        ...updates.repeat,
        instances: this.clearFutureInstanceOverrides(
          updatedStory.repeat.instances || {},
          instanceDate
        )
      };
    } else if (mode === 'all') {
      // Update base story and clear all overrides
      if (!updatedStory.repeat) {
        updatedStory.repeat = {
          cadence: 'none',
          instances: {}
        };
      }
      updatedStory.repeat = {
        ...updatedStory.repeat,
        cadence: updates.repeat?.cadence || updatedStory.repeat.cadence || 'none',
        ...updates.repeat,
        instances: {}
      };
    }

    return { ...updatedStory, ...updates };
  }

  /**
   * Update a specific instance of a recurring story
   */
  static updateStoryInstanceOverride(
    story: Story,
    date: string,
    overrides: Partial<Story>
  ): Story {
    if (!story.repeat) return story;

    return {
      ...story,
      repeat: {
        ...story.repeat,
        instances: {
          ...story.repeat.instances,
          [date]: {
            ...story.repeat.instances?.[date],
            status: overrides.status,
            completed: overrides.status === 'done',
            modified: true
          }
        }
      }
    };
  }

  /**
   * Clear future instance overrides from a specific date
   */
  private static clearFutureInstanceOverrides(
    instances: { [date: string]: any },
    fromDate?: string
  ): { [date: string]: any } {
    if (!fromDate) return {};

    const clearedInstances: { [date: string]: any } = {};
    const fromDateObj = new Date(fromDate);

    Object.entries(instances).forEach(([date, instance]) => {
      const instanceDate = new Date(date);
      if (instanceDate < fromDateObj) {
        clearedInstances[date] = instance;
      }
    });

    return clearedInstances;
  }

  /**
   * Get recurring stories
   */
  static getRecurringStories(stories: Story[]): Story[] {
    return stories.filter(story => 
      story.repeat && story.repeat.cadence !== 'none'
    );
  }

  /**
   * Get non-recurring stories
   */
  static getNonRecurringStories(stories: Story[]): Story[] {
    return stories.filter(story => 
      !story.repeat || story.repeat.cadence === 'none'
    );
  }

  /**
   * Check if a story is recurring
   */
  static isRecurringStory(story: Story): boolean {
    return !!(story.repeat && story.repeat.cadence !== 'none');
  }

  /**
   * Get the status for a specific instance of a recurring story
   */
  static getInstanceStatus(story: Story, date: string): Story['status'] {
    if (!story.repeat?.instances) return story.status;
    
    const instance = story.repeat.instances[date];
    return instance?.status || story.status;
  }

  /**
   * Check if an instance is completed
   */
  static isInstanceCompleted(story: Story, date: string): boolean {
    if (!story.repeat?.instances) return false;
    
    const instance = story.repeat.instances[date];
    return instance?.completed || false;
  }

  /**
   * Check if an instance is skipped
   */
  static isInstanceSkipped(story: Story, date: string): boolean {
    if (!story.repeat?.instances) return false;
    
    const instance = story.repeat.instances[date];
    return instance?.skipped || false;
  }
}
