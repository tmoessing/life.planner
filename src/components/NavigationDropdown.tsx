import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { currentViewAtom } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import type { ViewType } from '@/constants';

interface NavigationItem {
  id: ViewType;
  label: string;
  description?: string;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    label: 'Visions',
    items: [
      { id: 'importance', label: 'Importance List', description: 'Priority matrix view' },
      { id: 'bucketlist', label: 'Bucketlist', description: 'Life experiences and dreams' }
    ]
  },
  {
    label: 'Goals',
    items: [
      { id: 'goals', label: 'Goals', description: 'Goals and objectives view' },
      { id: 'goals-kanban', label: 'Goals - Kanban Boards', description: 'Goal Kanban boards' }
    ]
  },
  {
    label: 'Stories',
    items: [
      { id: 'sprint', label: 'Sprint View', description: 'Current sprint management' },
      { id: 'sprint-planning', label: 'Sprint Planning', description: 'Plan upcoming sprints' },
      { id: 'sprint-review', label: 'Sprint - Review', description: 'Review completed stories' },
      { id: 'story-boards', label: 'Story Boards', description: 'Kanban board view' }
    ]
  },
  {
    label: 'Projects',
    items: [
      { id: 'projects', label: 'Projects', description: 'Project management' },
      { id: 'projects-kanban', label: 'Projects - Kanban Boards', description: 'Project Kanban boards' },
      { id: 'project-product-management', label: 'Project Management', description: 'Manage project stories' }
    ]
  }
];

export function NavigationDropdown() {
  const [currentView, setCurrentView] = useAtom(currentViewAtom);
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  const getCurrentGroup = () => {
    for (const group of navigationGroups) {
      if (group.items.some(item => item.id === currentView)) {
        return group;
      }
    }
    return navigationGroups[0]; // fallback
  };

  const getCurrentItem = () => {
    const currentGroup = getCurrentGroup();
    return currentGroup.items.find(item => item.id === currentView) || currentGroup.items[0];
  };

  const currentGroup = getCurrentGroup();
  const currentItem = getCurrentItem();

  const handleMouseEnter = (groupLabel: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredGroup(groupLabel);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredGroup(null);
      setIsHovering(false);
    }, 150); // Small delay to prevent flickering
  };

  const handleDropdownMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsHovering(true);
  };

  const handleDropdownMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredGroup(null);
      setIsHovering(false);
    }, 150);
  };

  const handleViewClick = (viewId: ViewType) => {
    setCurrentView(viewId);
    setHoveredGroup(null);
    setIsHovering(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="relative">
      <div className="flex items-center space-x-1">
        {navigationGroups.map((group) => (
          <div
            key={group.label}
            className="relative"
            onMouseEnter={() => handleMouseEnter(group.label)}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              variant={currentGroup.label === group.label ? "default" : "ghost"}
              size="sm"
              className="gap-1 text-xs sm:text-sm"
            >
              {group.label}
              <ChevronDown className="h-3 w-3" />
            </Button>
            
            {hoveredGroup === group.label && (
              <div 
                className="absolute top-full left-0 mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-50"
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <div className="p-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleViewClick(item.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        currentView === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.description}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
