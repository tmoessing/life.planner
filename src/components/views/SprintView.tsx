import { useAtom } from 'jotai';
import { 
  currentSprintAtom, 
  safeSprintsAtom,
  selectedSprintIdAtom
} from '@/stores/appStore';
import { SprintKanbanBoard } from '@/components/boards/SprintKanbanBoard';
import { ChartsSection } from '@/components/charts/ChartsSection';
import { RoadmapSection } from '@/components/RoadmapSection';
import { FilterBar } from '@/components/forms/FilterBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';

export function SprintView() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [selectedSprintId, setSelectedSprintId] = useAtom(selectedSprintIdAtom);
  
  // Get the selected sprint or fall back to current sprint
  const selectedSprint = sprints.find(sprint => sprint.id === selectedSprintId) || currentSprint;

  const renderSections = () => {
    return (
      <>
        <div className="mb-6">
          <SprintKanbanBoard showAllSprints={selectedSprintId === 'all-sprints'} />
        </div>
        
        <div className="mb-6">
          <RoadmapSection />
        </div>
        
        <div className="mb-6">
          <ChartsSection />
        </div>
      </>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Sprint Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold mb-2">Sprint View</h1>
            <h2 className="text-lg sm:text-2xl font-bold">
              {selectedSprintId === 'all-sprints' ? 'All Sprints' : 
               selectedSprint ? `Week ${selectedSprint.isoWeek} - ${selectedSprint.year}` : 'Select Sprint'}
            </h2>
            {selectedSprintId === 'all-sprints' ? (
              <p className="text-sm text-muted-foreground">
                View all sprints combined
              </p>
            ) : selectedSprint && (
              <p className="text-sm text-muted-foreground">
                {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
              </p>
            )}
          </div>
          
          {/* Sprint Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedSprintId || currentSprint?.id} onValueChange={setSelectedSprintId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Select Sprint">
                  {selectedSprint && (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        Week {selectedSprint.isoWeek} - {selectedSprint.year}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
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
        </div>
        
      </div>

      {/* Filter Bar */}
      <FilterBar />


      {/* Main Content */}
      <div className="space-y-6">
        {renderSections()}
      </div>
    </div>
  );
}
