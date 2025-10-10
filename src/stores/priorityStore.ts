import { atom } from 'jotai';

// Priority management atoms
export const storyPrioritiesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'q1', name: 'Q1', color: '#EF4444', description: 'Urgent & Important' },
  { id: 'q2', name: 'Q2', color: '#F97316', description: 'Important but not urgent' },
  { id: 'q3', name: 'Q3', color: '#EAB308', description: 'Urgent but not important' },
  { id: 'q4', name: 'Q4', color: '#6B7280', description: 'Not urgent & not important' }
]);

export const goalPrioritiesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'high', name: 'High', color: '#EF4444', description: 'High priority - Focus on these first' },
  { id: 'medium', name: 'Medium', color: '#F97316', description: 'Medium priority - Important but can wait' },
  { id: 'low', name: 'Low', color: '#6B7280', description: 'Low priority - Nice to have' }
]);

export const bucketlistPrioritiesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'high', name: 'High', color: '#EF4444', description: 'High priority - Focus on these first' },
  { id: 'medium', name: 'Medium', color: '#F97316', description: 'Medium priority - Important but can wait' },
  { id: 'low', name: 'Low', color: '#6B7280', description: 'Low priority - Nice to have' }
]);

export const updateStoryPrioritiesAtom = atom(
  null,
  (get, set, priorities: Array<{id: string, name: string, color: string, description: string}>) => {
    set(storyPrioritiesAtom, priorities);
  }
);

export const updateGoalPrioritiesAtom = atom(
  null,
  (get, set, priorities: Array<{id: string, name: string, color: string, description: string}>) => {
    set(goalPrioritiesAtom, priorities);
  }
);

export const updateBucketlistPrioritiesAtom = atom(
  null,
  (get, set, priorities: Array<{id: string, name: string, color: string, description: string}>) => {
    set(bucketlistPrioritiesAtom, priorities);
  }
);
