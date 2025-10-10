import type { Story, Priority, StoryType } from '@/types';

/**
 * Review-specific utility functions
 */

export const isStoryCompleted = (story: Story): boolean => {
  // A story is considered completed if it's in the "done" status
  // or if all checklist items are completed
  const allChecklistDone = story.checklist.length > 0 && story.checklist.every(item => item.done);
  return story.status === 'done' || allChecklistDone;
};

export const getCompletedStories = (stories: Story[]): Story[] => {
  return stories.filter(story => !story.deleted && isStoryCompleted(story));
};

export const getStoryCompletionPercentage = (story: Story): number => {
  if (story.checklist.length === 0) return 0;
  
  const completedItems = story.checklist.filter(item => item.done).length;
  return (completedItems / story.checklist.length) * 100;
};

export const getStoryAge = (story: Story): number => {
  const created = new Date(story.createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
};

export const getCompletionTime = (story: Story): number => {
  const created = new Date(story.createdAt);
  const updated = new Date(story.updatedAt);
  return Math.floor((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
};

export const searchStories = (stories: Story[], searchTerm: string): Story[] => {
  if (!searchTerm.trim()) return stories;
  
  const searchLower = searchTerm.toLowerCase();
  return stories.filter(story =>
    story.title.toLowerCase().includes(searchLower) ||
    story.description.toLowerCase().includes(searchLower)
  );
};

export const filterStoriesByDateRange = (
  stories: Story[], 
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year'
): Story[] => {
  if (dateRange === 'all') return stories;
  
  const now = new Date();
  const dateRanges = {
    week: 7,
    month: 30,
    quarter: 90,
    year: 365
  };
  
  const daysBack = dateRanges[dateRange];
  const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
  
  return stories.filter(story => {
    const updatedAt = new Date(story.updatedAt);
    return updatedAt >= cutoffDate;
  });
};

export const calculateReviewStats = (stories: Story[]) => {
  const totalStories = stories.filter(s => !s.deleted).length;
  const completedStories = getCompletedStories(stories);
  const completionRate = totalStories > 0 ? (completedStories.length / totalStories) * 100 : 0;
  
  // Calculate average completion time
  const completedWithDates = completedStories.filter(s => s.updatedAt && s.createdAt);
  const averageCompletionTime = completedWithDates.length > 0 
    ? completedWithDates.reduce((sum, story) => {
        const created = new Date(story.createdAt);
        const updated = new Date(story.updatedAt);
        return sum + (updated.getTime() - created.getTime());
      }, 0) / completedWithDates.length / (1000 * 60 * 60 * 24) // Convert to days
    : 0;
  
  const storiesByPriority = completedStories.reduce((acc, story) => {
    acc[story.priority] = (acc[story.priority] || 0) + 1;
    return acc;
  }, {} as Record<Priority, number>);
  
  const storiesByType = completedStories.reduce((acc, story) => {
    acc[story.type] = (acc[story.type] || 0) + 1;
    return acc;
  }, {} as Record<StoryType, number>);
  
  const recentCompletions = completedStories
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
  
  const topPerformers = completedStories
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5);

  return {
    totalStories,
    completedStories: completedStories.length,
    completionRate,
    averageCompletionTime,
    storiesByPriority,
    storiesByType,
    recentCompletions,
    topPerformers
  };
};

export const getCompletionTrends = (stories: Story[], days: number = 30) => {
  const now = new Date();
  const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  
  const completedStories = getCompletedStories(stories);
  const recentCompletions = completedStories.filter(story => {
    const completedAt = new Date(story.updatedAt);
    return completedAt >= startDate;
  });
  
  // Group by day
  const dailyCompletions = recentCompletions.reduce((acc, story) => {
    const date = new Date(story.updatedAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Create trend data
  const trendData = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
    const dateStr = date.toISOString().split('T')[0];
    trendData.unshift({
      date: dateStr,
      completions: dailyCompletions[dateStr] || 0
    });
  }
  
  return trendData;
};

export const getProductivityInsights = (stories: Story[]) => {
  const stats = calculateReviewStats(stories);
  const insights: string[] = [];
  
  if (stats.completionRate > 80) {
    insights.push('Excellent completion rate! You\'re very productive.');
  } else if (stats.completionRate > 60) {
    insights.push('Good completion rate. Consider focusing on finishing more stories.');
  } else {
    insights.push('Low completion rate. Consider breaking down stories into smaller tasks.');
  }
  
  if (stats.averageCompletionTime < 7) {
    insights.push('Fast completion times! You\'re efficient at finishing stories.');
  } else if (stats.averageCompletionTime > 30) {
    insights.push('Long completion times. Consider setting more realistic deadlines.');
  }
  
  const priorityDistribution = stats.storiesByPriority;
  const highPriorityCompleted = (priorityDistribution.Q1 || 0) + (priorityDistribution.Q2 || 0);
  const lowPriorityCompleted = (priorityDistribution.Q3 || 0) + (priorityDistribution.Q4 || 0);
  
  if (highPriorityCompleted > lowPriorityCompleted) {
    insights.push('Great job focusing on high-priority stories!');
  } else {
    insights.push('Consider prioritizing high-importance stories over low-priority ones.');
  }
  
  return insights;
};

export const getPerformanceMetrics = (stories: Story[]) => {
  const stats = calculateReviewStats(stories);
  const trends = getCompletionTrends(stories);
  
  // Calculate velocity (stories completed per week)
  const weeklyVelocity = trends.slice(-7).reduce((sum, day) => sum + day.completions, 0);
  
  // Calculate consistency (standard deviation of daily completions)
  const dailyCompletions = trends.map(day => day.completions);
  const mean = dailyCompletions.reduce((sum, val) => sum + val, 0) / dailyCompletions.length;
  const variance = dailyCompletions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyCompletions.length;
  const consistency = Math.sqrt(variance);
  
  return {
    completionRate: stats.completionRate,
    averageCompletionTime: stats.averageCompletionTime,
    weeklyVelocity,
    consistency,
    totalCompleted: stats.completedStories,
    recentTrend: trends.slice(-7).map(day => day.completions)
  };
};

export const exportReviewData = (stories: Story[], format: 'json' | 'csv' = 'json') => {
  const completedStories = getCompletedStories(stories);
  const stats = calculateReviewStats(stories);
  const metrics = getPerformanceMetrics(stories);
  
  const data = {
    summary: {
      totalStories: stats.totalStories,
      completedStories: stats.completedStories,
      completionRate: stats.completionRate,
      averageCompletionTime: stats.averageCompletionTime
    },
    metrics,
    stories: completedStories.map(story => ({
      id: story.id,
      title: story.title,
      priority: story.priority,
      type: story.type,
      weight: story.weight,
      completionTime: getCompletionTime(story),
      completedAt: story.updatedAt
    }))
  };
  
  if (format === 'csv') {
    const csvRows = [
      ['Title', 'Priority', 'Type', 'Weight', 'Completion Time (days)', 'Completed At'],
      ...data.stories.map(story => [
        story.title,
        story.priority,
        story.type,
        story.weight.toString(),
        story.completionTime.toString(),
        story.completedAt
      ])
    ];
    
    return csvRows.map(row => row.join(',')).join('\n');
  }
  
  return JSON.stringify(data, null, 2);
};
