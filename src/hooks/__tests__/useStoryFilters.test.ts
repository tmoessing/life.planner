import { renderHook, act } from '@testing-library/react';
import { useStoryFilters } from '../useStoryFilters';
import { createMockStory } from '../../test/test-utils';

describe('useStoryFilters', () => {
  const mockStories = [
    createMockStory({ id: '1', priority: 'Q1', type: 'Intellectual', weight: 5 }),
    createMockStory({ id: '2', priority: 'Q2', type: 'Physical', weight: 8 }),
    createMockStory({ id: '3', priority: 'Q1', type: 'Social', weight: 3 }),
  ];

  it('should initialize with default filters', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    expect(result.current.filters).toEqual({
      priority: 'all',
      type: 'all',
      roleId: 'all',
      visionId: 'all',
      goalId: 'all',
      projectId: 'all',
      weight: 'all',
      size: 'all',
      status: 'all',
      location: 'all',
      dueDate: 'all',
      scheduledDate: 'all',
      sprintId: 'all'
    });
  });

  it('should update filters correctly', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    act(() => {
      result.current.updateFilter('priority', 'Q1');
    });
    
    expect(result.current.filters.priority).toBe('Q1');
  });

  it('should reset filters to default', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    act(() => {
      result.current.updateFilter('priority', 'Q1');
      result.current.updateFilter('type', 'Intellectual');
    });
    
    act(() => {
      result.current.resetFilters();
    });
    
    expect(result.current.filters.priority).toBe('all');
    expect(result.current.filters.type).toBe('all');
  });

  it('should filter stories by priority', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    act(() => {
      result.current.updateFilter('priority', 'Q1');
    });
    
    const filtered = result.current.applyFilters(mockStories);
    expect(filtered).toHaveLength(2);
    expect(filtered.every(story => story.priority === 'Q1')).toBe(true);
  });

  it('should filter stories by type', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    act(() => {
      result.current.updateFilter('type', 'Intellectual');
    });
    
    const filtered = result.current.applyFilters(mockStories);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].type).toBe('Intellectual');
  });

  it('should filter stories by weight', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    act(() => {
      result.current.updateFilter('weight', 5);
    });
    
    const filtered = result.current.applyFilters(mockStories);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].weight).toBe(5);
  });

  it('should detect active filters', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    expect(result.current.hasActiveFilters).toBe(false);
    
    act(() => {
      result.current.updateFilter('priority', 'Q1');
    });
    
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it('should apply multiple filters', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    act(() => {
      result.current.updateFilter('priority', 'Q1');
      result.current.updateFilter('type', 'Intellectual');
    });
    
    const filtered = result.current.applyFilters(mockStories);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].priority).toBe('Q1');
    expect(filtered[0].type).toBe('Intellectual');
  });

  it('should handle empty stories array', () => {
    const { result } = renderHook(() => useStoryFilters());
    
    const filtered = result.current.applyFilters([]);
    expect(filtered).toHaveLength(0);
  });

  it('should filter out deleted stories', () => {
    const storiesWithDeleted = [
      ...mockStories,
      createMockStory({ id: '4', deleted: true })
    ];
    
    const { result } = renderHook(() => useStoryFilters());
    
    const filtered = result.current.applyFilters(storiesWithDeleted);
    expect(filtered).toHaveLength(3);
    expect(filtered.every(story => !story.deleted)).toBe(true);
  });
});
