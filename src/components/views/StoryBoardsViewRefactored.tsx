import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  storiesAtom, 
  rolesAtom, 
  visionsAtom, 
  safeSprintsAtom, 
  settingsAtom, 
  updateStoryAtom, 
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { 
  Plus, 
  Target, 
  Calendar, 
  Grid, 
  Edit, 
  Weight, 
  Users, 
  Star, 
  List, 
  PieChart, 
  Filter, 
  X 
} from 'lucide-react';
import { StoryService } from '@/services/storyService';
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
import type { Story, Priority, StoryType } from '@/types';

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
  const [, updateStory] = useAtom(updateStoryAtom);
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
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    getSelectedStories,
    handleMultiSelect
  } = useStorySelection();
  
  const {
    dragState,
    startDrag,
    handleDragOver,
    handleDragLeave,
    endDrag,
    isDragging,
    isDragOver,
    getDragOverClasses
  } = useStoryDragAndDrop();

  // Local state
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>('Priority');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('Q4');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [showFilters, setShowFilters] = useState(false);

  // Update sprint filter when selectedSprintId changes
  React.useEffect(() => {
    updateFilter('sprintId', selectedSprintId);
  }, [selectedSprintId, updateFilter]);

  // Get filtered stories
  const filteredStories = applyFilters(stories);

  // Group stories based on selected board type
  const getGroupedStories = () => {
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
  };

  const groupedStories = getGroupedStories();

  // Get color for board based on type and value
  const getBoardColor = (boardId: string) => {
    switch (selectedBoardType) {
      case 'Priority':
        const priorityColor = storySettings.getPriorityColor(boardId as Priority);
        return {
          backgroundColor: `${priorityColor}20`,
          borderColor: `${priorityColor}40`,
          color: priorityColor
        };
      case 'Status':
        const statusColor = storySettings.getStatusColor(boardId);
        return {
          backgroundColor: `${statusColor}20`,
          borderColor: `${statusColor}40`,
          color: statusColor
        };
      case 'Type':
        const typeColor = storySettings.getTypeColor(boardId);
        return {
          backgroundColor: `${typeColor}20`,
          borderColor: `${typeColor}40`,
          color: typeColor
        };
      case 'Role':
        const role = roles.find(r => r.id === boardId);
        const roleColor = role?.color || '#6B7280';
        return {
          backgroundColor: `${roleColor}20`,
          borderColor: `${roleColor}40`,
          color: roleColor
        };
      case 'Vision':
        const vision = visions.find(v => v.id === boardId);
        const visionColor = vision ? storySettings.getVisionTypeColor(vision.type) : '#6B7280';
        return {
          backgroundColor: `${visionColor}20`,
          borderColor: `${visionColor}40`,
          color: visionColor
        };
      case 'Goal':
        const goal = goals.find(g => g.id === boardId);
        const goalColor = goal ? storySettings.getTypeColor(goal.goalType) : '#6B7280';
        return {
          backgroundColor: `${goalColor}20`,
          borderColor: `${goalColor}40`,
          color: goalColor
        };
      case 'Project':
        const project = projects.find(p => p.id === boardId);
        // Projects don't have a type property, use a default color
        const projectColor = '#6B7280';
        return {
          backgroundColor: `${projectColor}20`,
          borderColor: `${projectColor}40`,
          color: projectColor
        };
      case 'Weight':
        const weightColor = storySettings.getPriorityColor(boardId as Priority);
        return {
          backgroundColor: `${weightColor}20`,
          borderColor: `${weightColor}40`,
          color: weightColor
        };
      case 'Size':
        const sizeColor = storySettings.getSizeColor(boardId);
        return {
          backgroundColor: `${sizeColor}20`,
          borderColor: `${sizeColor}40`,
          color: sizeColor
        };
      case 'Location':
        return {
          backgroundColor: '#F9FAFB',
          borderColor: '#E5E7EB',
          color: '#6B7280'
        };
      case 'Task Categories':
        const taskCategoryColor = storySettings.getTaskCategoryColor(boardId);
        return {
          backgroundColor: `${taskCategoryColor}20`,
          borderColor: `${taskCategoryColor}40`,
          color: taskCategoryColor
        };
      default:
        return {
          backgroundColor: '#F9FAFB',
          borderColor: '#E5E7EB',
          color: '#6B7280'
        };
    }
  };

  // Handle story actions
  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditStoryModal(true);
  };

  const handleDeleteStory = (storyId: string) => {
    deleteStory(storyId);
  };

  const handleStorySelect = (storyId: string, index: number, event: React.MouseEvent) => {
    handleMultiSelect(storyId, index, filteredStories, event);
  };

  const handleDragStart = (storyId: string) => {
    startDrag(storyId);
  };

  const handleLocalDragOver = (targetId: string, targetType: 'sprint' | 'board' | 'column') => {
    handleDragOver(targetId, targetType);
  };

  const handleDragEnd = () => {
    endDrag();
  };

  const handleBulkDelete = () => {
    const selectedStories = getSelectedStories(filteredStories);
    selectedStories.forEach(story => deleteStory(story.id));
    clearSelection();
  };

  const handleBulkMove = (targetSprintId: string) => {
    const selectedStories = getSelectedStories(filteredStories);
    selectedStories.forEach(story => {
      updateStory(story.id, { sprintId: targetSprintId });
    });
    clearSelection();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Story Boards</h1>
          <p className="text-muted-foreground">
            Organize and visualize your stories by different criteria
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddStoryModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Story
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Sprint Selection */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Sprint:</label>
                <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                  <SelectTrigger className="w-40">
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
              </div>

              {/* Board Type Selection */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Group by:</label>
                <Select value={selectedBoardType} onValueChange={(value) => setSelectedBoardType(value as BoardType)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Priority">Priority</SelectItem>
                    <SelectItem value="Status">Status</SelectItem>
                    <SelectItem value="Type">Type</SelectItem>
                    <SelectItem value="Role">Role</SelectItem>
                    <SelectItem value="Vision">Vision</SelectItem>
                    <SelectItem value="Goal">Goal</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Weight">Weight</SelectItem>
                    <SelectItem value="Size">Size</SelectItem>
                    <SelectItem value="Location">Location</SelectItem>
                    <SelectItem value="Task Categories">Task Categories</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Type Selection */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">View:</label>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant={viewType === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewType('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewType === 'pie' ? 'default' : 'outline'}
                    onClick={() => setViewType('pie')}
                  >
                    <PieChart className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

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
          </div>
        </CardHeader>
      </Card>

      {/* Filters */}
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

      {/* Story Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
        {Object.entries(groupedStories).map(([groupName, groupStories]) => (
          <Card 
            key={groupName} 
            className={getDragOverClasses(groupName, 'board')}
            style={getBoardColor(groupName)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {groupName}
                  <Badge variant="secondary" className="ml-2">
                    {groupStories.length}
                  </Badge>
                </CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => selectAll(groupStories)}
                >
                  Select All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {groupStories.map((story, index) => (
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
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
