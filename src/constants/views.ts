// View types
export const VIEW_TYPES = [
  'sprint',
  'story-boards', 
  'importance',
  'goals',
  'goals-kanban',
  'bucketlist',
  'planner',
  'sprint-planning',
  'sprint-review',
  'add-stories',
  'add-goals',
  'add-projects',
  'add-bucketlist',
  'projects',
  'projects-kanban',
  'project-product-management',
] as const;

export type ViewType = typeof VIEW_TYPES[number];
