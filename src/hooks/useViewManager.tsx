import { useEffect, useCallback } from 'react';
import { Suspense } from 'react';
import { useAtom } from 'jotai';
import { currentViewAtom } from '@/stores/uiStore';
import { settingsAtom } from '@/stores/settingsStore';
import { getViewComponent } from '@/registry/viewRegistry';
import { ViewLoadingFallback } from '@/components/shared/ViewLoadingFallback';
import type { ViewType } from '@/constants/views';

/**
 * Hook for managing view state and rendering
 * Uses lazy-loaded components for code splitting
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
    const ViewComponent = getViewComponent(currentView);
    return (
      <Suspense fallback={<ViewLoadingFallback />}>
        <ViewComponent />
      </Suspense>
    );
  };

  return {
    currentView,
    setCurrentView,
    renderView
  };
}

