import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MouseEvent } from 'react';
import { useAtom } from 'jotai';
import {
  storiesAtom,
  rolesAtom,
  visionsAtom,
  safeSprintsAtom,
  settingsAtom,
  deleteStoryAtom,
  goalsAtom,
  projectsAtom
} from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { useStoryFilters } from '@/hooks/useStoryFilters';
import { useStorySelection } from '@/hooks/useStorySelection';
import { useStoryDragAndDrop } from '@/hooks/useStoryDragAndDrop';
import { StoryCard } from '@/components/shared/StoryCard';
import { StoryFilterBar } from '@/components/shared/StoryFilterBar';
import { BoardGridLayout } from '@/components/shared/BoardGridLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { StoryPieChart } from '@/components/views/board/StoryPieChart';
import {
  Plus,
  List,
  PieChart,
  Filter
} from 'lucide-react';
import {
  groupStoriesByPriority,
  groupStoriesByStatus,
  groupStoriesByType,
  groupStoriesByRole,
  groupStoriesByVision,
  groupStoriesByGoal,
  groupStoriesByProject,
  groupStoriesByWeight,
  groupStoriesBySize,
  groupStoriesByLocation,
  groupStoriesByTaskCategory
} from '@/utils/storyUtils';
import type { Story, Priority } from '@/types';

type BoardType = 'Priority' | 'Role' | 'Type' | 'Vision' | 'Goal' | 'Weight' | 'Size' | 'Status' | 'Project' | 'Task Categories' | 'Location';
type ViewType = 'list' | 'pie';

