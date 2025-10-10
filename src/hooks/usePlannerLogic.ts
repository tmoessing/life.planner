import { useState, useMemo, useCallback } from 'react';
import type { Story, BrainLevel, TimeBucket, Priority } from '@/types';
import { getBrainLevelWeights, getPriorityOrder } from '@/utils';
import { getWeightGradientColor } from '@/utils/color';

export interface PlannerFilters {
  brainLevel: BrainLevel;
  timeBucket: TimeBucket;
  priority: Priority | 'all';
}

export interface PlannerStats {
  totalStories: number;
  storiesByPriority: Record<Priority, Story[]>;
  averageWeight: number;
  totalWeight: number;
  brainLevelDistribution: Record<BrainLevel, number>;
}

export function usePlannerLogic(stories: Story[], settings: any) {
  const [filters, setFilters] = useState<PlannerFilters>({
    brainLevel: 'moderate',
    timeBucket: 'M',
    priority: 'all'
  });

  const updateFilter = useCallback(<K extends keyof PlannerFilters>(
    key: K,
    value: PlannerFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({
      brainLevel: 'moderate',
      timeBucket: 'M',
      priority: 'all'
    });
  }, []);

  const getFilteredStories = useCallback(() => {
    const brainWeights = getBrainLevelWeights(filters.brainLevel);
    
    return stories
      .filter(story => !story.deleted)
      .filter(story => brainWeights.includes(story.weight))
      .filter(story => story.size === filters.timeBucket)
      .filter(story => filters.priority === 'all' || story.priority === filters.priority)
      .sort((a, b) => {
        const priorityOrderA = getPriorityOrder(a.priority);
        const priorityOrderB = getPriorityOrder(b.priority);
        
        if (priorityOrderA !== priorityOrderB) {
          return priorityOrderA - priorityOrderB;
        }
        
        return b.weight - a.weight;
      });
  }, [stories, filters]);

  const filteredStories = useMemo(() => getFilteredStories(), [getFilteredStories]);

  const storiesByPriority = useMemo(() => {
    return filteredStories.reduce((acc, story) => {
      if (!acc[story.priority]) {
        acc[story.priority] = [];
      }
      acc[story.priority].push(story);
      return acc;
    }, {} as Record<Priority, Story[]>);
  }, [filteredStories]);

  const stats = useMemo((): PlannerStats => {
    const totalStories = filteredStories.length;
    const totalWeight = filteredStories.reduce((sum, story) => sum + story.weight, 0);
    const averageWeight = totalStories > 0 ? totalWeight / totalStories : 0;
    
    const brainLevelDistribution = {
      low: stories.filter(s => getBrainLevelWeights('low').includes(s.weight)).length,
      moderate: stories.filter(s => getBrainLevelWeights('moderate').includes(s.weight)).length,
      high: stories.filter(s => getBrainLevelWeights('high').includes(s.weight)).length
    };

    return {
      totalStories,
      storiesByPriority,
      averageWeight,
      totalWeight,
      brainLevelDistribution
    };
  }, [filteredStories, stories]);

  const getStoryColor = useCallback((story: Story) => {
    return getWeightGradientColor(story.weight, settings.weightBaseColor);
  }, [settings.weightBaseColor]);

  const getPriorityColor = useCallback((priority: Priority) => {
    return settings.priorityColors?.[priority] || '#6B7280';
  }, [settings.priorityColors]);

  const getBrainLevelDescription = useCallback((level: BrainLevel) => {
    const descriptions = {
      low: 'Light cognitive load - simple, routine tasks',
      moderate: 'Balanced cognitive load - standard complexity',
      high: 'High cognitive load - complex, challenging tasks'
    };
    return descriptions[level];
  }, []);

  const getTimeBucketDescription = useCallback((bucket: TimeBucket) => {
    const descriptions = {
      'XS': 'Extra Small - 15 minutes',
      'S': 'Small - 30 minutes',
      'M': 'Medium - 1 hour',
      'L': 'Large - 2-4 hours',
      'XL': 'Extra Large - 1+ days'
    };
    return descriptions[bucket];
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    filteredStories,
    storiesByPriority,
    stats,
    getStoryColor,
    getPriorityColor,
    getBrainLevelDescription,
    getTimeBucketDescription
  };
}
