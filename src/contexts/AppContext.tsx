import React, { createContext, useContext, ReactNode } from 'react';
import { useAtom } from 'jotai';
import { 
  storiesAtom, 
  rolesAtom, 
  visionsAtom, 
  goalsAtom, 
  projectsAtom, 
  settingsAtom,
  labelsAtom,
  sprintsAtom
} from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useLoadingState } from '@/hooks/useLoadingState';

interface AppContextValue {
  // Data
  stories: any[];
  roles: any[];
  visions: any[];
  goals: any[];
  projects: any[];
  settings: any;
  labels: any[];
  sprints: any[];
  
  // Settings mirror
  storySettings: any;
  
  // Error handling
  errorState: any;
  handleError: (error: Error | string, context?: string) => string;
  clearError: () => void;
  
  // Loading state
  loadingState: any;
  startLoading: (options?: any) => void;
  stopLoading: () => void;
  setProgress: (progress: number) => void;
  setMessage: (message: string) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Data atoms
  const [stories] = useAtom(storiesAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [goals] = useAtom(goalsAtom);
  const [projects] = useAtom(projectsAtom);
  const [settings] = useAtom(settingsAtom);
  const [labels] = useAtom(labelsAtom);
  const [sprints] = useAtom(sprintsAtom);
  
  // Settings mirror
  const storySettings = useStorySettings();
  
  // Error handling
  const { errorState, handleError, clearError } = useErrorHandler();
  
  // Loading state
  const { loadingState, startLoading, stopLoading, setProgress, setMessage } = useLoadingState();

  const value: AppContextValue = {
    // Data
    stories,
    roles,
    visions,
    goals,
    projects,
    settings,
    labels,
    sprints,
    
    // Settings mirror
    storySettings,
    
    // Error handling
    errorState,
    handleError,
    clearError,
    
    // Loading state
    loadingState,
    startLoading,
    stopLoading,
    setProgress,
    setMessage
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
