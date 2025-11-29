import { useCallback } from 'react';
import type { ViewType } from '@/types';

// Cache to track which views have been prefetched
const prefetchedViews = new Set<ViewType>();

// Map view types to their import paths
const viewImportMap: Record<ViewType, () => Promise<any>> = {
  'today': () => import('@/components/views/TodayView'),
  'sprint': () => import('@/components/views/SprintView'),
  'story-boards': () => import('@/components/views/StoryBoardsViewRefactored'),
  'importance': () => import('@/components/views/ImportanceView'),
  'goals': () => import('@/components/views/GoalsView'),
  'goals-kanban': () => import('@/components/views/GoalsKanbanBoardsView'),
  'bucketlist': () => import('@/components/views/BucketlistView'),
  'bucketlist-boards': () => import('@/components/views/BucketlistBoardsView'),
  'planner': () => import('@/components/views/PlannerViewRefactored'),
  'sprint-planning': () => import('@/components/views/SprintPlanningView'),
  'add-stories': () => import('@/components/views/AddStoriesViewRefactored'),
  'add-goals': () => import('@/components/views/AddGoalsView'),
  'add-projects': () => import('@/components/views/AddProjectsView'),
  'add-bucketlist': () => import('@/components/views/AddBucketlistView'),
  'projects': () => import('@/components/views/ProjectView'),
  'projects-kanban': () => import('@/components/views/ProjectsKanbanBoardsView'),
  'project-product-management': () => import('@/components/views/ProjectProductManagementView'),
  'important-dates': () => import('@/components/views/ImportantDatesView'),
  'traditions': () => import('@/components/views/TraditionsView'),
  'goal-boards': () => import('@/components/views/GoalBoardsView'),
  'classes': () => import('@/components/views/ClassView'),
  'settings': () => import('@/components/views/SettingsView'),
};

/**
 * Hook for prefetching view components on hover/focus
 * This makes views load instantly when clicked
 */
export function useViewPrefetch() {
  const prefetchView = useCallback((viewType: ViewType) => {
    // Skip if already prefetched
    if (prefetchedViews.has(viewType)) {
      return;
    }

    // Mark as prefetched immediately to prevent duplicate prefetches
    prefetchedViews.add(viewType);

    // Trigger the import to prefetch the module
    const importFn = viewImportMap[viewType];
    if (importFn) {
      // Start the import but don't await it - let it load in the background
      importFn().catch((error) => {
        // If prefetch fails, remove from cache so it can be retried
        prefetchedViews.delete(viewType);
        console.warn(`Failed to prefetch view ${viewType}:`, error);
      });
    }
  }, []);

  return { prefetchView };
}

