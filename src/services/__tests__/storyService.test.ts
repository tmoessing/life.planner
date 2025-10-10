import { describe, it, expect } from 'vitest';
import { StoryService } from '../storyService';
import { createMockStory } from '../../test/test-utils';

describe('StoryService', () => {
  const mockStories = [
    createMockStory({ id: '1', priority: 'Q1', type: 'Intellectual', weight: 5 as const, status: 'done' }),
    createMockStory({ id: '2', priority: 'Q2', type: 'Physical', weight: 8 as const, status: 'progress' }),
    createMockStory({ id: '3', priority: 'Q1', type: 'Social', weight: 3 as const, status: 'backlog' }),
    createMockStory({ id: '4', priority: 'Q3', type: 'Intellectual', weight: 13 as const, status: 'done' }),
  ];

  describe('filterStories', () => {
    it('should filter stories by priority', () => {
      const filters = {
        priority: 'Q1' as const,
        type: 'all' as const,
        roleId: 'all' as const,
        visionId: 'all' as const,
        goalId: 'all' as const,
        projectId: 'all' as const,
        weight: 'all' as const,
        size: 'all' as const,
        status: 'all' as const,
        location: 'all' as const,
        dueDate: 'all' as const,
        scheduledDate: 'all' as const,
        sprintId: 'all' as const
      };

      const filtered = StoryService.filterStories(mockStories, filters);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(story => story.priority === 'Q1')).toBe(true);
    });

    it('should filter stories by type', () => {
      const filters = {
        priority: 'all' as const,
        type: 'Intellectual' as const,
        roleId: 'all' as const,
        visionId: 'all' as const,
        goalId: 'all' as const,
        projectId: 'all' as const,
        weight: 'all' as const,
        size: 'all' as const,
        status: 'all' as const,
        location: 'all' as const,
        dueDate: 'all' as const,
        scheduledDate: 'all' as const,
        sprintId: 'all' as const
      };

      const filtered = StoryService.filterStories(mockStories, filters);
      expect(filtered).toHaveLength(2);
      expect(filtered.every(story => story.type === 'Intellectual')).toBe(true);
    });

    it('should filter stories by weight', () => {
      const filters = {
        priority: 'all' as const,
        type: 'all' as const,
        roleId: 'all' as const,
        visionId: 'all' as const,
        goalId: 'all' as const,
        projectId: 'all' as const,
        weight: 5 as const,
        size: 'all' as const,
        status: 'all' as const,
        location: 'all' as const,
        dueDate: 'all' as const,
        scheduledDate: 'all' as const,
        sprintId: 'all' as const
      };

      const filtered = StoryService.filterStories(mockStories, filters);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].weight).toBe(5);
    });

    it('should return all stories when all filters are "all"', () => {
      const filters = {
        priority: 'all' as const,
        type: 'all' as const,
        roleId: 'all' as const,
        visionId: 'all' as const,
        goalId: 'all' as const,
        projectId: 'all' as const,
        weight: 'all' as const,
        size: 'all' as const,
        status: 'all' as const,
        location: 'all' as const,
        dueDate: 'all' as const,
        scheduledDate: 'all' as const,
        sprintId: 'all' as const
      };

      const filtered = StoryService.filterStories(mockStories, filters);
      expect(filtered).toHaveLength(4);
    });
  });

  describe('groupStoriesBy', () => {
    it('should group stories by priority', () => {
      const grouped = StoryService.groupStoriesBy(mockStories, 'priority');
      
      expect(grouped['Q1']).toHaveLength(2);
      expect(grouped['Q2']).toHaveLength(1);
      expect(grouped['Q3']).toHaveLength(1);
    });

    it('should group stories by type', () => {
      const grouped = StoryService.groupStoriesBy(mockStories, 'type');
      
      expect(grouped['Intellectual']).toHaveLength(2);
      expect(grouped['Physical']).toHaveLength(1);
      expect(grouped['Social']).toHaveLength(1);
    });

    it('should group stories by weight', () => {
      const grouped = StoryService.groupStoriesBy(mockStories, 'weight');
      
      expect(grouped['5']).toHaveLength(1);
      expect(grouped['8']).toHaveLength(1);
      expect(grouped['3']).toHaveLength(1);
      expect(grouped['13']).toHaveLength(1);
    });
  });

  describe('sortStoriesByPriority', () => {
    it('should sort stories by priority and weight', () => {
      const sorted = StoryService.sortStoriesByPriority(mockStories);
      
      expect(sorted[0].priority).toBe('Q1');
      expect(sorted[1].priority).toBe('Q1');
      expect(sorted[2].priority).toBe('Q2');
      expect(sorted[3].priority).toBe('Q3');
    });
  });

  describe('getStoryStats', () => {
    it('should calculate correct statistics', () => {
      const stats = StoryService.getStoryStats(mockStories);
      
      expect(stats.total).toBe(4);
      expect(stats.completed).toBe(2);
      expect(stats.inProgress).toBe(1);
      expect(stats.backlog).toBe(1);
      expect(stats.completionRate).toBe(50);
    });
  });

  describe('getStoriesBySprint', () => {
    it('should filter stories by sprint ID', () => {
      const storiesWithSprint = [
        ...mockStories,
        createMockStory({ id: '5', sprintId: 'sprint-1' })
      ];
      
      const sprintStories = StoryService.getStoriesBySprint(storiesWithSprint, 'sprint-1');
      expect(sprintStories).toHaveLength(1);
      expect(sprintStories[0].sprintId).toBe('sprint-1');
    });

    it('should return unassigned stories when no sprint ID provided', () => {
      const unassignedStories = StoryService.getStoriesBySprint(mockStories);
      expect(unassignedStories).toHaveLength(4);
    });
  });

  describe('getStoriesByStatus', () => {
    it('should filter stories by status', () => {
      const doneStories = StoryService.getStoriesByStatus(mockStories, 'done');
      expect(doneStories).toHaveLength(2);
      expect(doneStories.every(story => story.status === 'done')).toBe(true);
    });
  });

  describe('searchStories', () => {
    it('should search stories by title', () => {
      const storiesWithTitles = [
        createMockStory({ id: '1', title: 'Learn React' }),
        createMockStory({ id: '2', title: 'Build App' }),
        createMockStory({ id: '3', title: 'React Tutorial' }),
      ];
      
      const results = StoryService.searchStories(storiesWithTitles, 'React');
      expect(results).toHaveLength(2);
      expect(results.every(story => story.title.includes('React'))).toBe(true);
    });

    it('should search stories by description', () => {
      const storiesWithDescriptions = [
        createMockStory({ id: '1', description: 'Learn React framework' }),
        createMockStory({ id: '2', description: 'Build mobile app' }),
        createMockStory({ id: '3', description: 'React development' }),
      ];
      
      const results = StoryService.searchStories(storiesWithDescriptions, 'React');
      expect(results).toHaveLength(2);
    });

    it('should return all stories for empty search', () => {
      const results = StoryService.searchStories(mockStories, '');
      expect(results).toHaveLength(4);
    });
  });

  describe('getDueSoonStories', () => {
    it('should return stories due within specified days', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      const storiesWithDueDates = [
        createMockStory({ id: '1', dueDate: tomorrow }),
        createMockStory({ id: '2', dueDate: nextWeek }),
        createMockStory({ id: '3', dueDate: nextMonth }),
      ];
      
      const dueSoon = StoryService.getDueSoonStories(storiesWithDueDates, 7);
      expect(dueSoon).toHaveLength(2);
    });
  });

  describe('getOverdueStories', () => {
    it('should return overdue stories', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      
      const storiesWithDueDates = [
        createMockStory({ id: '1', dueDate: yesterday, status: 'progress' }),
        createMockStory({ id: '2', dueDate: lastWeek, status: 'todo' }),
        createMockStory({ id: '3', dueDate: yesterday, status: 'done' }),
      ];
      
      const overdue = StoryService.getOverdueStories(storiesWithDueDates);
      expect(overdue).toHaveLength(2);
      expect(overdue.every(story => story.status !== 'done')).toBe(true);
    });
  });
});
