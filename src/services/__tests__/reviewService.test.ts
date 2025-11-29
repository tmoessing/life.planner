import { describe, it, expect, beforeEach } from 'vitest';
import { ReviewService } from '../reviewService';
import { createMockStory } from '@/test/test-utils';
import type { Story, Priority, StoryType } from '@/types';

describe('ReviewService', () => {
  let stories: Story[];

  beforeEach(() => {
    stories = [
      createMockStory({ 
        id: '1', 
        title: 'Completed Story',
        status: 'done',
        priority: 'Q1' as Priority,
        type: 'Intellectual' as StoryType,
        updatedAt: new Date().toISOString(),
        deleted: false
      }),
      createMockStory({ 
        id: '2', 
        title: 'Incomplete Story',
        status: 'todo',
        priority: 'Q2' as Priority,
        type: 'Physical' as StoryType,
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        deleted: false
      }),
      createMockStory({ 
        id: '3', 
        title: 'Checklist Complete',
        status: 'progress',
        priority: 'Q1' as Priority,
        type: 'Intellectual' as StoryType,
        checklist: [
          { id: '1', text: 'Task 1', done: true },
          { id: '2', text: 'Task 2', done: true }
        ],
        updatedAt: new Date().toISOString(),
        deleted: false
      }),
      createMockStory({ 
        id: '4', 
        title: 'Deleted Story',
        status: 'done',
        deleted: true
      }),
    ];
  });

  describe('getFilteredStories', () => {
    it('should filter by completion status', () => {
      const filters = {
        searchTerm: '',
        priority: 'all' as Priority | 'all',
        type: 'all' as StoryType | 'all',
        dateRange: 'all' as const,
        completionStatus: 'completed' as const
      };

      const filtered = ReviewService.getFilteredStories(stories, filters);
      
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.every(s => s.status === 'done' || s.checklist.every(item => item.done))).toBe(true);
    });

    it('should filter by search term', () => {
      const filters = {
        searchTerm: 'Completed',
        priority: 'all' as Priority | 'all',
        type: 'all' as StoryType | 'all',
        dateRange: 'all' as const,
        completionStatus: 'all' as const
      };

      const filtered = ReviewService.getFilteredStories(stories, filters);
      
      expect(filtered.every(s => 
        s.title.toLowerCase().includes('completed') || 
        s.description.toLowerCase().includes('completed')
      )).toBe(true);
    });

    it('should filter by priority', () => {
      const filters = {
        searchTerm: '',
        priority: 'Q1' as Priority,
        type: 'all' as StoryType | 'all',
        dateRange: 'all' as const,
        completionStatus: 'all' as const
      };

      const filtered = ReviewService.getFilteredStories(stories, filters);
      
      expect(filtered.every(s => s.priority === 'Q1')).toBe(true);
    });

    it('should filter by type', () => {
      const filters = {
        searchTerm: '',
        priority: 'all' as Priority | 'all',
        type: 'Intellectual' as StoryType,
        dateRange: 'all' as const,
        completionStatus: 'all' as const
      };

      const filtered = ReviewService.getFilteredStories(stories, filters);
      
      expect(filtered.every(s => s.type === 'Intellectual')).toBe(true);
    });

    it('should filter by date range', () => {
      const filters = {
        searchTerm: '',
        priority: 'all' as Priority | 'all',
        type: 'all' as StoryType | 'all',
        dateRange: 'week' as const,
        completionStatus: 'all' as const
      };

      const filtered = ReviewService.getFilteredStories(stories, filters);
      
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filtered.forEach(story => {
        expect(new Date(story.updatedAt).getTime()).toBeGreaterThanOrEqual(weekAgo.getTime());
      });
    });

    it('should exclude deleted stories', () => {
      const filters = {
        searchTerm: '',
        priority: 'all' as Priority | 'all',
        type: 'all' as StoryType | 'all',
        dateRange: 'all' as const,
        completionStatus: 'all' as const
      };

      const filtered = ReviewService.getFilteredStories(stories, filters);
      
      const storyIds = filtered.map(s => s.id);
      expect(storyIds).not.toContain('4');
    });
  });

  describe('getReviewStats', () => {
    it('should calculate review stats', () => {
      const stats = ReviewService.getReviewStats(stories);
      
      expect(stats).toHaveProperty('totalStories');
      expect(stats).toHaveProperty('completedStories');
      expect(stats).toHaveProperty('completionRate');
      expect(typeof stats.completionRate).toBe('number');
    });

    it('should calculate completion rate', () => {
      const stats = ReviewService.getReviewStats(stories);
      
      if (stats.totalStories > 0) {
        expect(stats.completionRate).toBeGreaterThanOrEqual(0);
        expect(stats.completionRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('getCompletionTrends', () => {
    it('should return completion trends', () => {
      const trends = ReviewService.getCompletionTrends(stories, 30);
      
      expect(Array.isArray(trends)).toBe(true);
    });
  });

  describe('getProductivityInsights', () => {
    it('should return productivity insights', () => {
      const insights = ReviewService.getProductivityInsights(stories);
      
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', () => {
      const metrics = ReviewService.getPerformanceMetrics(stories);
      
      expect(metrics).toBeDefined();
      expect(typeof metrics).toBe('object');
    });
  });

  describe('getAdvancedInsights', () => {
    it('should return advanced insights', () => {
      const insights = ReviewService.getAdvancedInsights(stories);
      
      expect(Array.isArray(insights)).toBe(true);
    });
  });

  describe('getImprovementRecommendations', () => {
    it('should return improvement recommendations', () => {
      const recommendations = ReviewService.getImprovementRecommendations(stories);
      
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });

  describe('exportData', () => {
    it('should export data as JSON', () => {
      const data = ReviewService.exportData(stories, 'json');
      
      expect(typeof data).toBe('string');
      expect(() => JSON.parse(data)).not.toThrow();
    });

    it('should export data as CSV', () => {
      const data = ReviewService.exportData(stories, 'csv');
      
      expect(typeof data).toBe('string');
      expect(data).toContain(',');
    });
  });

  describe('getDashboardData', () => {
    it('should return complete dashboard data', () => {
      const dashboard = ReviewService.getDashboardData(stories);
      
      expect(dashboard).toHaveProperty('stats');
      expect(dashboard).toHaveProperty('insights');
      expect(dashboard).toHaveProperty('recommendations');
    });
  });
});

