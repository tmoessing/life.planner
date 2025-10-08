// Story weight options
export const STORY_WEIGHTS = [1, 3, 5, 8, 13, 21] as const;

// Story types
export const STORY_TYPES = ['Spiritual', 'Physical', 'Intellectual', 'Social'] as const;

// Default column configuration
export const DEFAULT_COLUMNS = [
  { id: 'icebox', name: 'Icebox' as const, storyIds: [] },
  { id: 'backlog', name: 'Backlog' as const, storyIds: [] },
  { id: 'todo', name: 'To Do' as const, storyIds: [] },
  { id: 'progress', name: 'In Progress' as const, storyIds: [] },
  { id: 'review', name: 'Review' as const, storyIds: [] },
  { id: 'done', name: 'Done' as const, storyIds: [] }
];

// Default board configuration
export const DEFAULT_BOARD = {
  id: 'main-board',
  name: 'Main Board',
  columns: ['icebox', 'backlog', 'todo', 'progress', 'review', 'done']
};
