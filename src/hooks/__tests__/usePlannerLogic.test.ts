import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlannerLogic } from '../usePlannerLogic';
import { createMockStory, createMockSettings } from '@/test/test-utils';
import type { Story, BrainLevel, TimeBucket, Priority } from '@/types';

describe('usePlannerLogic', () => {
  let stories: Story[];
  let settings: ReturnType<typeof createMockSettings>;

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

    settings = createMockSettings();
  });

  describe('initial state', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      expect(result.current.filters).toEqual({
        brainLevel: 'moderate',
        timeBucket: 'M',
        priority: 'all'
      });
    });

    it('should filter stories by default brain level and time bucket', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      // Should only include story 1 (moderate brain level, M size, not deleted)
      expect(result.current.filteredStories).toHaveLength(1);
      expect(result.current.filteredStories[0].id).toBe('1');
    });
  });

  describe('filter updates', () => {
    it('should update brain level filter', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      act(() => {
        result.current.updateFilter('brainLevel', 'low');
        result.current.updateFilter('timeBucket', 'S'); // Also need to match time bucket
      });

      expect(result.current.filters.brainLevel).toBe('low');
      // Should include story 2 (low brain level, S size)
      expect(result.current.filteredStories).toHaveLength(1);
      expect(result.current.filteredStories[0].id).toBe('2');
    });

    it('should update time bucket filter', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      act(() => {
        result.current.updateFilter('brainLevel', 'low'); // Need to match brain level too
        result.current.updateFilter('timeBucket', 'S');
      });

      expect(result.current.filters.timeBucket).toBe('S');
      // Should include story 2 (low brain level, S size)
      expect(result.current.filteredStories).toHaveLength(1);
      expect(result.current.filteredStories[0].id).toBe('2');
    });

    it('should update priority filter', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      act(() => {
        result.current.updateFilter('priority', 'Q1');
      });

      expect(result.current.filters.priority).toBe('Q1');
      // Should only include story 1 (moderate, M, Q1)
      expect(result.current.filteredStories).toHaveLength(1);
      expect(result.current.filteredStories[0].id).toBe('1');
    });

    it('should reset filters to default', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      act(() => {
        result.current.updateFilter('brainLevel', 'high');
        result.current.updateFilter('timeBucket', 'L');
        result.current.updateFilter('priority', 'Q1');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        brainLevel: 'moderate',
        timeBucket: 'M',
        priority: 'all'
      });
    });
  });

  describe('filtered stories', () => {
    it('should exclude deleted stories', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      // Story 4 is deleted, should not appear
      const storyIds = result.current.filteredStories.map(s => s.id);
      expect(storyIds).not.toContain('4');
    });

    it('should sort by priority first, then by weight descending', () => {
      const testStories = [
        createMockStory({ id: '1', priority: 'Q2' as Priority, weight: 5, size: 'M' as TimeBucket }), // moderate, M
        createMockStory({ id: '2', priority: 'Q1' as Priority, weight: 8, size: 'M' as TimeBucket }), // moderate, M
        createMockStory({ id: '3', priority: 'Q1' as Priority, weight: 5, size: 'M' as TimeBucket }), // moderate, M
      ];

      const { result } = renderHook(() => usePlannerLogic(testStories, settings));

      act(() => {
        result.current.updateFilter('priority', 'all');
      });

      const filtered = result.current.filteredStories;
      // Q1 stories should come first, sorted by weight descending
      expect(filtered[0].id).toBe('2'); // Q1, weight 8
      expect(filtered[1].id).toBe('3'); // Q1, weight 5
      expect(filtered[2].id).toBe('1'); // Q2, weight 5
    });
  });

  describe('stories by priority', () => {
    it('should group filtered stories by priority', () => {
      const testStories = [
        createMockStory({ id: '1', priority: 'Q1' as Priority, weight: 5, size: 'M' as TimeBucket }),
        createMockStory({ id: '2', priority: 'Q1' as Priority, weight: 8, size: 'M' as TimeBucket }),
        createMockStory({ id: '3', priority: 'Q2' as Priority, weight: 5, size: 'M' as TimeBucket }),
      ];

      const { result } = renderHook(() => usePlannerLogic(testStories, settings));

      act(() => {
        result.current.updateFilter('priority', 'all');
      });

      expect(result.current.storiesByPriority.Q1).toHaveLength(2);
      expect(result.current.storiesByPriority.Q2).toHaveLength(1);
    });
  });

  describe('stats', () => {
    it('should calculate total stories correctly', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      expect(result.current.stats.totalStories).toBe(1); // Only story 1 matches default filters
    });

    it('should calculate average weight correctly', () => {
      const testStories = [
        createMockStory({ id: '1', weight: 5, size: 'M' as TimeBucket }), // moderate, M - matches default filters
        createMockStory({ id: '2', weight: 8, size: 'M' as TimeBucket }), // moderate, M - matches default filters
      ];

      const { result } = renderHook(() => usePlannerLogic(testStories, settings));

      // Both stories match default filters (moderate brain level, M size)
      // Average of 5 and 8 is 6.5
      expect(result.current.stats.averageWeight).toBe(6.5);
    });

    it('should calculate brain level distribution', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      expect(result.current.stats.brainLevelDistribution).toHaveProperty('low');
      expect(result.current.stats.brainLevelDistribution).toHaveProperty('moderate');
      expect(result.current.stats.brainLevelDistribution).toHaveProperty('high');
    });
  });

  describe('helper functions', () => {
    it('should get story color from weight', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));
      const story = createMockStory({ weight: 5 });

      const color = result.current.getStoryColor(story);
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });

    it('should get priority color from settings', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      const color = result.current.getPriorityColor('Q1');
      expect(color).toBe(settings.priorityColors?.Q1 || '#6B7280');
    });

    it('should get brain level description', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      expect(result.current.getBrainLevelDescription('low')).toContain('Light');
      expect(result.current.getBrainLevelDescription('moderate')).toContain('Balanced');
      expect(result.current.getBrainLevelDescription('high')).toContain('High');
    });

    it('should get time bucket description', () => {
      const { result } = renderHook(() => usePlannerLogic(stories, settings));

      expect(result.current.getTimeBucketDescription('XS')).toContain('15 minutes');
      expect(result.current.getTimeBucketDescription('M')).toContain('1 hour');
      expect(result.current.getTimeBucketDescription('XL')).toContain('1+ days');
    });
  });
});

