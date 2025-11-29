import { createContext, useContext, type ReactNode } from 'react';
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
import type { 
  Story, 
  Role, 
  Vision, 
  Goal, 
  Project, 
  Settings, 
  Label, 
  Sprint,
  Priority
} from '@/types';
import type { ErrorState } from '@/hooks/useErrorHandler';
import type { LoadingState } from '@/hooks/useLoadingState';

interface StorySettings {
  statusColors: Record<string, string>;
  priorityColors: Record<Priority, string>;
  typeColors: Record<string, string>;
  sizeColors: Record<string, string>;
  taskCategoryColors: Record<string, string>;
  weightBaseColor: string;
  roadmapScheduledColor: string;
  chartColors: {
    ideal: string;
    actual: string;
  };
  labels: Label[];
  roles: Role[];
  visionTypes: Settings['visionTypes'];
  storyTypes: Settings['storyTypes'];
  storySizes: Settings['storySizes'];
  taskCategories: Settings['taskCategories'];
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: Priority) => string;
  getTypeColor: (type: string) => string;
  getSizeColor: (size: string) => string;
  getTaskCategoryColor: (category: string) => string;
  getVisionTypeColor: (type: string) => string;
}

interface AppContextValue {
  // Data
  stories: Story[];
  roles: Role[];
  visions: Vision[];
  goals: Goal[];
  projects: Project[];
  settings: Settings;
  labels: Label[];
  sprints: Sprint[];
  
  // Settings mirror
  storySettings: StorySettings;
  
  // Error handling
  errorState: ErrorState;
  handleError: (error: Error | string, context?: string) => string;
  clearError: () => void;
  
  // Loading state
  loadingState: LoadingState;
  startLoading: (options?: { message?: string; progress?: number }) => void;
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
