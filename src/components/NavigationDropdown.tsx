import { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { ChevronDown, Eye, Target, BookOpen, FolderOpen, GraduationCap, MoreHorizontal } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';
import { useViewPrefetch } from '@/hooks/useViewPrefetch';
import type { ViewType } from '@/constants';

interface NavigationItem {
  id: ViewType;
  label: string;
  description?: string;
}

interface NavigationGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavigationItem[];
}

const navigationGroups: NavigationGroup[] = [
  {
    label: 'Visions',
    icon: Eye,
    items: [
      { id: 'bucketlist', label: 'Bucketlist', description: 'Life experiences and dreams' },
      { id: 'traditions', label: 'Traditions', description: 'Build meaningful traditions in your life' },
      { id: 'importance', label: 'Importance List', description: 'Priority matrix view' }
    ]
  },
  {
    label: 'Goals',
    icon: Target,
    items: [
      { id: 'goals', label: 'Goals', description: 'Goals and objectives view' },
      { id: 'goals-kanban', label: 'Kanban Board', description: 'Goal Kanban boards' },
      { id: 'goal-boards', label: 'Goal Boards', description: 'Goals organized by category' }
    ]
  },
  {
    label: 'Stories',
    icon: BookOpen,
    items: [
      { id: 'sprint', label: 'Sprint View', description: 'Current sprint management' },
      { id: 'sprint-planning', label: 'Sprint Planning', description: 'Plan upcoming sprints' },
      { id: 'story-boards', label: 'Story Boards', description: 'Kanban board view' }
    ]
  },
  {
    label: 'Projects',
    icon: FolderOpen,
    items: [
      { id: 'projects', label: 'Projects', description: 'Project management' },
      { id: 'projects-kanban', label: 'Kanban Board', description: 'Project Kanban boards' },
      { id: 'project-product-management', label: 'Project Management', description: 'Manage project stories' }
    ]
  },
  {
    label: 'Classes',
    icon: GraduationCap,
    items: [
      { id: 'classes', label: 'Classes', description: 'Academic classes and schedules' }
    ]
  },
  {
    label: 'Other',
    icon: MoreHorizontal,
    items: [
      { id: 'planner', label: 'Planner', description: 'Life planning and organization' },
      { id: 'important-dates', label: 'Important Dates', description: 'Track important dates and events' }
    ]
  }
];

interface NavigationDropdownProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}

