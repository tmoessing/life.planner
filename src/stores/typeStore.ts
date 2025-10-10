import { atom } from 'jotai';

// Type management atoms
export const storyTypesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'spiritual', name: 'Spiritual', color: '#8B5CF6', description: 'Spiritual growth and development' },
  { id: 'physical', name: 'Physical', color: '#10B981', description: 'Physical health and fitness' },
  { id: 'intellectual', name: 'Intellectual', color: '#3B82F6', description: 'Learning and mental development' },
  { id: 'social', name: 'Social', color: '#F59E0B', description: 'Relationships and social connections' }
]);

export const goalTypesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'spiritual', name: 'Spiritual', color: '#8B5CF6', description: 'Spiritual goals and aspirations' },
  { id: 'physical', name: 'Physical', color: '#EF4444', description: 'Health and fitness goals' },
  { id: 'intellectual', name: 'Intellectual', color: '#3B82F6', description: 'Learning and career goals' },
  { id: 'social', name: 'Social', color: '#10B981', description: 'Relationship and social goals' },
  { id: 'financial', name: 'Financial', color: '#F59E0B', description: 'Financial and material goals' },
  { id: 'protector', name: 'Protector', color: '#EF4444', description: 'Protection and safety goals' }
]);

export const projectTypesAtom = atom<Array<{id: string, name: string, color: string, description: string}>>([
  { id: 'personal', name: 'Personal', color: '#8B5CF6', description: 'Personal development projects' },
  { id: 'work', name: 'Work', color: '#3B82F6', description: 'Professional work projects' },
  { id: 'family', name: 'Family', color: '#F59E0B', description: 'Family and home projects' },
  { id: 'health', name: 'Health', color: '#10B981', description: 'Health and wellness projects' },
  { id: 'learning', name: 'Learning', color: '#6366F1', description: 'Educational and skill projects' }
]);

export const updateStoryTypesAtom = atom(
  null,
  (get, set, types: Array<{id: string, name: string, color: string, description: string}>) => {
    set(storyTypesAtom, types);
  }
);

export const updateGoalTypesAtom = atom(
  null,
  (get, set, types: Array<{id: string, name: string, color: string, description: string}>) => {
    set(goalTypesAtom, types);
  }
);

export const updateProjectTypesAtom = atom(
  null,
  (get, set, types: Array<{id: string, name: string, color: string, description: string}>) => {
    set(projectTypesAtom, types);
  }
);
