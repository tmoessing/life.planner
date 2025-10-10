import { atom } from 'jotai';
import { settingsAtom } from './settingsStore';

// Helper function to get status descriptions
const getStatusDescription = (statusName: string): string => {
  const descriptions: Record<string, string> = {
    'Icebox': 'Ideas for future consideration',
    'Backlog': 'Ready to be worked on',
    'To Do': 'Ready to start',
    'In Progress': 'Currently being worked on',
    'Review': 'Ready for review',
    'Done': 'Completed'
  };
  return descriptions[statusName] || '';
};

// Status management atoms
export const storyStatusesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'icebox', name: 'Icebox', color: '#6B7280', description: 'Ideas for future consideration' },
  { id: 'backlog', name: 'Backlog', color: '#3B82F6', description: 'Ready to be worked on' },
  { id: 'todo', name: 'To Do', color: '#F59E0B', description: 'Ready to start' },
  { id: 'progress', name: 'In Progress', color: '#10B981', description: 'Currently being worked on' },
  { id: 'review', name: 'Review', color: '#8B5CF6', description: 'Ready for review' },
  { id: 'done', name: 'Done', color: '#22C55E', description: 'Completed' }
]);

export const goalStatusesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>((get) => {
  const settings = get(settingsAtom);
  return (settings.goalStatuses || []).map(status => ({
    id: status.name.toLowerCase().replace(' ', '-'),
    name: status.name,
    color: status.color,
    description: getStatusDescription(status.name)
  }));
});

export const projectStatusesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'planning', name: 'Planning', color: '#3B82F6', description: 'Project in planning phase' },
  { id: 'active', name: 'Active', color: '#10B981', description: 'Project in progress' },
  { id: 'on-hold', name: 'On Hold', color: '#F59E0B', description: 'Project temporarily paused' },
  { id: 'completed', name: 'Completed', color: '#22C55E', description: 'Project finished' },
  { id: 'cancelled', name: 'Cancelled', color: '#EF4444', description: 'Project cancelled' }
]);

export const bucketlistStatusesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'not-started', name: 'Not Started', color: '#6B7280', description: 'Item has not been started' },
  { id: 'in-progress', name: 'In Progress', color: '#3B82F6', description: 'Item is currently being worked on' },
  { id: 'completed', name: 'Completed', color: '#10B981', description: 'Item has been completed' },
  { id: 'postponed', name: 'Postponed', color: '#F59E0B', description: 'Item has been postponed' },
  { id: 'abandoned', name: 'Abandoned', color: '#EF4444', description: 'Item was abandoned' }
]);

export const updateStoryStatusesAtom = atom(
  null,
  (get, set, statuses: Array<{id: string, name: string, color: string, description: string}>) => {
    set(storyStatusesAtom, statuses);
  }
);

export const updateGoalStatusesAtom = atom(
  null,
  (get, set, statuses: Array<{id: string, name: string, color: string, description: string}>) => {
    // This is a write-only atom, we don't need to set goalStatusesAtom directly
    // The goalStatusesAtom is derived from settingsAtom
  }
);

export const updateProjectStatusesAtom = atom(
  null,
  (get, set, statuses: Array<{id: string, name: string, color: string, description: string}>) => {
    set(projectStatusesAtom, statuses);
  }
);

export const updateBucketlistStatusesAtom = atom(
  null,
  (get, set, statuses: Array<{id: string, name: string, color: string, description: string}>) => {
    set(bucketlistStatusesAtom, statuses);
  }
);
