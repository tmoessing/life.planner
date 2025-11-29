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
  { id: 'code', name: 'Code', color: '#3B82F6', description: 'Software development and coding projects' },
  { id: 'organization', name: 'Organization', color: '#8B5CF6', description: 'Organizational and productivity projects' },
  { id: 'learning', name: 'Learning', color: '#10B981', description: 'Educational and skill development projects' }
]);

export const updateStoryTypesAtom = atom(
  null,
  (_get, set, types: Array<{id: string, name: string, color: string, description: string}>) => {
    set(storyTypesAtom, types);
  }
);

export const updateGoalTypesAtom = atom(
  null,
  (_get, set, types: Array<{id: string, name: string, color: string, description: string}>) => {
    set(goalTypesAtom, types);
  }
);

export const updateProjectTypesAtom = atom(
  null,
  (_get, set, types: Array<{id: string, name: string, color: string, description: string}>) => {
    set(projectTypesAtom, types);
  }
);
