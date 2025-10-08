import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { ProjectModal } from '@/components/modals/ProjectModal';
import { GoalModal } from '@/components/modals/GoalModal';
import { BucketlistModal } from '@/components/modals/BucketlistModal';
import { currentViewAtom } from '@/stores/appStore';
import { Plus, ChevronDown, FileText, Target, FolderOpen, List, Layers } from 'lucide-react';

export function AddDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddBucketlistModal, setShowAddBucketlistModal] = useState(false);
  const [, setCurrentView] = useAtom(currentViewAtom);
  const timeoutRef = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
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

  return (
    <>
      <div className="relative">
        <Button 
          size="sm" 
          className="gap-1 sm:gap-2 text-xs sm:text-sm touch-target"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Add</span>
          <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        {isOpen && (
          <div 
            className="absolute right-0 top-full mt-1 w-80 bg-background border rounded-md shadow-lg z-50"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="py-2">
              <div className="grid grid-cols-2 gap-1">
                {/* Left Column - Single Add */}
                <div className="px-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Single Add</div>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setShowAddStoryModal(true))}
                  >
                    <FileText className="h-4 w-4" />
                    Story
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setShowAddGoalModal(true))}
                  >
                    <Target className="h-4 w-4" />
                    Goal
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setShowAddProjectModal(true))}
                  >
                    <FolderOpen className="h-4 w-4" />
                    Project
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setShowAddBucketlistModal(true))}
                  >
                    <List className="h-4 w-4" />
                    Bucketlist
                  </button>
                </div>

                {/* Right Column - Bulk Add */}
                <div className="px-2">
                  <div className="text-xs font-medium text-muted-foreground mb-2 px-2">Bulk Add</div>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setCurrentView('add-stories'))}
                  >
                    <Layers className="h-4 w-4" />
                    Stories
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setCurrentView('add-goals'))}
                  >
                    <Layers className="h-4 w-4" />
                    Goals
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setCurrentView('add-projects'))}
                  >
                    <Layers className="h-4 w-4" />
                    Projects
                  </button>
                  <button
                    className="w-full px-3 py-2 text-left text-sm hover:bg-muted flex items-center gap-2 rounded"
                    onClick={() => handleItemClick(() => setCurrentView('add-bucketlist'))}
                  >
                    <Layers className="h-4 w-4" />
                    Bucketlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
