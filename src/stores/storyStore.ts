import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Story } from '@/types';
import { createStory } from '@/utils';
import { STORAGE_KEYS } from '@/constants/storage';
import { generateRecurrenceInstances } from '@/utils/recurrenceUtils';
import { currentSprintAtom } from './appStore';

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

// Recurrence atoms
export const recurringStoriesAtom = atom((get) => {
  const stories = get(storiesAtom);
  return stories.filter(story => 
    story.repeat && story.repeat.cadence !== 'none'
  );
});

export const storyInstancesAtom = atom((get) => {
  const stories = get(recurringStoriesAtom);
  const currentSprint = get(currentSprintAtom);
  
  if (!currentSprint) return [];
  
  return stories.flatMap(story => 
    generateRecurrenceInstances(
      story,
      new Date(currentSprint.startDate),
      new Date(currentSprint.endDate)
    )
  );
});

// Virtual story instances for display
export const virtualStoryInstancesAtom = atom((get) => {
  const stories = get(storiesAtom);
  const currentSprint = get(currentSprintAtom);
  
  if (!currentSprint) return stories;
  
  const virtualStories: (Story & { _isRecurringInstance?: boolean; _instanceDate?: string; _originalId?: string })[] = [];
  
  stories.forEach(story => {
    if (story.repeat && story.repeat.cadence !== 'none') {
      const instances = generateRecurrenceInstances(
        story,
        new Date(currentSprint.startDate),
        new Date(currentSprint.endDate)
      );
      
      instances.forEach(instance => {
        virtualStories.push({
          ...story,
          id: `${story.id}-${instance.date}`,
          status: instance.status,
          _isRecurringInstance: true,
          _instanceDate: instance.date,
          _originalId: story.id
        });
      });
    } else {
      virtualStories.push(story);
    }
  });
  
  return virtualStories;
});
