import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { currentViewAtom } from '@/stores/uiStore';
import type { ViewType } from '@/types';

/**
 * Custom hook for navigation between views
 * Replaces the window global navigation pattern with proper state management
 */
export function useNavigation() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);

  const navigateToView = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, [setCurrentView]);

  return {
    currentView,
    navigateToView,
    setCurrentView
  };
}

