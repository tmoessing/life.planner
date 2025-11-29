import { Button } from '@/components/ui/button';
import { AddDropdown } from '@/components/AddDropdown';
import { NavigationDropdown } from '@/components/NavigationDropdown';
import { Settings, Calendar } from 'lucide-react';
import { ViewType } from '@/constants/views';
import { useViewPrefetch } from '@/hooks/useViewPrefetch';
import { useAtom } from 'jotai';
import { todayViewModeAtom } from '@/stores/uiStore';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

// Helper function to get view display name
function getViewDisplayName(view: ViewType): string | null {
  const viewNames: Record<ViewType, string | null> = {
    'today': "Today's Focus",
    'sprint': 'Sprint View',
    'story-boards': 'Story Boards',
    'importance': 'Importance List',
    'goals': 'Goals',
    'goals-kanban': 'Kanban Board',
    'bucketlist': 'Bucketlist',
    'bucketlist-boards': 'Bucketlist Boards',
    'planner': 'Planner',
    'sprint-planning': 'Sprint Planning',
    'add-stories': null, // Don't show for add views
    'add-goals': null,
    'add-projects': null,
    'add-bucketlist': null,
    'projects': 'Projects',
    'projects-kanban': 'Kanban Board',
    'project-product-management': 'Project Management',
    'classes': 'Classes',
    'important-dates': 'Important Dates',
    'traditions': 'Traditions',
    'goal-boards': 'Goal Boards',
    'settings': 'Settings',
  };
  return viewNames[view] || null;
}

export function Header({ currentView, setCurrentView }: HeaderProps) {
  const [todayViewMode] = useAtom(todayViewModeAtom);
  let viewName = getViewDisplayName(currentView);
  
  // Override view name for today view based on viewMode
  if (currentView === 'today') {
    viewName = todayViewMode === 'week' ? "Week's Focus" : "Today's Focus";
  }
  
  const { prefetchView } = useViewPrefetch();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50 glass-header safe-area-top">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-2 md:px-4 safe-area-left safe-area-right">
        {/* Left side - Title and Navigation */}
        <div className="flex items-center space-x-1 md:space-x-3 min-w-0 flex-1">
          <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
            <h1 className="text-sm md:text-lg lg:text-xl font-bold truncate">
              Life Scrum Board{viewName ? ` - ${viewName}` : ''}
            </h1>
          </div>
          <div className="hidden lg:block">
            <NavigationDropdown currentView={currentView} setCurrentView={setCurrentView} />
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center space-x-1.5 md:space-x-2 flex-shrink-0">
          <AddDropdown setCurrentView={setCurrentView} />
          {/* Hide Today on mobile - it's in bottom nav */}
          <Button 
            size="sm" 
            variant="ghost"
            className="hidden md:flex gap-1 md:gap-2 text-xs md:text-sm touch-target h-11 w-11 md:h-auto md:w-auto md:px-3"
            onClick={() => setCurrentView('today')}
            onMouseEnter={() => prefetchView('today')}
            onFocus={() => prefetchView('today')}
            title="Today"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Today</span>
          </Button>
          {/* Show Settings on mobile - moved to top */}
          <Button 
            size="sm" 
            variant="ghost"
            className="gap-1 md:gap-2 text-xs md:text-sm touch-target h-11 w-11 md:h-auto md:w-auto md:px-3"
            onClick={() => setCurrentView('settings')}
            onMouseEnter={() => prefetchView('settings')}
            onFocus={() => prefetchView('settings')}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile Navigation - Show on mobile for access to all views */}
      <div className="lg:hidden border-t bg-background/95 backdrop-blur relative" style={{ zIndex: 50 }}>
        <div className="w-full py-2 overflow-x-auto mobile-scroll" style={{ overflowY: 'visible' }}>
          <NavigationDropdown currentView={currentView} setCurrentView={setCurrentView} />
        </div>
      </div>
    </header>
  );
}
