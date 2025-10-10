import { useState, useMemo, useCallback } from 'react';
import type { Story, Priority, StoryType } from '@/types';

export interface ReviewFilters {
  searchTerm: string;
  priority: Priority | 'all';
  type: StoryType | 'all';
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year';
  completionStatus: 'all' | 'completed' | 'incomplete';
}

export interface ReviewStats {
  totalStories: number;
  completedStories: number;
  completionRate: number;
  averageCompletionTime: number;
  storiesByPriority: Record<Priority, number>;
  storiesByType: Record<StoryType, number>;
  recentCompletions: Story[];
  topPerformers: Story[];
}

export function useReviewLogic(stories: Story[], settings: any) {
  const [filters, setFilters] = useState<ReviewFilters>({
    searchTerm: '',
    priority: 'all',
    type: 'all',
    dateRange: 'all',
    completionStatus: 'all'
  });

  const updateFilter = useCallback(<K extends keyof ReviewFilters>(
    key: K,
    value: ReviewFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      searchTerm: '',
      priority: 'all',
      type: 'all',
      dateRange: 'all',
      completionStatus: 'all'
    });
  }, []);

  const getCompletedStories = useCallback(() => {
    return stories.filter(story => {
      if (story.deleted) return false;
      
      // A story is considered completed if it's in the "done" column
      // or if all checklist items are completed
      const allChecklistDone = story.checklist.length > 0 && story.checklist.every(item => item.done);
      return allChecklistDone || story.status === 'done';
    });
  }, [stories]);

  const getFilteredStories = useCallback(() => {
    let filtered = getCompletedStories();
    
    // Search filter
    if (filters.searchTerm.trim()) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(story =>
        story.title.toLowerCase().includes(searchLower) ||
        story.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(story => story.priority === filters.priority);
    }
    
    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(story => story.type === filters.type);
    }
    
    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const dateRanges = {
        week: 7,
        month: 30,
        quarter: 90,
        year: 365
      };
      
      const daysBack = dateRanges[filters.dateRange];
      const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(story => {
        const updatedAt = new Date(story.updatedAt);
        return updatedAt >= cutoffDate;
      });
    }
    
    return filtered;
  }, [getCompletedStories, filters]);

  const filteredStories = useMemo(() => getFilteredStories(), [getFilteredStories]);

  const stats = useMemo((): ReviewStats => {
    const totalStories = stories.filter(s => !s.deleted).length;
    const completedStories = getCompletedStories().length;
    const completionRate = totalStories > 0 ? (completedStories / totalStories) * 100 : 0;
    
    // Calculate average completion time (simplified)
    const completedWithDates = getCompletedStories().filter(s => s.updatedAt && s.createdAt);
    const averageCompletionTime = completedWithDates.length > 0 
      ? completedWithDates.reduce((sum, story) => {
          const created = new Date(story.createdAt);
          const updated = new Date(story.updatedAt);
          return sum + (updated.getTime() - created.getTime());
        }, 0) / completedWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;
    
    const storiesByPriority = getCompletedStories().reduce((acc, story) => {
      acc[story.priority] = (acc[story.priority] || 0) + 1;
      return acc;
    }, {} as Record<Priority, number>);
    
    const storiesByType = getCompletedStories().reduce((acc, story) => {
      acc[story.type] = (acc[story.type] || 0) + 1;
      return acc;
    }, {} as Record<StoryType, number>);
    
    const recentCompletions = getCompletedStories()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
    
    const topPerformers = getCompletedStories()
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);

    return {
      totalStories,
      completedStories,
      completionRate,
      averageCompletionTime,
      storiesByPriority,
      storiesByType,
      recentCompletions,
      topPerformers
    };
  }, [stories, getCompletedStories]);

  const getTaskCategoryColor = useCallback((category: string) => {
    const taskCategory = settings.taskCategories?.find((tc: any) => tc.name === category);
    return taskCategory?.color || '#6B7280';
  }, [settings.taskCategories]);

  const getPriorityColor = useCallback((priority: Priority) => {
    return settings.priorityColors?.[priority] || '#6B7280';
  }, [settings.priorityColors]);

  const getTypeColor = useCallback((type: StoryType) => {
    const storyType = settings.storyTypes?.find((t: any) => t.name === type);
    return storyType?.color || '#6B7280';
  }, [settings.storyTypes]);

  const getCompletionPercentage = useCallback((story: Story) => {
    if (story.checklist.length === 0) return 0;
    const completed = story.checklist.filter(item => item.done).length;
    return (completed / story.checklist.length) * 100;
  }, []);

  const getStoryAge = useCallback((story: Story) => {
    const created = new Date(story.createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  const getCompletionTime = useCallback((story: Story) => {
    const created = new Date(story.createdAt);
    const updated = new Date(story.updatedAt);
    return Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredStories,
    stats,
    getTaskCategoryColor,
    getPriorityColor,
    getTypeColor,
    getCompletionPercentage,
    getStoryAge,
    getCompletionTime
  };
}
