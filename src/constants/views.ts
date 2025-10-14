import { TodayView } from '@/components/views/TodayView';
import { SprintView } from '@/components/views/SprintView';
import { StoryBoardsView } from '@/components/views/StoryBoardsView';
import { ImportanceView } from '@/components/views/ImportanceView';
import { GoalsView } from '@/components/views/GoalsView';
import { GoalsKanbanBoardsView } from '@/components/views/GoalsKanbanBoardsView';
import { BucketlistView } from '@/components/views/BucketlistView';
import { BucketlistBoardsView } from '@/components/views/BucketlistBoardsView';
import { PlannerView } from '@/components/views/PlannerView';
import { SprintPlanningView } from '@/components/views/SprintPlanningView';
import { AddStoriesView } from '@/components/views/AddStoriesView';
import { AddGoalsView } from '@/components/views/AddGoalsView';
import { AddProjectsView } from '@/components/views/AddProjectsView';
import { AddBucketlistView } from '@/components/views/AddBucketlistView';
import { ProjectView } from '@/components/views/ProjectView';
import { ProjectsKanbanBoardsView } from '@/components/views/ProjectsKanbanBoardsView';
import { ProjectProductManagementView } from '@/components/views/ProjectProductManagementView';
import { ImportantDatesView } from '@/components/views/ImportantDatesView';
import { TraditionsView } from '@/components/views/TraditionsView';
import { SettingsView } from '@/components/views/SettingsView';
import { GoalBoardsView } from '@/components/views/GoalBoardsView';

export const VIEW_TYPES = [
  'today',
  'sprint',
  'story-boards',
  'importance',
  'goals',
  'goals-kanban',
  'bucketlist',
  'bucketlist-boards',
  'planner',
  'sprint-planning',
  'add-stories',
  'add-goals',
  'add-projects',
  'add-bucketlist',
  'projects',
  'projects-kanban',
  'project-product-management',
  'important-dates',
  'traditions',
  'goal-boards',
  'settings',
] as const;

export type ViewType = typeof VIEW_TYPES[number];

export const VIEW_COMPONENTS = {
  'today': TodayView,
  'sprint': SprintView,
  'story-boards': StoryBoardsView,
  'importance': ImportanceView,
  'goals': GoalsView,
  'goals-kanban': GoalsKanbanBoardsView,
  'bucketlist': BucketlistView,
  'bucketlist-boards': BucketlistBoardsView,
  'planner': PlannerView,
  'sprint-planning': SprintPlanningView,
  'add-stories': AddStoriesView,
  'add-goals': AddGoalsView,
  'add-projects': AddProjectsView,
  'add-bucketlist': AddBucketlistView,
  'projects': ProjectView,
  'projects-kanban': ProjectsKanbanBoardsView,
  'project-product-management': ProjectProductManagementView,
  'important-dates': ImportantDatesView,
  'traditions': TraditionsView,
  'goal-boards': GoalBoardsView,
  'settings': SettingsView,
} as const;