import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Board, Column, Story } from '@/types';
import { DEFAULT_COLUMNS, DEFAULT_BOARD } from '@/constants/story';
import { STORAGE_KEYS } from '@/constants/storage';
import { storiesAtom } from './storyStore';
import { currentSprintAtom } from './sprintStore';

// Initialize default data
const defaultColumns = DEFAULT_COLUMNS;
const defaultBoard: Board = DEFAULT_BOARD;

// Core board/column atoms with localStorage persistence
export const columnsAtom = atomWithStorage<Column[]>(STORAGE_KEYS.COLUMNS, defaultColumns);

// Ensure columns are never empty - add a fallback
export const safeColumnsAtom = atom(
  (get) => {
    const columns = get(columnsAtom);
    return columns.length > 0 ? columns : defaultColumns;
  },
  (_, set, newColumns: Column[]) => {
    set(columnsAtom, newColumns.length > 0 ? newColumns : defaultColumns);
  }
);

export const boardsAtom = atomWithStorage<Board[]>(STORAGE_KEYS.BOARDS, [defaultBoard]);

// Derived atoms for computed values
export const storiesByColumnAtom = atom(
  (get) => {
    const stories = get(storiesAtom);
    const columns = get(columnsAtom);
    const currentSprint = get(currentSprintAtom);
    
    const result: Record<string, Story[]> = {};
    
    columns.forEach(column => {
      result[column.id] = column.storyIds
        .map(id => stories.find(story => story.id === id))
        .filter((story): story is Story => 
          story !== undefined && 
          !story.deleted && 
          story.sprintId === currentSprint?.id
        );
    });
    
    return result;
  }
);

