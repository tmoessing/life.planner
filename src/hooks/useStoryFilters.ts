import { useState, useMemo, useCallback } from 'react';
import type { Story, Priority, StoryType } from '@/types';

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

export const defaultFilters: StoryFilters = {
  priority: 'all',
  type: 'all',
  roleId: 'all',
  visionId: 'all',
  goalId: 'all',
  projectId: 'all',
  weight: 'all',
  size: 'all',
  status: 'all',
  location: 'all',
  dueDate: 'all',
  scheduledDate: 'all',
  sprintId: 'all'
};

export function useStoryFilters() {
  const [filters, setFilters] = useState<StoryFilters>(defaultFilters);

  const updateFilter = useCallback(<K extends keyof StoryFilters>(
    key: K,
    value: StoryFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const applyFilters = useCallback((stories: Story[]) => {
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
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return Object.entries(filters).some(([key, value]) => 
      key !== 'sprintId' && value !== 'all'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
    hasActiveFilters
  };
}