export function StoryBoardsViewRefactored() {
  const [stories] = useAtom(storiesAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [goals] = useAtom(goalsAtom);
  const [projects] = useAtom(projectsAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [settings] = useAtom(settingsAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);

  // Use settings mirror system
  const storySettings = useStorySettings();

  // Custom hooks
  const {
    filters,
    updateFilter,
    resetFilters,
    applyFilters,
    hasActiveFilters
  } = useStoryFilters();

  const {
    selectedStoryIds,
    clearSelection,
    isSelected,
    getSelectedStories,
    handleMultiSelect
  } = useStorySelection();

  const {
    isDragging,
    getDragOverClasses
  } = useStoryDragAndDrop();

  // Local state
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>('Priority');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(0);

  // Update sprint filter when selectedSprintId changes
  useEffect(() => {
    updateFilter('sprintId', selectedSprintId);
  }, [selectedSprintId, updateFilter]);

  // Handle auto-showing done stories when on Status board
  useEffect(() => {
    if (selectedBoardType === 'Status') {
      // updateFilter is now stabilized to prevent redundant updates
      updateFilter('showDone', true);
    }
  }, [selectedBoardType, updateFilter]);

  // Get filtered stories
  const filteredStories = useMemo(() => applyFilters(stories), [stories, applyFilters]);

  // Group stories based on selected board type
  const groupedStories = useMemo(() => {
    switch (selectedBoardType) {
      case 'Priority':
        return groupStoriesByPriority(filteredStories);
      case 'Status':
        return groupStoriesByStatus(filteredStories);
      case 'Type':
        return groupStoriesByType(filteredStories);
      case 'Role':
        return groupStoriesByRole(filteredStories, roles);
      case 'Vision':
        return groupStoriesByVision(filteredStories, visions);
      case 'Goal':
        return groupStoriesByGoal(filteredStories, goals);
      case 'Project':
        return groupStoriesByProject(filteredStories, projects);
      case 'Weight':
        return groupStoriesByWeight(filteredStories);
      case 'Size':
        return groupStoriesBySize(filteredStories);
      case 'Location':
        return groupStoriesByLocation(filteredStories);
      case 'Task Categories':
        return groupStoriesByTaskCategory(filteredStories);
      default:
        return groupStoriesByPriority(filteredStories);
    }
  }, [selectedBoardType, filteredStories, roles, visions, goals, projects]);

  // Get color for board based on type and value
  const getBoardColor = useCallback((boardId: string) => {
    let color = '#6B7280';

    switch (selectedBoardType) {
      case 'Priority':
        color = storySettings.getPriorityColor(boardId as Priority);
        break;
      case 'Status':
        color = storySettings.getStatusColor(boardId);
        break;
      case 'Type':
        color = storySettings.getTypeColor(boardId);
        break;
      case 'Role':
        const role = roles.find(r => r.id === boardId);
        color = role?.color || '#6B7280';
        break;
      case 'Vision':
        const vision = visions.find(v => v.id === boardId);
        color = vision ? storySettings.getVisionTypeColor(vision.type) : '#6B7280';
        break;
      case 'Goal':
        const goal = goals.find(g => g.id === boardId);
        color = goal ? storySettings.getTypeColor(goal.goalType) : '#6B7280';
        break;
      case 'Project':
        // Projects don't have a type property, use a default color
        color = '#6B7280';
        break;
      case 'Weight':
        color = storySettings.getPriorityColor(boardId as Priority);
        break;
      case 'Size':
        color = storySettings.getSizeColor(boardId);
        break;
      case 'Location':
        color = '#6B7280'; // Default for location
        return {
          backgroundColor: '#F9FAFB',
          borderColor: '#E5E7EB',
          color: '#6B7280'
        };
      case 'Task Categories':
        color = storySettings.getTaskCategoryColor(boardId);
        break;
      default:
        color = '#6B7280';
    }

    return {
      backgroundColor: `${color}20`,
      borderColor: `${color}40`,
      color: color
    };
  }, [selectedBoardType, storySettings, roles, visions, goals]);

  // Pie chart data preparation
  const pieChartData = useMemo(() => {
    return Object.entries(groupedStories).map(([groupName, stories]) => ({
      label: groupName,
      value: stories.length,
      color: getBoardColor(groupName).color
    })).filter(item => item.value > 0);
  }, [groupedStories, getBoardColor]);


  // Handle story actions
  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditStoryModal(true);
  };

  const handleDeleteStory = (storyId: string) => {
    deleteStory(storyId);
  };

  const handleStorySelect = (storyId: string, index: number, event: MouseEvent) => {
    handleMultiSelect(storyId, index, filteredStories, event);
  };

  const handleBulkDelete = () => {
    const selectedStories = getSelectedStories(filteredStories);
    selectedStories.forEach(story => deleteStory(story.id));
    clearSelection();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left side: Sprint selector, Group by selector, and View Toggle */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sprint Selection */}
          <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
            <SelectTrigger className="w-[105px] sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  Week {sprint.isoWeek}, {sprint.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Board Type Selection */}
          <Select value={selectedBoardType} onValueChange={(value) => {
            setSelectedBoardType(value as BoardType);
            setCurrentMobileColumnIndex(0);
          }}>
            <SelectTrigger className="w-[105px] sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Priority">Priority</SelectItem>
              <SelectItem value="Status">Status</SelectItem>
              <SelectItem value="Type">Type</SelectItem>
              <SelectItem value="Role">Story Role</SelectItem>
              <SelectItem value="Vision">Vision</SelectItem>
              <SelectItem value="Goal">Goal</SelectItem>
              <SelectItem value="Project">Project</SelectItem>
              <SelectItem value="Weight">Weight</SelectItem>
              <SelectItem value="Size">Size</SelectItem>
              <SelectItem value="Location">Location</SelectItem>
              <SelectItem value="Task Categories">Task Categories</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewType(viewType === 'list' ? 'pie' : 'list')}
            className="gap-2 flex-shrink-0"
          >
            {viewType === 'list' ? (
              <>
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </>
            ) : (
              <>
                <PieChart className="h-4 w-4" />
                <span className="hidden sm:inline">Chart</span>
              </>
            )}
          </Button>
        </div>

        {/* Right side: Filter and Add Story buttons */}
        <div className="flex flex-nowrap items-center gap-2">
          {/* Bulk Actions */}
          {selectedStoryIds.size > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                {selectedStoryIds.size} selected
              </span>
              <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                Delete
              </Button>
              <Button size="sm" variant="outline" onClick={clearSelection}>
                Clear
              </Button>
            </div>
          )}

          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`gap-2 ${showFilters ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600'}`}
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

      {/* Filters */}
      {showFilters && (
        <StoryFilterBar
          filters={filters}
          onFilterChange={updateFilter}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          roles={roles}
          visions={visions}
          goals={goals}
          projects={projects}
          labels={storySettings.labels}
          settings={settings}
        />
      )}


      {/* Content */}
      {viewType === 'list' ? (
        <BoardGridLayout
          columns={Object.entries(groupedStories).map(([groupName, groupStories]) => ({
            id: groupName,
            label: groupName,
            items: groupStories,
            color: getBoardColor(groupName).color
          }))}
          renderItem={(story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              index={index}
              onEdit={handleEditStory}
              onDelete={handleDeleteStory}
              onSelect={(storyId, idx, event) => handleStorySelect(storyId, idx, event)}
              isSelected={isSelected(story.id)}
              isDragging={isDragging(story.id)}
              showActions={true}
              className="transition-all duration-200"
            />
          )}
          currentMobileColumnIndex={currentMobileColumnIndex}
          onMobileColumnChange={setCurrentMobileColumnIndex}
          dragOverClasses={(columnId) => getDragOverClasses(columnId, 'board')}
          gridClassName="gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
        />
      ) : (
        /* Pie Chart View */
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {selectedBoardType} Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StoryPieChart data={pieChartData} />
          </CardContent>
        </Card>
      )}


      {/* Modals */}
      {showAddStoryModal && (
        <AddStoryModal
          open={showAddStoryModal}
          onOpenChange={setShowAddStoryModal}
        />
      )}

      {showEditStoryModal && editingStory && (
        <EditStoryModal
          open={showEditStoryModal}
          onOpenChange={(open) => {
            setShowEditStoryModal(open);
            if (!open) setEditingStory(null);
          }}
          story={editingStory}
        />
      )}
    </div>
  );
}
