import { useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { currentViewAtom } from '@/stores/uiStore';
import { settingsAtom } from '@/stores/settingsStore';
import { VIEW_COMPONENTS, type ViewType } from '@/constants/views';

/**
 * Hook for managing view state and rendering
 */
export function useViewManager() {
  const [currentView, setCurrentViewAtom] = useAtom(currentViewAtom);
  const [settings] = useAtom(settingsAtom);

  // Wrapper function to match expected signature
  const setCurrentView = useCallback((view: ViewType) => {
    setCurrentViewAtom(view);
  }, [setCurrentViewAtom]);

  // Redirect away from classes view if classes are hidden
  useEffect(() => {
    if (currentView === 'classes' && !settings.layout.sections.classes) {
      setCurrentView('today');
    }
  }, [currentView, settings.layout.sections.classes, setCurrentView]);

  const renderView = () => {
    const ViewComponent = VIEW_COMPONENTS[currentView] || VIEW_COMPONENTS['today'];
    return <ViewComponent />;
  };

  return {
    currentView,
    setCurrentView,
    renderView
  };
}

