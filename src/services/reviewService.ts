import type { Story, Priority, StoryType } from '@/types';
import {
  isStoryCompleted,
  getCompletedStories,
  searchStories,
  filterStoriesByDateRange,
  calculateReviewStats,
  getCompletionTrends,
  getProductivityInsights,
  getPerformanceMetrics,
  exportReviewData
} from '@/utils/reviewUtils';

export interface ReviewFilters {
  searchTerm: string;
  priority: Priority | 'all';
  type: StoryType | 'all';
  dateRange: 'all' | 'week' | 'month' | 'quarter' | 'year';
  completionStatus: 'all' | 'completed' | 'incomplete';
}

export interface ReviewInsight {
  type: 'productivity' | 'efficiency' | 'prioritization' | 'consistency';
  message: string;
  severity: 'low' | 'medium' | 'high';
  recommendation?: string;
}

export class ReviewService {
  /**
   * Get filtered stories based on review filters
   */
  static getFilteredStories(stories: Story[], filters: ReviewFilters): Story[] {
    let filtered = stories.filter(story => !story.deleted);
    
    // Apply completion status filter
    if (filters.completionStatus === 'completed') {
      filtered = getCompletedStories(filtered);
    } else if (filters.completionStatus === 'incomplete') {
      filtered = filtered.filter(story => !isStoryCompleted(story));
    }
    
    // Apply search filter
    if (filters.searchTerm.trim()) {
      filtered = searchStories(filtered, filters.searchTerm);
    }
    
    // Apply priority filter
    if (filters.priority !== 'all') {
      filtered = filtered.filter(story => story.priority === filters.priority);
    }
    
    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(story => story.type === filters.type);
    }
    
    // Apply date range filter
    if (filters.dateRange !== 'all') {
      filtered = filterStoriesByDateRange(filtered, filters.dateRange);
    }
    
