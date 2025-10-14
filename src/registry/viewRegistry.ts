import { lazy } from 'react';
import type { ComponentType } from 'react';
import type { ViewType } from '@/types';

// Lazy load all view components for better code splitting
const viewComponents: Record<ViewType, ComponentType> = {
  'today': lazy(() => import('@/components/views/TodayView').then(m => ({ default: m.TodayView }))),
  'sprint': lazy(() => import('@/components/views/SprintView').then(m => ({ default: m.SprintView }))),
  'story-boards': lazy(() => import('@/components/views/StoryBoardsView').then(m => ({ default: m.StoryBoardsView }))),
  'importance': lazy(() => import('@/components/views/ImportanceView').then(m => ({ default: m.ImportanceView }))),
  'goals': lazy(() => import('@/components/views/GoalsView').then(m => ({ default: m.GoalsView }))),
  'goals-kanban': lazy(() => import('@/components/views/GoalsKanbanBoardsView').then(m => ({ default: m.GoalsKanbanBoardsView }))),
  'bucketlist': lazy(() => import('@/components/views/BucketlistView').then(m => ({ default: m.BucketlistView }))),
  'bucketlist-boards': lazy(() => import('@/components/views/BucketlistBoardsView').then(m => ({ default: m.BucketlistBoardsView }))),
  'planner': lazy(() => import('@/components/views/PlannerView').then(m => ({ default: m.PlannerView }))),
  'sprint-planning': lazy(() => import('@/components/views/SprintPlanningView').then(m => ({ default: m.SprintPlanningView }))),
  'add-stories': lazy(() => import('@/components/views/AddStoriesView').then(m => ({ default: m.AddStoriesView }))),
  'add-goals': lazy(() => import('@/components/views/AddGoalsView').then(m => ({ default: m.AddGoalsView }))),
  'add-projects': lazy(() => import('@/components/views/AddProjectsView').then(m => ({ default: m.AddProjectsView }))),
  'add-bucketlist': lazy(() => import('@/components/views/AddBucketlistView').then(m => ({ default: m.AddBucketlistView }))),
  'projects': lazy(() => import('@/components/views/ProjectView').then(m => ({ default: m.ProjectView }))),
  'projects-kanban': lazy(() => import('@/components/views/ProjectsKanbanBoardsView').then(m => ({ default: m.ProjectsKanbanBoardsView }))),
  'project-product-management': lazy(() => import('@/components/views/ProjectProductManagementView').then(m => ({ default: m.ProjectProductManagementView }))),
  'important-dates': lazy(() => import('@/components/views/ImportantDatesView').then(m => ({ default: m.ImportantDatesView }))),
  'traditions': lazy(() => import('@/components/views/TraditionsView').then(m => ({ default: m.TraditionsView }))),
  'goal-boards': lazy(() => import('@/components/views/GoalBoardsView').then(m => ({ default: m.GoalBoardsView }))),
  'settings': lazy(() => import('@/components/views/SettingsView').then(m => ({ default: m.SettingsView }))),
};

export const getViewComponent = (viewType: ViewType): ComponentType => {
  return viewComponents[viewType] || viewComponents['today'];
};

export const getAllViewTypes = (): ViewType[] => {
  return Object.keys(viewComponents) as ViewType[];
};

export const isViewType = (value: string): value is ViewType => {
  return value in viewComponents;
};
