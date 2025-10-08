import { useAtom } from 'jotai';
import { currentViewAtom } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { AddDropdown } from '@/components/AddDropdown';
import { NavigationDropdown } from '@/components/NavigationDropdown';
import { Brain } from 'lucide-react';

export function Header() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-2 sm:px-4">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-lg sm:text-xl font-bold truncate">Life Scrum Board</h1>
            <div className="hidden sm:block">
              <NavigationDropdown />
            </div>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-2">
            <AddDropdown />
            <Button 
              size="sm" 
              variant="ghost"
              className="gap-1 sm:gap-2 text-xs sm:text-sm touch-target"
              onClick={() => setCurrentView('planner')}
              title="Planner"
            >
              <Brain className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="sm:hidden border-t bg-background/95 backdrop-blur">
          <div className="p-2">
            <NavigationDropdown />
          </div>
        </div>
      </header>
      
    </>
  );
}
