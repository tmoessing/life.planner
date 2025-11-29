import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { ViewType } from '@/types';
import { STORAGE_KEYS } from '@/constants/storage';

// UI state atoms
export const currentViewAtom = atomWithStorage<ViewType>(STORAGE_KEYS.CURRENT_VIEW, 'today');
export const selectedSprintIdAtom = atomWithStorage<string | undefined>(STORAGE_KEYS.SELECTED_SPRINT, undefined);
export const selectedStoryIdsAtom = atomWithStorage<string[]>(STORAGE_KEYS.SELECTED_STORIES, []);
export const focusedStoryIdAtom = atomWithStorage<string | undefined>(STORAGE_KEYS.FOCUSED_STORY, undefined);
export const selectedProjectIdAtom = atomWithStorage<string | undefined>(STORAGE_KEYS.SELECTED_PROJECT, undefined);

// Filter atoms
export const filterTextAtom = atomWithStorage<string>(STORAGE_KEYS.FILTER_TEXT, '');
export const filterKeywordsAtom = atomWithStorage<string>(STORAGE_KEYS.FILTER_KEYWORDS, '');
export const filterDueSoonAtom = atomWithStorage<boolean>(STORAGE_KEYS.FILTER_DUE_SOON, false);

// Layout atoms
export const chartSectionCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.CHART_COLLAPSED, false);
export const boardSectionCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.BOARD_COLLAPSED, false);
export const roadmapSectionCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.ROADMAP_COLLAPSED, true);
export const chartAboveBoardAtom = atomWithStorage<boolean>(STORAGE_KEYS.CHART_ABOVE_BOARD, false);
export const roadmapPositionAtom = atomWithStorage<'top' | 'middle' | 'bottom'>(STORAGE_KEYS.ROADMAP_POSITION, 'bottom');

// Chart collapse states
export const burndownCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.BURNDOWN_COLLAPSED, false);
export const burnupCollapsedAtom = atomWithStorage<boolean>(STORAGE_KEYS.BURNUP_COLLAPSED, false);

// Help modal state (not persisted - should close on page reload)
export const helpModalOpenAtom = atom<boolean>(false);

// Today view mode (today vs week)
export const todayViewModeAtom = atomWithStorage<'today' | 'week'>(STORAGE_KEYS.TODAY_VIEW_MODE, 'week');