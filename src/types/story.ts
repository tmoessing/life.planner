import type { Priority, StoryType } from './index';

export interface StoryFilters {
  priority: Priority | 'all';
  type: StoryType | 'all';
  roleId: string | 'all';
  visionId: string | 'all';
  goalId: string | 'all';
  projectId: string | 'all';
  weight: number | 'all';
  size: string | 'all';
  status: string | 'all';
  location: string | 'all';
  dueDate: string | 'all';
  scheduledDate: string | 'all';
  sprintId: string | 'all';
  showDone: boolean;
}

export interface StoryStats {
  total: number;
  completed: number;
  inProgress: number;
  backlog: number;
  completionRate: number;
  priorityStats: Record<Priority, number>;
  typeStats: Record<StoryType, number>;
  weightStats: Record<number, number>;
}

export interface StoryProgress {
  completed: number;
  total: number;
  percentage: number;
}

export interface StoryGroup {
  key: string;
  stories: import('./index').Story[];
  count: number;
}

export interface StorySortOptions {
  field: 'priority' | 'weight' | 'title' | 'dueDate' | 'createdAt' | 'updatedAt';
  direction: 'asc' | 'desc';
}

export interface StorySearchOptions {
  text: string;
  includeDescription: boolean;
  caseSensitive: boolean;
}

export interface StoryFilterOptions {
  dateRange?: {
    start: Date;
    end: Date;
    field: 'dueDate' | 'scheduledDate' | 'createdAt' | 'updatedAt';
  };
  weightRange?: {
    min: number;
    max: number;
  };
  hasChecklist?: boolean;
  checklistComplete?: boolean;
  hasLocation?: boolean;
  hasLabels?: boolean;
  hasTaskCategories?: boolean;
}

export interface StoryBoardConfig {
  type: 'Priority' | 'Role' | 'Type' | 'Vision' | 'Weight' | 'Size' | 'Status' | 'Project' | 'Task Categories' | 'Location';
  viewType: 'list' | 'pie';
  showStats: boolean;
  showFilters: boolean;
  groupBy: string;
  sortBy: StorySortOptions;
}

export interface StoryCardProps {
  story: import('./index').Story;
  roles: Array<{ id: string; name: string }>;
  labels: Array<{ id: string; name: string; color: string }>;
  visions: Array<{ id: string; name: string }>;
  goals: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  settings: any;
  onEdit?: (story: import('./index').Story) => void;
  onDelete?: (storyId: string) => void;
  onSelect?: (storyId: string, index: number, event: React.MouseEvent) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  showActions?: boolean;
  className?: string;
}

export interface StoryFormData {
  title: string;
  description: string;
  priority: string;
  type: string;
  size: string;
  weight: number;
  roleId?: string;
  location?: string;
  sprintId?: string;
  labels: string[];
  status: string;
  visionId?: string;
  projectId?: string;
  dueDate?: string;
  taskCategories: string[];
  scheduledDate?: string;
  goalId?: string;
}

export interface StoryDragState {
  draggedStoryId: string | null;
  dragOverTargetId: string | null;
  dragOverTargetType: 'sprint' | 'board' | 'column' | null;
}

export interface StorySelectionState {
  selectedStoryIds: Set<string>;
  lastSelectedIndex: number | null;
}

export interface StoryUndoAction {
  type: 'delete' | 'move' | 'update';
  storyId: string;
  previousSprintId?: string;
  story?: import('./index').Story;
  previousData?: Partial<import('./index').Story>;
}

export interface StoryBulkAction {
  type: 'delete' | 'move' | 'update' | 'assign';
  storyIds: string[];
  data?: Partial<import('./index').Story>;
  targetSprintId?: string;
  targetRoleId?: string;
  targetVisionId?: string;
  targetGoalId?: string;
  targetProjectId?: string;
}

export interface StoryExportOptions {
  format: 'json' | 'csv' | 'excel';
  includeDeleted: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  fields: string[];
  groupBy?: string;
}

export interface StoryImportOptions {
  mode: 'overwrite' | 'merge';
  importStories: boolean;
  importGoals: boolean;
  importProjects: boolean;
  importVisions: boolean;
  importBucketlist: boolean;
  importSprints: boolean;
  importRoles: boolean;
  importImportantDates: boolean;
  importTraditions: boolean;
  importSettings: boolean;
}

export interface StoryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StoryTemplate {
  id: string;
  name: string;
  description: string;
  template: Partial<import('./index').Story>;
  category: string;
  tags: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryWorkflow {
  id: string;
  name: string;
  description: string;
  steps: StoryWorkflowStep[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StoryWorkflowStep {
  id: string;
  name: string;
  description: string;
  status: string;
  order: number;
  isRequired: boolean;
  estimatedDays: number;
  dependencies: string[];
}

export interface StoryAnalytics {
  totalStories: number;
  completedStories: number;
  averageCompletionTime: number;
  mostProductiveDay: string;
  mostProductiveTime: string;
  topPriorities: Priority[];
  topTypes: StoryType[];
  averageWeight: number;
  completionRate: number;
  overdueCount: number;
  dueSoonCount: number;
}

export interface StoryDashboard {
  recentStories: import('./index').Story[];
  dueSoonStories: import('./index').Story[];
  overdueStories: import('./index').Story[];
  inProgressStories: import('./index').Story[];
  completedToday: import('./index').Story[];
  analytics: StoryAnalytics;
  quickStats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
  };
}