    return filtered;
  }

  /**
   * Get review statistics
   */
  static getReviewStats(stories: Story[]): ReturnType<typeof calculateReviewStats> {
    return calculateReviewStats(stories);
  }

  /**
   * Get completion trends
   */
  static getCompletionTrends(stories: Story[], days: number = 30): ReturnType<typeof getCompletionTrends> {
    return getCompletionTrends(stories, days);
  }

  /**
   * Get productivity insights
   */
  static getProductivityInsights(stories: Story[]): ReturnType<typeof getProductivityInsights> {
    return getProductivityInsights(stories);
  }

  /**
   * Get performance metrics
   */
  static getPerformanceMetrics(stories: Story[]): ReturnType<typeof getPerformanceMetrics> {
    return getPerformanceMetrics(stories);
  }

  /**
   * Get advanced insights
   */
  static getAdvancedInsights(stories: Story[]): ReviewInsight[] {
    const insights: ReviewInsight[] = [];
    const stats = this.getReviewStats(stories);
    const metrics = this.getPerformanceMetrics(stories);
    
    // Productivity insights
    if (stats.completionRate > 80) {
      insights.push({
        type: 'productivity',
        message: 'Excellent completion rate! You\'re very productive.',
        severity: 'low'
      });
    } else if (stats.completionRate < 40) {
      insights.push({
        type: 'productivity',
        message: 'Low completion rate. Consider breaking down stories into smaller tasks.',
        severity: 'high',
        recommendation: 'Focus on completing smaller, more manageable stories first'
      });
    }
    
    // Efficiency insights
    if (metrics.averageCompletionTime < 7) {
      insights.push({
        type: 'efficiency',
        message: 'Fast completion times! You\'re efficient at finishing stories.',
        severity: 'low'
      });
    } else if (metrics.averageCompletionTime > 30) {
      insights.push({
        type: 'efficiency',
        message: 'Long completion times. Consider setting more realistic deadlines.',
        severity: 'medium',
        recommendation: 'Break down complex stories into smaller milestones'
      });
    }
    
    // Prioritization insights
    const priorityDistribution = stats.storiesByPriority;
    const highPriorityCompleted = (priorityDistribution.Q1 || 0) + (priorityDistribution.Q2 || 0);
    const lowPriorityCompleted = (priorityDistribution.Q3 || 0) + (priorityDistribution.Q4 || 0);
    
    if (highPriorityCompleted > lowPriorityCompleted) {
      insights.push({
        type: 'prioritization',
        message: 'Great job focusing on high-priority stories!',
        severity: 'low'
      });
    } else {
      insights.push({
        type: 'prioritization',
        message: 'Consider prioritizing high-importance stories over low-priority ones.',
        severity: 'medium',
        recommendation: 'Use the Eisenhower Matrix to better categorize your stories'
      });
    }
    
    // Consistency insights
    if (metrics.consistency < 2) {
      insights.push({
        type: 'consistency',
        message: 'Very consistent completion pattern! Great job maintaining steady progress.',
        severity: 'low'
      });
    } else if (metrics.consistency > 5) {
      insights.push({
        type: 'consistency',
        message: 'Inconsistent completion pattern. Consider establishing a more regular routine.',
        severity: 'medium',
        recommendation: 'Set aside dedicated time blocks for story completion'
      });
    }
    
    return insights;
  }

  /**
   * Get completion analysis
   */
  static getCompletionAnalysis(stories: Story[]) {
    const stats = this.getReviewStats(stories);
    
    // Analyze completion patterns
    const completionPatterns = {
      byPriority: stats.storiesByPriority,
      byType: stats.storiesByType,
      averageTime: stats.averageCompletionTime,
      totalCompleted: stats.completedStories
    };
    
    // Get completion velocity (stories per week)
    const trends = this.getCompletionTrends(stories, 30);
    const weeklyVelocity = trends.slice(-7).reduce((sum, day) => sum + day.completions, 0);
    
    // Get completion consistency
    const dailyCompletions = trends.map(day => day.completions);
    const mean = dailyCompletions.reduce((sum, val) => sum + val, 0) / dailyCompletions.length;
    const variance = dailyCompletions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / dailyCompletions.length;
    const consistency = Math.sqrt(variance);
    
    return {
      patterns: completionPatterns,
      velocity: weeklyVelocity,
      consistency,
      trends: trends.slice(-14), // Last 2 weeks
      insights: this.getAdvancedInsights(stories)
    };
  }

  /**
   * Get productivity score
   */
  static getProductivityScore(stories: Story[]): number {
    const stats = this.getReviewStats(stories);
    const metrics = this.getPerformanceMetrics(stories);
    
    // Calculate score based on multiple factors
    let score = 0;
    
    // Completion rate (40% of score)
    score += (stats.completionRate / 100) * 40;
    
    // Efficiency (30% of score)
    const efficiencyScore = Math.max(0, 100 - (metrics.averageCompletionTime * 2));
    score += (efficiencyScore / 100) * 30;
    
    // Consistency (20% of score)
    const consistencyScore = Math.max(0, 100 - (metrics.consistency * 10));
    score += (consistencyScore / 100) * 20;
    
    // Velocity (10% of score)
    const velocityScore = Math.min(100, metrics.weeklyVelocity * 10);
    score += (velocityScore / 100) * 10;
    
    return Math.round(score);
  }

  /**
   * Get improvement recommendations
   */
  static getImprovementRecommendations(stories: Story[]): string[] {
    const recommendations: string[] = [];
    const stats = this.getReviewStats(stories);
    const metrics = this.getPerformanceMetrics(stories);
    
    if (stats.completionRate < 50) {
      recommendations.push('Focus on completing more stories by breaking them into smaller tasks');
    }
    
    if (metrics.averageCompletionTime > 20) {
      recommendations.push('Set more realistic deadlines and break down complex stories');
    }
    
    if (metrics.consistency > 3) {
      recommendations.push('Establish a more consistent daily routine for story completion');
    }
    
    if (metrics.weeklyVelocity < 2) {
      recommendations.push('Increase your completion velocity by focusing on high-impact stories');
    }
    
    const priorityDistribution = stats.storiesByPriority;
    const highPriorityCompleted = (priorityDistribution.Q1 || 0) + (priorityDistribution.Q2 || 0);
    const lowPriorityCompleted = (priorityDistribution.Q3 || 0) + (priorityDistribution.Q4 || 0);
    
    if (lowPriorityCompleted > highPriorityCompleted) {
      recommendations.push('Prioritize high-importance stories over low-priority ones');
    }
    
    return recommendations;
  }

  /**
   * Export review data
   */
  static exportData(stories: Story[], format: 'json' | 'csv' = 'json'): string {
    return exportReviewData(stories, format);
  }

  /**
   * Get review dashboard data
   */
  static getDashboardData(stories: Story[]) {
    const stats = this.getReviewStats(stories);
    const metrics = this.getPerformanceMetrics(stories);
    const insights = this.getAdvancedInsights(stories);
    const analysis = this.getCompletionAnalysis(stories);
    const productivityScore = this.getProductivityScore(stories);
    const recommendations = this.getImprovementRecommendations(stories);
    
    return {
      stats,
      metrics,
      insights,
      analysis,
      productivityScore,
      recommendations,
      trends: this.getCompletionTrends(stories, 30)
    };
  }
}
