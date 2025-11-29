import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Goal } from '@/types';
import { STORAGE_KEYS } from '@/constants/storage';

// Core goal atoms
export const goalsAtom = atomWithStorage<Goal[]>(STORAGE_KEYS.GOALS, []);

// Goal action atoms
export const addGoalAtom = atom(
  null,
  (get, set, goalData: Partial<Goal>) => {
    const newGoal: Goal = {
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: goalData.title || '',
      name: goalData.title || '', // alias for title
      description: goalData.description,
      visionId: goalData.visionId,
      category: goalData.category || 'target',
      goalType: goalData.goalType || 'target',
      roleId: goalData.roleId,
      priority: goalData.priority || 'medium',
      status: goalData.status || 'icebox',
      order: goalData.order || 0,
      storyIds: goalData.storyIds || [],
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentGoals = get(goalsAtom);
    set(goalsAtom, [...currentGoals, newGoal]);
    return newGoal;
  }
);

export const updateGoalAtom = atom(
  null,
  (get, set, goalId: string, updates: Partial<Goal>) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.map(goal => 
      goal.id === goalId ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
    );
    set(goalsAtom, updatedGoals);
  }
);

export const deleteGoalAtom = atom(
  null,
  (get, set, goalId: string) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.filter(goal => goal.id !== goalId);
    set(goalsAtom, updatedGoals);
  }
);

// Goal-Story management atoms
export const addStoryToGoalAtom = atom(
  null,
  (get, set, goalId: string, storyId: string) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, storyIds: [...(goal.storyIds || []), storyId], updatedAt: new Date().toISOString() }
        : goal
    );
    set(goalsAtom, updatedGoals);
  }
);

export const removeStoryFromGoalAtom = atom(
  null,
  (get, set, goalId: string, storyId: string) => {
    const goals = get(goalsAtom);
    const updatedGoals = goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, storyIds: (goal.storyIds || []).filter(id => id !== storyId), updatedAt: new Date().toISOString() }
        : goal
    );
    set(goalsAtom, updatedGoals);
  }
);

// Bulk delete atoms
export const deleteAllGoalsAtom = atom(
  null,
  (_get, set) => {
    set(goalsAtom, []);
  }
);
