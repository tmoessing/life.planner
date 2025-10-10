import { useState, useRef, useEffect } from 'react';
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
      { id: 'bucketlist', label: 'Bucketlist', description: 'Life experiences and dreams' },
      { id: 'traditions', label: 'Traditions', description: 'Build meaningful traditions in your life' },
      { id: 'importance', label: 'Importance List', description: 'Priority matrix view' },
      { id: 'important-dates', label: 'Important Dates', description: 'Track important dates and events' }
    ]
  },
  {
    label: 'Goals',
    items: [
      { id: 'goals', label: 'Goals', description: 'Goals and objectives view' },
      { id: 'goals-kanban', label: 'Kanban Board', description: 'Goal Kanban boards' },
      { id: 'goal-boards', label: 'Goal Boards', description: 'Goals organized by category' }
    ]
  },
  {
    label: 'Stories',
    items: [
      { id: 'sprint', label: 'Sprint View', description: 'Current sprint management' },
      { id: 'sprint-planning', label: 'Sprint Planning', description: 'Plan upcoming sprints' },
      { id: 'story-boards', label: 'Story Boards', description: 'Kanban board view' }
    ]
  },
  {
    label: 'Projects',
    items: [
      { id: 'projects', label: 'Projects', description: 'Project management' },
      { id: 'projects-kanban', label: 'Kanban Board', description: 'Project Kanban boards' },
      { id: 'project-product-management', label: 'Project Management', description: 'Manage project stories' }
    ]
  }
];

interface NavigationDropdownProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function NavigationDropdown({ currentView, setCurrentView }: NavigationDropdownProps) {
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');
  const timeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    
    // Calculate position for mobile responsiveness
    setTimeout(() => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // If dropdown would go off-screen to the right, position it to the right
        if (rect.right > viewportWidth - 20) {
          setDropdownPosition('right');
        } else {
          setDropdownPosition('left');
        }
      }
    }, 0);
  };

  const handleTouchStart = (groupLabel: string) => {
    // For mobile touch, toggle the dropdown
    if (hoveredGroup === groupLabel) {
      setHoveredGroup(null);
      setIsHovering(false);
    } else {
      setHoveredGroup(groupLabel);
      setIsHovering(true);
    }
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHoveredGroup(null);
        setIsHovering(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative overflow-visible">
      <div className="flex flex-wrap items-center gap-1 sm:gap-1 overflow-visible">
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
              className="gap-1 text-xs sm:text-sm h-8 px-2 sm:h-auto sm:px-3 touch-target"
              onClick={() => handleTouchStart(group.label)}
              onTouchStart={() => handleTouchStart(group.label)}
            >
              <span className="text-xs sm:text-sm">{group.label}</span>
              <ChevronDown className="h-3 w-3 flex-shrink-0" />
            </Button>
            
            {hoveredGroup === group.label && (
              <div 
                ref={dropdownRef}
                className={`absolute top-full mt-1 w-full sm:w-64 bg-background border border-border rounded-md shadow-lg z-50 ${
                  dropdownPosition === 'right' 
                    ? 'right-0 sm:right-0' 
                    : 'left-0 sm:left-0'
                } max-w-[calc(100vw-1rem)] sm:max-w-none`}
                onMouseEnter={handleDropdownMouseEnter}
                onMouseLeave={handleDropdownMouseLeave}
              >
                <div className="p-1">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleViewClick(item.id)}
                      className={`w-full text-left px-2 py-2 sm:px-3 text-xs sm:text-sm rounded-md transition-colors touch-target ${
                        currentView === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <div className="font-medium text-xs sm:text-sm">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 hidden sm:block">
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
