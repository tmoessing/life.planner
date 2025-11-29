import { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  currentSprintAtom, 
  safeSprintsAtom,
  selectedSprintIdAtom
} from '@/stores/appStore';
import { SprintKanbanBoard } from '@/components/boards/SprintKanbanBoard';
import { RoadmapSection } from '@/components/RoadmapSection';
import { FilterBar } from '@/components/forms/FilterBar';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar, Search, Filter, Plus } from 'lucide-react';

export function SprintView() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [selectedSprintId, setSelectedSprintId] = useAtom(selectedSprintIdAtom);
  const [showSearch, setShowSearch] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  
  // Get the selected sprint or fall back to current sprint
  // If 'all-sprints' is selected, don't try to find a sprint
  const selectedSprint = selectedSprintId === 'all-sprints' 
    ? null 
    : (sprints.find(sprint => sprint.id === selectedSprintId) || currentSprint);

  const renderSections = () => {
    return (
      <>
        <div className="mb-4 sm:mb-6">
          <SprintKanbanBoard showAllSprints={selectedSprintId === 'all-sprints'} />
        </div>
        
        <div className="mb-4 sm:mb-6">
          <RoadmapSection />
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sprint Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Sprint Selector - Left aligned */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedSprintId || currentSprint?.id} onValueChange={setSelectedSprintId}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Select Sprint">
                {selectedSprintId === 'all-sprints' ? (
                  <div className="flex flex-col">
                    <span className="font-medium">All Sprints</span>
                    <span className="text-xs text-muted-foreground">
                      View all sprints combined
                    </span>
                  </div>
                ) : selectedSprint ? (
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Week {selectedSprint.isoWeek} - {selectedSprint.year}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
                    </span>
                  </div>
                ) : null}
              </SelectValue>
            </SelectTrigger>
            <SelectContent side="bottom" align="start" className="w-[var(--radix-select-trigger-width)]">
              <SelectItem key="all-sprints" value="all-sprints">
                <div className="flex flex-col">
                  <span className="font-medium">All Sprints</span>
                  <span className="text-xs text-muted-foreground">
                    View all sprints combined
                  </span>
                </div>
              </SelectItem>
              {sprints.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      Week {sprint.isoWeek} - {sprint.year}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search, Filter, and Add Story Buttons - Right aligned */}
        <div className="flex items-center gap-2">
          <Button
            variant={showSearch ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowSearch(!showSearch);
              if (showSearch) setShowFilter(false);
            }}
            className={`gap-2 ${showSearch ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'}`}
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
          <Button
            variant={showFilter ? "default" : "outline"}
            size="sm"
            onClick={() => {
              setShowFilter(!showFilter);
              if (showFilter) setShowSearch(false);
            }}
            className={`gap-2 ${showFilter ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'}`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowAddStoryModal(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Story</span>
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      {showSearch && (
        <div>
          <FilterBar showSearchOnly={true} />
        </div>
      )}

      {/* Filter Panel */}
      {showFilter && (
        <div>
          <FilterBar showFilterOnly={true} />
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4 sm:space-y-6">
        {renderSections()}
      </div>

      {/* Add Story Modal */}
      <AddStoryModal
        open={showAddStoryModal}
        onOpenChange={setShowAddStoryModal}
        initialData={{
          sprintId: selectedSprintId === 'all-sprints' ? undefined : (selectedSprintId || currentSprint?.id)
        }}
      />
    </div>
  );
}
