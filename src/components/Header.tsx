import { Button } from '@/components/ui/button';
import { AddDropdown } from '@/components/AddDropdown';
import { NavigationDropdown } from '@/components/NavigationDropdown';
import { Brain, Settings, Calendar } from 'lucide-react';
import { ViewType } from '@/constants/views';

interface HeaderProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function Header({ currentView, setCurrentView }: HeaderProps) {

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-2 md:px-4">
        {/* Left side - Title and Navigation */}
        <div className="flex items-center space-x-1 md:space-x-3 min-w-0 flex-1">
          <div className="flex items-center space-x-1 md:space-x-2 min-w-0">
            <h1 className="text-sm md:text-lg lg:text-xl font-bold truncate">Life Scrum Board</h1>
          </div>
          <div className="hidden lg:block">
            <NavigationDropdown currentView={currentView} setCurrentView={setCurrentView} />
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
          <AddDropdown setCurrentView={setCurrentView} />
          <Button 
            size="sm" 
            variant="ghost"
            className="gap-1 md:gap-2 text-xs md:text-sm touch-target h-8 w-8 md:h-auto md:w-auto"
            onClick={() => setCurrentView('today')}
            title="Today"
          >
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Today</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="gap-1 md:gap-2 text-xs md:text-sm touch-target h-8 w-8 md:h-auto md:w-auto"
            onClick={() => setCurrentView('planner')}
            title="Planner"
          >
            <Brain className="h-4 w-4" />
            <span className="hidden md:inline">Planner</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            className="gap-1 md:gap-2 text-xs md:text-sm touch-target h-8 w-8 md:h-auto md:w-auto"
            onClick={() => setCurrentView('settings')}
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden md:inline">Settings</span>
          </Button>
        </div>
      </div>
      
      {/* Mobile/Tablet Navigation */}
      <div className="lg:hidden border-t bg-background/95 backdrop-blur">
        <div className="px-2 py-1">
          <NavigationDropdown currentView={currentView} setCurrentView={setCurrentView} />
        </div>
      </div>
    </header>
  );
}