export function NavigationDropdown({ currentView, setCurrentView }: NavigationDropdownProps) {
  const [settings] = useAtom(settingsAtom);
  const { prefetchView } = useViewPrefetch();
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('left');
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  // Filter navigation groups based on settings
  const visibleGroups = navigationGroups.filter(group => {
    if (group.label === 'Classes' && !settings.layout.sections.classes) {
      return false;
    }
    return true;
  });

  const getCurrentGroup = () => {
    for (const group of visibleGroups) {
      if (group.items.some(item => item.id === currentView)) {
        return group;
      }
    }
    return visibleGroups[0] || navigationGroups[0]; // fallback
  };

  const getCurrentItem = () => {
    const currentGroup = getCurrentGroup();
    return currentGroup.items.find(item => item.id === currentView) || currentGroup.items[0];
  };

  const currentGroup = getCurrentGroup();

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

  const handleTouchStart = (groupLabel: string, e?: React.MouseEvent) => {
    // Prevent default to avoid conflicts
    if (e) {
      e.stopPropagation();
    }
    // For mobile touch, toggle the dropdown
    if (hoveredGroup === groupLabel) {
      setHoveredGroup(null);
      setIsHovering(false);
      setButtonPosition(null);
    } else {
      // Close other dropdowns first, then open the clicked one
      setHoveredGroup(groupLabel);
      setIsHovering(true);
      
      // On mobile, calculate button position for fixed dropdown
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        const button = buttonRefs.current.get(groupLabel);
        if (button) {
          const rect = button.getBoundingClientRect();
          setButtonPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width
          });
        }
      }
      
      // Calculate position
      setTimeout(() => {
        if (dropdownRef.current) {
          const rect = dropdownRef.current.getBoundingClientRect();
          const viewportWidth = window.innerWidth;
          
          // Check if dropdown would go off-screen
          if (rect.right > viewportWidth - 20) {
            setDropdownPosition('right');
          } else {
            setDropdownPosition('left');
          }
        }
      }, 0);
    }
  };

  const handleMouseLeave = () => {
    // Only close on mouse leave if we're not on a touch device
    // On mobile, we want clicks to control the dropdown, not hover
    if (window.matchMedia('(hover: hover)').matches) {
      timeoutRef.current = setTimeout(() => {
        setHoveredGroup(null);
        setIsHovering(false);
      }, 150); // Small delay to prevent flickering
    }
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

  // Memoized ref callbacks for each group to prevent infinite loops
  const buttonRefCallbacks = useMemo(() => {
    const callbacks: Record<string, (el: HTMLButtonElement | null) => void> = {};
    visibleGroups.forEach((group) => {
      callbacks[group.label] = (el: HTMLButtonElement | null) => {
        if (el) {
          buttonRefs.current.set(group.label, el);
        } else {
          buttonRefs.current.delete(group.label);
        }
      };
    });
    return callbacks;
  }, [visibleGroups]);

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
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        // Check if click is on a button that should open a dropdown
        const clickedButton = (target as Element).closest('button');
        if (!clickedButton || !clickedButton.closest('[data-navigation-group]')) {
          setHoveredGroup(null);
          setIsHovering(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative overflow-visible w-full">
      <div className="flex flex-wrap items-center justify-between sm:justify-evenly gap-1 sm:gap-2 overflow-visible w-full">
        {visibleGroups.map((group) => (
          <div
            key={group.label}
            className="relative flex-1 min-w-0"
            data-navigation-group
            onMouseEnter={() => handleMouseEnter(group.label)}
            onMouseLeave={handleMouseLeave}
          >
            <Button
              ref={buttonRefCallbacks[group.label]}
              variant={currentGroup.label === group.label ? "default" : "ghost"}
              size="sm"
              className="flex flex-col items-center gap-0.5 text-xs h-auto min-h-[44px] px-2 sm:px-3 touch-target w-full py-2"
              onClick={(e) => handleTouchStart(group.label, e)}
            >
              <group.icon className="h-4 w-4 flex-shrink-0" />
              <span className="text-xs leading-tight font-normal">{group.label}</span>
              <ChevronDown className="h-2 w-2 flex-shrink-0" />
            </Button>
            
            {hoveredGroup === group.label && (() => {
              const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
              const dropdownContent = (
                <div 
                  ref={dropdownRef}
                  className={`${isMobile ? 'fixed' : 'absolute'} ${isMobile ? '' : 'top-full'} ${isMobile ? '' : 'left-0'} ${isMobile ? '' : 'right-0'} sm:top-full sm:left-0 sm:right-auto mt-1 sm:mt-1 mb-0 sm:mb-0 ${isMobile ? '' : 'w-full'} sm:w-64 bg-background border border-border rounded-md shadow-lg z-[100] max-h-[calc(100vh-12rem)] sm:max-h-none overflow-y-auto overflow-x-visible sm:overflow-y-visible ${
                    dropdownPosition === 'right' 
                      ? 'sm:right-0' 
                      : ''
                  }`}
                  style={isMobile && buttonPosition ? (() => {
                    const viewportWidth = window.innerWidth;
                    const availableWidth = viewportWidth - buttonPosition.left - 8;
                    const minWidth = Math.max(200, buttonPosition.width);
                    const maxWidth = Math.min(320, availableWidth);
                    
                    // Adjust left position if dropdown would go off-screen
                    let leftPos = buttonPosition.left;
                    if (leftPos + maxWidth > viewportWidth - 8) {
                      leftPos = Math.max(8, viewportWidth - maxWidth - 8);
                    }
                    
                    return {
                      top: `${buttonPosition.top}px`,
                      left: `${leftPos}px`,
                      width: 'auto',
                      minWidth: `${minWidth}px`,
                      maxWidth: `${Math.max(minWidth, maxWidth)}px`,
                    };
                  })() : undefined}
                  onMouseEnter={handleDropdownMouseEnter}
                  onMouseLeave={handleDropdownMouseLeave}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-1">
                    {group.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleViewClick(item.id)}
                        onMouseEnter={() => prefetchView(item.id)}
                        onFocus={() => prefetchView(item.id)}
                        onTouchStart={() => prefetchView(item.id)}
                        className={`w-full text-left px-3 py-3 sm:px-3 sm:py-2 text-xs sm:text-sm rounded-md transition-colors touch-target min-h-[44px] sm:min-h-0 ${
                          currentView === item.id
                            ? 'bg-primary text-primary-foreground'
                            : 'hover:bg-accent hover:text-accent-foreground active:bg-accent'
                        }`}
                      >
                      <div className="font-medium text-xs sm:text-sm whitespace-nowrap">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground mt-0.5 hidden sm:block whitespace-nowrap">
                          {item.description}
                        </div>
                      )}
                      </button>
                    ))}
                  </div>
                </div>
              );

              // On mobile, render dropdown in portal (body), on desktop render normally
              if (isMobile && typeof document !== 'undefined') {
                return createPortal(dropdownContent, document.body);
              }
              return dropdownContent;
            })()}
          </div>
        ))}
      </div>
    </div>
  );
}
