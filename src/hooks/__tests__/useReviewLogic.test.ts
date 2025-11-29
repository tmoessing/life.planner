import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReviewLogic } from '../useReviewLogic';
import { createMockStory, createMockSettings } from '@/test/test-utils';
import type { Story, Priority, StoryType } from '@/types';

describe('useReviewLogic', () => {
  let stories: Story[];
  let settings: ReturnType<typeof createMockSettings>;

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
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago
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

    settings = createMockSettings();
  });

  describe('initial state', () => {
    it('should initialize with default filters', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      expect(result.current.filters).toEqual({
        searchTerm: '',
        priority: 'all',
        type: 'all',
        dateRange: 'all',
        completionStatus: 'all'
      });
    });

    it('should filter to completed stories by default', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      // Should include stories 1 and 3 (both completed)
      expect(result.current.filteredStories.length).toBeGreaterThan(0);
      const storyIds = result.current.filteredStories.map(s => s.id);
      expect(storyIds).toContain('1');
      expect(storyIds).toContain('3');
      expect(storyIds).not.toContain('2'); // Incomplete
      expect(storyIds).not.toContain('4'); // Deleted
    });
  });

  describe('filter updates', () => {
    it('should update search term filter', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      act(() => {
        result.current.updateFilter('searchTerm', 'Completed');
      });

      expect(result.current.filters.searchTerm).toBe('Completed');
      const filtered = result.current.filteredStories;
      expect(filtered.every(s => s.title.includes('Completed') || s.description.includes('Completed'))).toBe(true);
    });

    it('should update priority filter', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      act(() => {
        result.current.updateFilter('priority', 'Q1');
      });

      expect(result.current.filters.priority).toBe('Q1');
      const filtered = result.current.filteredStories;
      expect(filtered.every(s => s.priority === 'Q1')).toBe(true);
    });

    it('should update type filter', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      act(() => {
        result.current.updateFilter('type', 'Intellectual');
      });

      expect(result.current.filters.type).toBe('Intellectual');
      const filtered = result.current.filteredStories;
      expect(filtered.every(s => s.type === 'Intellectual')).toBe(true);
    });

    it('should update date range filter', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      act(() => {
        result.current.updateFilter('dateRange', 'week');
      });

      expect(result.current.filters.dateRange).toBe('week');
      // Should only include stories updated in the last week
      const filtered = result.current.filteredStories;
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      filtered.forEach(story => {
        expect(new Date(story.updatedAt).getTime()).toBeGreaterThanOrEqual(weekAgo.getTime());
      });
    });

    it('should reset filters to default', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      act(() => {
        result.current.updateFilter('searchTerm', 'test');
        result.current.updateFilter('priority', 'Q1');
        result.current.updateFilter('type', 'Intellectual');
        result.current.updateFilter('dateRange', 'month');
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        searchTerm: '',
        priority: 'all',
        type: 'all',
        dateRange: 'all',
        completionStatus: 'all'
      });
    });
  });

  describe('completed stories detection', () => {
    it('should identify stories with status "done" as completed', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      const completed = result.current.filteredStories;
      const doneStory = completed.find(s => s.id === '1');
      expect(doneStory).toBeDefined();
      expect(doneStory?.status).toBe('done');
    });

    it('should identify stories with all checklist items done as completed', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      const completed = result.current.filteredStories;
      const checklistStory = completed.find(s => s.id === '3');
      expect(checklistStory).toBeDefined();
      expect(checklistStory?.checklist.every(item => item.done)).toBe(true);
    });

    it('should exclude deleted stories', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      const filtered = result.current.filteredStories;
      const storyIds = filtered.map(s => s.id);
      expect(storyIds).not.toContain('4');
    });
  });

  describe('stats', () => {
    it('should calculate review stats', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      expect(result.current.stats).toHaveProperty('totalStories');
      expect(result.current.stats).toHaveProperty('completedStories');
      expect(result.current.stats).toHaveProperty('completionRate');
      expect(typeof result.current.stats.completionRate).toBe('number');
    });

    it('should calculate completion rate correctly', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      const stats = result.current.stats;
      if (stats.totalStories > 0) {
        expect(stats.completionRate).toBeGreaterThanOrEqual(0);
        expect(stats.completionRate).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('helper functions', () => {
    it('should get task category color', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));
      const story = createMockStory({ taskCategories: ['Decisions'] });

      const color = result.current.getTaskCategoryColor('Decisions');
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });

    it('should get priority color', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      const color = result.current.getPriorityColor('Q1');
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });

    it('should get type color', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));

      const color = result.current.getTypeColor('Intellectual');
      expect(color).toBeTruthy();
      expect(typeof color).toBe('string');
    });

    it('should calculate completion percentage', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));
      const story = createMockStory({
        checklist: [
          { id: '1', text: 'Task 1', done: true },
          { id: '2', text: 'Task 2', done: false }
        ]
      });

      const percentage = result.current.getCompletionPercentage(story);
      expect(percentage).toBe(50);
    });

    it('should calculate story age', () => {
      const { result } = renderHook(() => useReviewLogic(stories, settings));
      const oldStory = createMockStory({
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
      });

      const age = result.current.getStoryAge(oldStory);
      expect(age).toBeGreaterThan(0);
    });
  });
});

