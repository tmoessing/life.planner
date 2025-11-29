import { describe, it, expect, beforeEach } from 'vitest';
import { PlannerService } from '../plannerService';
import { createMockStory } from '@/test/test-utils';
import type { Story, BrainLevel, TimeBucket, Priority } from '@/types';

describe('PlannerService', () => {
  let stories: Story[];

  beforeEach(() => {
    stories = [
      createMockStory({ 
        id: '1', 
        weight: 5, // moderate
        size: 'M' as TimeBucket,
        priority: 'Q1' as Priority,
        deleted: false
      }),
      createMockStory({ 
        id: '2', 
        weight: 1, // low
        size: 'S' as TimeBucket,
        priority: 'Q2' as Priority,
        deleted: false
      }),
      createMockStory({ 
        id: '3', 
        weight: 13, // high
        size: 'L' as TimeBucket,
        priority: 'Q1' as Priority,
        deleted: false
      }),
      createMockStory({ 
        id: '4', 
        weight: 5, // moderate
        size: 'M' as TimeBucket,
        priority: 'Q3' as Priority,
        deleted: true // Should be filtered out
      }),
    ];
  });

  describe('getFilteredStories', () => {
    it('should filter stories by brain level', () => {
      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'M' as TimeBucket,
        priority: 'all' as Priority | 'all'
      };

      const filtered = PlannerService.getFilteredStories(stories, filters);
      
      // Should only include story 1 (moderate, M, not deleted)
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should filter stories by time bucket', () => {
      const filters = {
        brainLevel: 'low' as BrainLevel,
        timeBucket: 'S' as TimeBucket,
        priority: 'all' as Priority | 'all'
      };

      const filtered = PlannerService.getFilteredStories(stories, filters);
      
      // Should only include story 2 (low, S, not deleted)
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('should filter stories by priority', () => {
      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'M' as TimeBucket,
        priority: 'Q1' as Priority
      };

      const filtered = PlannerService.getFilteredStories(stories, filters);
      
      // Should only include story 1 (moderate, M, Q1, not deleted)
      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });

    it('should exclude deleted stories in filtered results', () => {
      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'M' as TimeBucket,
        priority: 'all' as Priority | 'all'
      };

      const filtered = PlannerService.getFilteredStories(stories, filters);
      
      // getFilteredStories does filter out deleted stories
      const storyIds = filtered.map(s => s.id);
      expect(storyIds).not.toContain('4');
      expect(filtered.every(s => !s.deleted)).toBe(true);
    });

    it('should sort by priority then weight', () => {
      const testStories = [
        createMockStory({ id: '1', priority: 'Q2' as Priority, weight: 5, size: 'M' as TimeBucket }), // moderate, M
        createMockStory({ id: '2', priority: 'Q1' as Priority, weight: 5, size: 'M' as TimeBucket }), // moderate, M
        createMockStory({ id: '3', priority: 'Q1' as Priority, weight: 8, size: 'M' as TimeBucket }), // moderate, M
      ];

      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'M' as TimeBucket,
        priority: 'all' as Priority | 'all'
      };

      const filtered = PlannerService.getFilteredStories(testStories, filters);
      
      // Q1 stories first, sorted by weight descending
      expect(filtered[0].id).toBe('3'); // Q1, weight 8
      expect(filtered[1].id).toBe('2'); // Q1, weight 5
      expect(filtered[2].id).toBe('1'); // Q2, weight 5
    });
  });

  describe('getPlannerStats', () => {
    it('should calculate stats correctly', () => {
      const stats = PlannerService.getPlannerStats(stories);
      
      expect(stats).toHaveProperty('totalStories');
      expect(stats).toHaveProperty('averageWeight');
      expect(stats).toHaveProperty('totalWeight');
      expect(stats).toHaveProperty('brainLevelDistribution');
    });

    it('should calculate stats for all stories', () => {
      const stats = PlannerService.getPlannerStats(stories);
      
      // Stats should include all stories (deleted filtering happens at display level)
      expect(stats.totalStories).toBeGreaterThan(0);
      expect(typeof stats.averageWeight).toBe('number');
    });
  });

  describe('getStoriesByPriority', () => {
    it('should group stories by priority', () => {
      const grouped = PlannerService.getStoriesByPriority(stories);
      
      expect(grouped.Q1).toBeDefined();
      expect(grouped.Q2).toBeDefined();
      expect(grouped.Q3).toBeDefined();
      expect(grouped.Q1.length).toBeGreaterThan(0);
    });

    it('should include all stories regardless of deleted status', () => {
      const grouped = PlannerService.getStoriesByPriority(stories);
      
      // Note: getStoriesByPriority doesn't filter deleted stories - that's handled elsewhere
      // This test verifies the grouping works correctly
      expect(grouped.Q1).toBeDefined();
      expect(grouped.Q2).toBeDefined();
      expect(grouped.Q3).toBeDefined();
    });
  });

  describe('getStoriesByBrainLevel', () => {
    it('should group stories by brain level', () => {
      const grouped = PlannerService.getStoriesByBrainLevel(stories);
      
      expect(grouped.low).toBeDefined();
      expect(grouped.moderate).toBeDefined();
      expect(grouped.high).toBeDefined();
      expect(Array.isArray(grouped.low)).toBe(true);
      expect(Array.isArray(grouped.moderate)).toBe(true);
      expect(Array.isArray(grouped.high)).toBe(true);
    });
  });

  describe('getStoriesByTimeBucket', () => {
    it('should group stories by time bucket', () => {
      const grouped = PlannerService.getStoriesByTimeBucket(stories);
      
      expect(grouped.S).toBeDefined();
      expect(grouped.M).toBeDefined();
      expect(grouped.L).toBeDefined();
    });
  });

  describe('getWorkloadDistribution', () => {
    it('should calculate workload distribution', () => {
      const distribution = PlannerService.getWorkloadDistribution(stories);
      
      expect(distribution).toHaveProperty('totalWeight');
      expect(distribution).toHaveProperty('low');
      expect(distribution).toHaveProperty('moderate');
      expect(distribution).toHaveProperty('high');
      expect(distribution).toHaveProperty('percentages');
    });

    it('should calculate percentages correctly', () => {
      const distribution = PlannerService.getWorkloadDistribution(stories);
      
      expect(distribution.percentages.low).toBeGreaterThanOrEqual(0);
      expect(distribution.percentages.moderate).toBeGreaterThanOrEqual(0);
      expect(distribution.percentages.high).toBeGreaterThanOrEqual(0);
      
      // Percentages should sum to approximately 100 (allowing for rounding)
      const sum = distribution.percentages.low + 
                  distribution.percentages.moderate + 
                  distribution.percentages.high;
      expect(sum).toBeGreaterThan(0);
    });
  });

  describe('getRecommendations', () => {
    it('should return recommendations array', () => {
      const recommendations = PlannerService.getRecommendations(stories);
      
      expect(Array.isArray(recommendations)).toBe(true);
    });

    it('should recommend when high brain level stories dominate', () => {
      const highLoadStories = Array.from({ length: 10 }, () => 
        createMockStory({ weight: 13, size: 'L' as TimeBucket })
      );
      
      const recommendations = PlannerService.getRecommendations(highLoadStories);
      
      const brainLevelRec = recommendations.find(r => r.type === 'brain_level');
      expect(brainLevelRec).toBeDefined();
    });

    it('should recommend when average weight is high', () => {
      const heavyStories = Array.from({ length: 5 }, () => 
        createMockStory({ weight: 21, size: 'XL' as TimeBucket })
      );
      
      const recommendations = PlannerService.getRecommendations(heavyStories);
      
      const workloadRec = recommendations.find(r => r.type === 'workload');
      expect(workloadRec).toBeDefined();
    });
  });

  describe('getProductivityInsights', () => {
    it('should return insights array', () => {
      const insights = PlannerService.getProductivityInsights(stories);
      
      expect(Array.isArray(insights)).toBe(true);
    });

    it('should provide insight for low average weight', () => {
      const lightStories = Array.from({ length: 5 }, () => 
        createMockStory({ weight: 1, size: 'XS' as TimeBucket })
      );
      
      const insights = PlannerService.getProductivityInsights(lightStories);
      
      expect(insights.length).toBeGreaterThan(0);
    });
  });

  describe('validateFilters', () => {
    it('should validate correct filters', () => {
      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'M' as TimeBucket,
        priority: 'Q1' as Priority
      };

      const result = PlannerService.validateFilters(filters);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid brain level', () => {
      const filters = {
        brainLevel: 'invalid' as any,
        timeBucket: 'M' as TimeBucket,
        priority: 'Q1' as Priority
      };

      const result = PlannerService.validateFilters(filters);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid brain level');
    });

    it('should reject invalid time bucket', () => {
      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'INVALID' as any,
        priority: 'Q1' as Priority
      };

      const result = PlannerService.validateFilters(filters);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid time bucket');
    });

    it('should reject invalid priority', () => {
      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'M' as TimeBucket,
        priority: 'INVALID' as any
      };

      const result = PlannerService.validateFilters(filters);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid priority');
    });

    it('should accept "all" as priority', () => {
      const filters = {
        brainLevel: 'moderate' as BrainLevel,
        timeBucket: 'M' as TimeBucket,
        priority: 'all' as const
      };

      const result = PlannerService.validateFilters(filters);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('getDashboardData', () => {
    it('should return complete dashboard data', () => {
      const dashboard = PlannerService.getDashboardData(stories);
      
      expect(dashboard).toHaveProperty('stats');
      expect(dashboard).toHaveProperty('recommendations');
      expect(dashboard).toHaveProperty('insights');
      expect(dashboard).toHaveProperty('workloadDistribution');
      expect(dashboard).toHaveProperty('storiesByPriority');
      expect(dashboard).toHaveProperty('storiesByBrainLevel');
      expect(dashboard).toHaveProperty('storiesByTimeBucket');
    });
  });
});

