import type { Story, BrainLevel, TimeBucket, Priority } from '@/types';

/**
 * Planner-specific utility functions
 */

export const getBrainLevelWeights = (level: BrainLevel): number[] => {
  switch (level) {
    case 'low':
      return [1, 3];
    case 'moderate':
      return [5, 8];
    case 'high':
      return [13, 21];
    default:
      return [1, 3, 5, 8, 13, 21];
  }
};

export const getBrainLevelDescription = (level: BrainLevel): string => {
  const descriptions = {
    low: 'Light cognitive load - simple, routine tasks',
    moderate: 'Balanced cognitive load - standard complexity',
    high: 'High cognitive load - complex, challenging tasks'
  };
  return descriptions[level];
};

export const getTimeBucketDescription = (bucket: TimeBucket): string => {
  const descriptions = {
    'XS': 'Extra Small - 15 minutes',
    'S': 'Small - 30 minutes',
    'M': 'Medium - 1 hour',
    'L': 'Large - 2-4 hours',
    'XL': 'Extra Large - 1+ days'
  };
  return descriptions[bucket];
};

export const getTimeBucketEstimate = (bucket: TimeBucket): string => {
  const estimates = {
    'XS': '15 min',
    'S': '30 min',
    'M': '1 hour',
    'L': '2-4 hours',
    'XL': '1+ days'
  };
  return estimates[bucket];
};

export const filterStoriesByBrainLevel = (stories: Story[], level: BrainLevel): Story[] => {
  const weights = getBrainLevelWeights(level);
  return stories.filter(story => weights.includes(story.weight));
};

export const filterStoriesByTimeBucket = (stories: Story[], bucket: TimeBucket): Story[] => {
  return stories.filter(story => story.size === bucket);
};

export const sortStoriesByPriorityAndWeight = (stories: Story[]): Story[] => {
  const priorityOrder = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  
  return stories.sort((a, b) => {
    const priorityA = priorityOrder[a.priority as keyof typeof priorityOrder] || 5;
    const priorityB = priorityOrder[b.priority as keyof typeof priorityOrder] || 5;
    
    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }
    
    return b.weight - a.weight;
  });
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

export const calculatePlannerStats = (stories: Story[]) => {
  const totalStories = stories.length;
  const totalWeight = stories.reduce((sum, story) => sum + story.weight, 0);
  const averageWeight = totalStories > 0 ? totalWeight / totalStories : 0;
  
  const brainLevelDistribution = {
    low: stories.filter(s => getBrainLevelWeights('low').includes(s.weight)).length,
    moderate: stories.filter(s => getBrainLevelWeights('moderate').includes(s.weight)).length,
    high: stories.filter(s => getBrainLevelWeights('high').includes(s.weight)).length
  };

  const priorityDistribution = stories.reduce((acc, story) => {
    acc[story.priority] = (acc[story.priority] || 0) + 1;
    return acc;
  }, {} as Record<Priority, number>);

  const sizeDistribution = stories.reduce((acc, story) => {
    acc[story.size] = (acc[story.size] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalStories,
    totalWeight,
    averageWeight,
    brainLevelDistribution,
    priorityDistribution,
    sizeDistribution
  };
};

export const getOptimalPlannerSettings = (stories: Story[]) => {
  const stats = calculatePlannerStats(stories);
  
  // Determine optimal brain level based on story distribution
  const { brainLevelDistribution } = stats;
  const maxBrainLevel = Object.entries(brainLevelDistribution)
    .reduce((max, [level, count]) => count > max.count ? { level, count } : max, 
      { level: 'moderate', count: 0 });
  
  // Determine optimal time bucket based on story sizes
  const sizeDistribution = stats.sizeDistribution;
  const maxSize = Object.entries(sizeDistribution)
    .reduce((max, [size, count]) => count > max.count ? { size, count } : max, 
      { size: 'M', count: 0 });
  
  return {
    recommendedBrainLevel: maxBrainLevel.level as BrainLevel,
    recommendedTimeBucket: maxSize.size as TimeBucket,
    reasoning: {
      brainLevel: `Most stories (${maxBrainLevel.count}) are in the ${maxBrainLevel.level} cognitive load range`,
      timeBucket: `Most stories (${maxSize.count}) are ${maxSize.size} size`
    }
  };
};

export const validatePlannerFilters = (filters: {
  brainLevel: BrainLevel;
  timeBucket: TimeBucket;
  priority: Priority | 'all';
}) => {
  const errors: string[] = [];
  
  if (!['low', 'moderate', 'high'].includes(filters.brainLevel)) {
    errors.push('Invalid brain level');
  }
  
  if (!['XS', 'S', 'M', 'L', 'XL'].includes(filters.timeBucket)) {
    errors.push('Invalid time bucket');
  }
  
  if (filters.priority !== 'all' && !['Q1', 'Q2', 'Q3', 'Q4'].includes(filters.priority)) {
    errors.push('Invalid priority');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getPlannerRecommendations = (stories: Story[]) => {
  const stats = calculatePlannerStats(stories);
  const recommendations: string[] = [];
  
  if (stats.averageWeight > 10) {
    recommendations.push('Consider breaking down high-weight stories into smaller tasks');
  }
  
  if (stats.brainLevelDistribution.high > stats.brainLevelDistribution.low + stats.brainLevelDistribution.moderate) {
    recommendations.push('You have many high-cognitive-load stories. Consider balancing with lighter tasks');
  }
  
  if (stats.priorityDistribution.Q4 > stats.priorityDistribution.Q1 + stats.priorityDistribution.Q2) {
    recommendations.push('Many low-priority stories. Consider focusing on higher-priority items');
  }
  
  return recommendations;
};
