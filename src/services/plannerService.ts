import type { Story, BrainLevel, TimeBucket, Priority } from '@/types';
import { 
  getBrainLevelWeights, 
  filterStoriesByBrainLevel, 
  filterStoriesByTimeBucket,
  sortStoriesByPriorityAndWeight,
  calculatePlannerStats,
  getOptimalPlannerSettings
} from '@/utils/plannerUtils';

export interface PlannerFilters {
  brainLevel: BrainLevel;
  timeBucket: TimeBucket;
  priority: Priority | 'all';
}

export interface PlannerRecommendation {
  type: 'brain_level' | 'time_bucket' | 'priority' | 'workload';
  message: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
}

export class PlannerService {
  /**
   * Get filtered stories based on planner filters
   */
  static getFilteredStories(stories: Story[], filters: PlannerFilters): Story[] {
    let filtered = stories.filter(story => !story.deleted);
    
    // Filter by brain level
    filtered = filterStoriesByBrainLevel(filtered, filters.brainLevel);
    
    // Filter by time bucket
    filtered = filterStoriesByTimeBucket(filtered, filters.timeBucket);
    
    // Filter by priority
    if (filters.priority !== 'all') {
      filtered = filtered.filter(story => story.priority === filters.priority);
    }
    
    // Sort by priority and weight
    return sortStoriesByPriorityAndWeight(filtered);
  }

  /**
   * Get planner statistics
   */
  static getPlannerStats(stories: Story[]): ReturnType<typeof calculatePlannerStats> {
    return calculatePlannerStats(stories);
  }

  /**
   * Get optimal planner settings based on story distribution
   */
  static getOptimalSettings(stories: Story[]): ReturnType<typeof getOptimalPlannerSettings> {
    return getOptimalPlannerSettings(stories);
  }

  /**
   * Get planner recommendations
   */
  static getRecommendations(stories: Story[]): PlannerRecommendation[] {
    const recommendations: PlannerRecommendation[] = [];
    const stats = this.getPlannerStats(stories);
    
    // Brain level recommendations
    if (stats.brainLevelDistribution.high > stats.brainLevelDistribution.low + stats.brainLevelDistribution.moderate) {
      recommendations.push({
        type: 'brain_level',
        message: 'You have many high-cognitive-load stories. Consider balancing with lighter tasks.',
        severity: 'medium',
        action: 'Add some low-weight stories to balance your workload'
      });
    }
    
    // Priority recommendations
    if (stats.priorityDistribution.Q4 > stats.priorityDistribution.Q1 + stats.priorityDistribution.Q2) {
      recommendations.push({
        type: 'priority',
        message: 'Many low-priority stories. Consider focusing on higher-priority items.',
        severity: 'high',
        action: 'Review and reprioritize your stories'
      });
    }
    
    // Workload recommendations
    if (stats.averageWeight > 10) {
      recommendations.push({
        type: 'workload',
        message: 'High average story weight. Consider breaking down complex stories.',
        severity: 'medium',
        action: 'Split large stories into smaller, manageable tasks'
      });
    }
    
    return recommendations;
  }

  /**
   * Get stories grouped by priority
   */
  static getStoriesByPriority(stories: Story[]): Record<Priority, Story[]> {
    return stories.reduce((groups, story) => {
      if (!groups[story.priority]) {
        groups[story.priority] = [];
      }
      groups[story.priority].push(story);
      return groups;
    }, {} as Record<Priority, Story[]>);
  }

  /**
   * Get stories grouped by brain level
   */
  static getStoriesByBrainLevel(stories: Story[]): Record<BrainLevel, Story[]> {
    const result: Record<BrainLevel, Story[]> = {
      low: [],
      moderate: [],
      high: []
    };
    
    stories.forEach(story => {
      const weights = getBrainLevelWeights('low');
      if (weights.includes(story.weight)) {
        result.low.push(story);
      }
      
      const moderateWeights = getBrainLevelWeights('moderate');
      if (moderateWeights.includes(story.weight)) {
        result.moderate.push(story);
      }
      
      const highWeights = getBrainLevelWeights('high');
      if (highWeights.includes(story.weight)) {
        result.high.push(story);
      }
    });
    
    return result;
  }

  /**
   * Get stories grouped by time bucket
   */
  static getStoriesByTimeBucket(stories: Story[]): Record<TimeBucket, Story[]> {
    return stories.reduce((groups, story) => {
      if (!groups[story.size as TimeBucket]) {
        groups[story.size as TimeBucket] = [];
      }
      groups[story.size as TimeBucket].push(story);
      return groups;
    }, {} as Record<TimeBucket, Story[]>);
  }

  /**
   * Get workload distribution
   */
  static getWorkloadDistribution(stories: Story[]) {
    const totalWeight = stories.reduce((sum, story) => sum + story.weight, 0);
    const brainLevels = this.getStoriesByBrainLevel(stories);
    
    return {
      totalWeight,
      low: brainLevels.low.reduce((sum, story) => sum + story.weight, 0),
      moderate: brainLevels.moderate.reduce((sum, story) => sum + story.weight, 0),
      high: brainLevels.high.reduce((sum, story) => sum + story.weight, 0),
      percentages: {
        low: totalWeight > 0 ? (brainLevels.low.reduce((sum, story) => sum + story.weight, 0) / totalWeight) * 100 : 0,
        moderate: totalWeight > 0 ? (brainLevels.moderate.reduce((sum, story) => sum + story.weight, 0) / totalWeight) * 100 : 0,
        high: totalWeight > 0 ? (brainLevels.high.reduce((sum, story) => sum + story.weight, 0) / totalWeight) * 100 : 0
      }
    };
  }

  /**
   * Get productivity insights
   */
  static getProductivityInsights(stories: Story[]) {
    const stats = this.getPlannerStats(stories);
    const insights: string[] = [];
    
    if (stats.averageWeight < 5) {
      insights.push('You prefer smaller, manageable tasks - great for consistent progress!');
    } else if (stats.averageWeight > 15) {
      insights.push('You tackle complex, high-impact stories - excellent for major achievements!');
    }
    
    if (stats.priorityDistribution.Q1 > stats.priorityDistribution.Q4) {
      insights.push('You focus on urgent and important tasks - great prioritization!');
    }
    
    if (stats.brainLevelDistribution.moderate > stats.brainLevelDistribution.low + stats.brainLevelDistribution.high) {
      insights.push('You maintain a balanced cognitive load - sustainable productivity!');
    }
    
    return insights;
  }

  /**
   * Validate planner filters
   */
  static validateFilters(filters: PlannerFilters) {
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
  }

  /**
   * Get planner dashboard data
   */
  static getDashboardData(stories: Story[]) {
    const stats = this.getPlannerStats(stories);
    const recommendations = this.getRecommendations(stories);
    const insights = this.getProductivityInsights(stories);
    const workloadDistribution = this.getWorkloadDistribution(stories);
    
    return {
      stats,
      recommendations,
      insights,
      workloadDistribution,
      storiesByPriority: this.getStoriesByPriority(stories),
      storiesByBrainLevel: this.getStoriesByBrainLevel(stories),
      storiesByTimeBucket: this.getStoriesByTimeBucket(stories)
    };
  }
}
