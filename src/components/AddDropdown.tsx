import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { ProjectModal } from '@/components/modals/ProjectModal';
import { ClassModal } from '@/components/modals/ClassModal';
import { GoalModal } from '@/components/modals/GoalModal';
import { BucketlistModal } from '@/components/modals/BucketlistModal';
import { Plus, ChevronDown, FileText, Target, FolderOpen, GraduationCap, List, Layers } from 'lucide-react';
import { ViewType } from '@/constants/views';
import { settingsAtom } from '@/stores/settingsStore';
import { useViewPrefetch } from '@/hooks/useViewPrefetch';

interface AddDropdownProps {
  setCurrentView: (view: ViewType) => void;
}

export function AddDropdown({ setCurrentView }: AddDropdownProps) {
  const [settings] = useAtom(settingsAtom);
  const { prefetchView } = useViewPrefetch();
  const [isOpen, setIsOpen] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddBucketlistModal, setShowAddBucketlistModal] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<'left' | 'right'>('right');
  const [buttonPosition, setButtonPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
    
    // Calculate position for mobile responsiveness
    setTimeout(() => {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        
        // If dropdown would go off-screen to the right, position it to the left
        if (rect.right > viewportWidth - 20) {
          setDropdownPosition('left');
        } else {
          setDropdownPosition('right');
        }
      }
    }, 0);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleTouchStart = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    const wasOpen = isOpen;
    setIsOpen(!wasOpen);
    
    // On mobile, calculate button position for fixed dropdown
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile && !wasOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 320; // Approximate dropdown width
      
      // Calculate left position to keep dropdown in viewport
      let leftPos = rect.left;
      if (leftPos + dropdownWidth > viewportWidth - 8) {
        leftPos = viewportWidth - dropdownWidth - 8;
      }
      if (leftPos < 8) {
        leftPos = 8;
      }
      
      setButtonPosition({
        top: rect.bottom + 4,
        left: leftPos,
        width: rect.width
      });
    } else if (wasOpen) {
      setButtonPosition(null);
    }
  };

  const handleItemClick = (action: () => void) => {
    action();
    setIsOpen(false);
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
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Element;
      if (isOpen && !target.closest('[data-dropdown]')) {
        setIsOpen(false);
        setButtonPosition(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      <div className="relative" data-dropdown>
        <Button 
          ref={buttonRef}
          size="sm" 
          className="gap-1 sm:gap-2 text-xs sm:text-sm touch-target h-11 w-11 sm:h-auto sm:w-auto px-2 sm:px-3"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleTouchStart}
        >
          <Plus className="h-4 w-4 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">Add</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {isOpen && (() => {
          const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
          const dropdownContent = (
            <div 
              ref={dropdownRef}
              className={`${isMobile ? 'fixed' : 'absolute'} ${isMobile ? '' : 'top-full'} ${isMobile ? '' : 'mt-1'} ${isMobile ? '' : dropdownPosition === 'right' ? 'right-0' : 'left-0'} w-72 sm:w-80 bg-background border rounded-md shadow-lg z-[100] max-w-[calc(100vw-1rem)] sm:max-w-none ${
                isMobile ? '' : dropdownPosition === 'right' 
                  ? 'right-0' 
                  : 'left-0'
              }`}
              style={isMobile && buttonPosition ? {
                top: `${buttonPosition.top}px`,
                left: `${Math.max(8, Math.min(buttonPosition.left, window.innerWidth - 300))}px`,
                width: 'auto',
                minWidth: '280px',
                maxWidth: `${Math.min(320, window.innerWidth - Math.max(8, buttonPosition.left) - 8)}px`,
                right: 'auto',
              } : undefined}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => e.stopPropagation()}
            >
            <div className="py-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-1">
                {/* Left Column - Single Add */}
                <div className="px-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Single Add</div>
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setShowAddStoryModal(true))}
                    onTouchStart={() => handleItemClick(() => setShowAddStoryModal(true))}
                  >
                    <FileText className="h-4 w-4 flex-shrink-0" />
                    Story
                  </button>
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setShowAddGoalModal(true))}
                    onTouchStart={() => handleItemClick(() => setShowAddGoalModal(true))}
                  >
                    <Target className="h-4 w-4 flex-shrink-0" />
                    Goal
                  </button>
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setShowAddProjectModal(true))}
                    onTouchStart={() => handleItemClick(() => setShowAddProjectModal(true))}
                  >
                    <FolderOpen className="h-4 w-4 flex-shrink-0" />
                    Project
                  </button>
                  {settings.layout.sections.classes && (
                    <button
                      className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                      onClick={() => handleItemClick(() => setShowAddClassModal(true))}
                      onTouchStart={() => handleItemClick(() => setShowAddClassModal(true))}
                    >
                      <GraduationCap className="h-4 w-4 flex-shrink-0" />
                      Class
                    </button>
                  )}
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setShowAddBucketlistModal(true))}
                    onTouchStart={() => handleItemClick(() => setShowAddBucketlistModal(true))}
                  >
                    <List className="h-4 w-4 flex-shrink-0" />
                    Bucketlist
                  </button>
                </div>

                {/* Right Column - Bulk Add */}
                <div className="px-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Bulk Add</div>
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setCurrentView('add-stories'))}
                    onMouseEnter={() => prefetchView('add-stories')}
                    onFocus={() => prefetchView('add-stories')}
                    onTouchStart={() => {
                      prefetchView('add-stories');
                      handleItemClick(() => setCurrentView('add-stories'));
                    }}
                  >
                    <Layers className="h-4 w-4 flex-shrink-0" />
                    Stories
                  </button>
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setCurrentView('add-goals'))}
                    onMouseEnter={() => prefetchView('add-goals')}
                    onFocus={() => prefetchView('add-goals')}
                    onTouchStart={() => {
                      prefetchView('add-goals');
                      handleItemClick(() => setCurrentView('add-goals'));
                    }}
                  >
                    <Layers className="h-4 w-4 flex-shrink-0" />
                    Goals
                  </button>
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setCurrentView('add-projects'))}
                    onMouseEnter={() => prefetchView('add-projects')}
                    onFocus={() => prefetchView('add-projects')}
                    onTouchStart={() => {
                      prefetchView('add-projects');
                      handleItemClick(() => setCurrentView('add-projects'));
                    }}
                  >
                    <Layers className="h-4 w-4 flex-shrink-0" />
                    Projects
                  </button>
                  <button
                    className="w-full px-3 py-3 sm:px-3 sm:py-2 text-left text-xs sm:text-sm hover:bg-muted active:bg-muted flex items-center gap-2 rounded touch-target min-h-[44px] sm:min-h-0"
                    onClick={() => handleItemClick(() => setCurrentView('add-bucketlist'))}
                    onMouseEnter={() => prefetchView('add-bucketlist')}
                    onFocus={() => prefetchView('add-bucketlist')}
                    onTouchStart={() => {
                      prefetchView('add-bucketlist');
                      handleItemClick(() => setCurrentView('add-bucketlist'));
                    }}
                  >
                    <Layers className="h-4 w-4 flex-shrink-0" />
                    Bucketlist
                  </button>
                </div>
              </div>
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

      {/* Modals */}
      <AddStoryModal
        open={showAddStoryModal}
        onOpenChange={setShowAddStoryModal}
      />
      
      <ProjectModal
        isOpen={showAddProjectModal}
        onClose={() => setShowAddProjectModal(false)}
        mode="add"
      />
      
      <ClassModal
        isOpen={showAddClassModal}
        onClose={() => setShowAddClassModal(false)}
        mode="add"
      />
      
      <GoalModal
        isOpen={showAddGoalModal}
        onClose={() => setShowAddGoalModal(false)}
        mode="add"
      />
      
      <BucketlistModal
        isOpen={showAddBucketlistModal}
        onClose={() => setShowAddBucketlistModal(false)}
        mode="add"
      />
    </>
  );
}
