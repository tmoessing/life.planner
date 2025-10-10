import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Story } from '@/types';
import { createStory } from '@/utils';
import { STORAGE_KEYS } from '@/constants';

// Core story atoms
export const storiesAtom = atomWithStorage<Story[]>(STORAGE_KEYS.STORIES, []);

// Story action atoms
export const addStoryAtom = atom(
  null,
  (get, set, storyData: Partial<Story>, targetStatus?: string) => {
    const newStory = createStory({
      ...storyData,
      status: (targetStatus as any) || 'backlog'
    });
    
    const currentStories = get(storiesAtom);
    set(storiesAtom, [...currentStories, newStory]);
    
    return newStory;
  }
);

export const updateStoryAtom = atom(
  null,
  (get, set, storyId: string, updates: Partial<Story>) => {
    const stories = get(storiesAtom);
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, ...updates, updatedAt: new Date().toISOString() }
        : story
    );
    set(storiesAtom, updatedStories);
  }
);

export const deleteStoryAtom = atom(
  null,
  (get, set, storyId: string) => {
    const stories = get(storiesAtom);
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, deleted: true, updatedAt: new Date().toISOString() }
        : story
    );
    set(storiesAtom, updatedStories);
  }
);

export const moveStoryAtom = atom(
  null,
  (get, set, storyId: string, toStatus: string) => {
    const stories = get(storiesAtom);
    const updatedStories = stories.map(story => 
      story.id === storyId 
        ? { ...story, status: toStatus as any, updatedAt: new Date().toISOString() }
        : story
    );
    
    set(storiesAtom, updatedStories);
  }
);

// Bulk delete atoms
export const deleteAllStoriesAtom = atom(
  null,
  (get, set) => {
    set(storiesAtom, []);
  }
);
