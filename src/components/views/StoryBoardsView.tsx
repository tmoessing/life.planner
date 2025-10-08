import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { storiesAtom, rolesAtom, visionsAtom, safeSprintsAtom, settingsAtom, updateStoryAtom, deleteStoryAtom, goalsAtom, projectsAtom } from '@/stores/appStore';
import { getWeightGradientColor } from '@/utils';
import { FilterBar } from '@/components/forms/FilterBar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { Plus, Target, Calendar, Grid, Edit, Weight, Users, Star, List, PieChart, Filter, X } from 'lucide-react';
import type { Priority, StoryType, Story } from '@/types';

type BoardType = 'Priority' | 'Role' | 'Type' | 'Vision' | 'Weight' | 'Size';
type ViewType = 'list' | 'pie';

export function StoryBoardsView() {
  const [stories] = useAtom(storiesAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [goals] = useAtom(goalsAtom);
  const [projects] = useAtom(projectsAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [settings] = useAtom(settingsAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [selectedSprintId, setSelectedSprintId] = useState<string>('all');
  const [selectedBoardType, setSelectedBoardType] = useState<BoardType>('Priority');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('Q4');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [draggedStoryId, setDraggedStoryId] = useState<string | null>(null);
  const [dragOverBoardId, setDragOverBoardId] = useState<string | null>(null);
  const [selectedStoryIds, setSelectedStoryIds] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Comprehensive filter state
  const [filters, setFilters] = useState({
    priority: 'all' as Priority | 'all',
    type: 'all' as StoryType | 'all',
    roleId: 'all' as string | 'all',
    visionId: 'all' as string | 'all',
    goalId: 'all' as string | 'all',
    projectId: 'all' as string | 'all',
    weight: 'all' as number | 'all',
    size: 'all' as string | 'all',
    status: 'all' as string | 'all',
    location: 'all' as string | 'all',
    dueDate: 'all' as string | 'all',
    scheduledDate: 'all' as string | 'all'
  });

  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  const weights = [1, 3, 5, 8, 13, 21];
  const sizes = settings.storySizes || [
    { name: 'XS', color: '#10B981', timeEstimate: '15 min' },
    { name: 'S', color: '#3B82F6', timeEstimate: '30 min' },
    { name: 'M', color: '#F59E0B', timeEstimate: '1 hour' },
    { name: 'L', color: '#EF4444', timeEstimate: '2-4 hours' },
    { name: 'XL', color: '#8B5CF6', timeEstimate: '1+ days' }
  ];
  
  // Filter stories based on all selected filters
  const getFilteredStories = () => {
    let filtered = stories.filter(story => !story.deleted);
    
    // Sprint filter
    if (selectedSprintId !== 'all') {
      filtered = filtered.filter(story => story.sprintId === selectedSprintId);
    }
    
    // Comprehensive filters
    if (filters.priority !== 'all') {
      filtered = filtered.filter(story => story.priority === filters.priority);
    }
    
    if (filters.type !== 'all') {
      filtered = filtered.filter(story => story.type === filters.type);
    }
    
    if (filters.roleId !== 'all') {
      filtered = filtered.filter(story => story.roleId === filters.roleId);
    }
    
    if (filters.visionId !== 'all') {
      filtered = filtered.filter(story => story.visionId === filters.visionId);
    }
    
    if (filters.goalId !== 'all') {
      filtered = filtered.filter(story => story.goalId === filters.goalId);
    }
    
    if (filters.projectId !== 'all') {
      filtered = filtered.filter(story => story.projectId === filters.projectId);
    }
    
    if (filters.weight !== 'all') {
      filtered = filtered.filter(story => story.weight === filters.weight);
    }
    
    if (filters.size !== 'all') {
      filtered = filtered.filter(story => story.size === filters.size);
    }
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(story => story.status === filters.status);
    }
    
    if (filters.location !== 'all') {
      filtered = filtered.filter(story => story.location === filters.location);
    }
    
    if (filters.dueDate !== 'all') {
      filtered = filtered.filter(story => story.dueDate === filters.dueDate);
    }
    
    if (filters.scheduledDate !== 'all') {
      filtered = filtered.filter(story => story.scheduled === filters.scheduledDate);
    }
    
    return filtered;
  };

  // Helper functions for filter management
  const updateFilter = (key: keyof typeof filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    setFilters({
      priority: 'all',
      type: 'all',
      roleId: 'all',
      visionId: 'all',
      goalId: 'all',
      projectId: 'all',
      weight: 'all',
      size: 'all',
      status: 'all',
      location: 'all',
      dueDate: 'all',
      scheduledDate: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== 'all').length;
  };

  // Helper function to get range of stories between two indices
  const getStoriesInRange = (storyList: Story[], startIndex: number, endIndex: number): string[] => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return storyList.slice(start, end + 1).map(story => story.id);
  };

  const getStoriesByPriority = (priority: Priority) => {
    return getFilteredStories().filter(story => story.priority === priority);
  };

  const getStoriesByRole = (roleId: string) => {
    return getFilteredStories().filter(story => story.roleId === roleId);
  };

  const getStoriesByType = (type: StoryType) => {
    return getFilteredStories().filter(story => story.type === type);
  };

  const getStoriesByVision = (visionId: string) => {
    return getFilteredStories().filter(story => story.visionId === visionId);
  };

  const getStoriesByWeight = (weight: number) => {
    return getFilteredStories().filter(story => story.weight === weight);
  };

  const getStoriesBySize = (size: string) => {
    return getFilteredStories().filter(story => story.size === size);
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Q1':
        return 'bg-red-50 border-red-200';
      case 'Q2':
        return 'bg-orange-50 border-orange-200';
      case 'Q3':
        return 'bg-yellow-50 border-yellow-200';
      case 'Q4':
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  // Get badge color based on type and value
  const getBadgeColor = (type: 'size' | 'priority' | 'weight', value: any) => {
    switch (type) {
      case 'size':
        const size = sizes.find(s => s.name === value);
        return size ? `bg-[${size.color}]/10 border-[${size.color}]/30 text-[${size.color}]` : 'bg-gray-50 border-gray-200';
      case 'priority':
        return getPriorityColor(value);
      case 'weight':
        // Color based on weight gradient from settings
        const gradientColor = getWeightGradientColor(value, settings.weightBaseColor, 21);
        return `bg-[${gradientColor}]/10 border-[${gradientColor}]/30 text-[${gradientColor}]`;
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };


  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, storyId: string) => {
    console.log('Drag start for story:', storyId);
    setDraggedStoryId(storyId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', storyId);
  };

  const handleDragEnd = () => {
    console.log('Drag end');
    setDraggedStoryId(null);
    setDragOverBoardId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragOverBoard = (boardId: string) => {
    console.log('Drag over board:', boardId);
    setDragOverBoardId(boardId);
  };

  const handleDragLeaveBoard = () => {
    console.log('Drag leave board');
    setDragOverBoardId(null);
  };

  const handleDrop = (e: React.DragEvent, targetBoardId: string, targetValue: any) => {
    e.preventDefault();
    const storyId = e.dataTransfer.getData('text/plain');
    console.log('Drop event:', { storyId, targetBoardId, targetValue, draggedStoryId });
    
    if (storyId) {
      // Update the story based on the board type
      let updates: Partial<Story> = {};
      
      switch (selectedBoardType) {
        case 'Priority':
          updates.priority = targetValue;
          break;
        case 'Role':
          updates.roleId = targetValue;
          break;
        case 'Type':
          updates.type = targetValue;
          break;
        case 'Vision':
          updates.visionId = targetValue;
          break;
        case 'Weight':
          updates.weight = targetValue;
          break;
        case 'Size':
          updates.size = targetValue;
          break;
      }
      
      console.log('Updating story with:', updates);
      updateStory(storyId, updates);
    }
    
    setDraggedStoryId(null);
    setDragOverBoardId(null);
  };

  // Edit handlers
  const handleStoryClick = (e: React.MouseEvent, storyId: string, storyList?: Story[], currentIndex?: number) => {
    // Don't handle click if it's a drag operation
    if (e.defaultPrevented) return;
    
    if (e.ctrlKey && e.shiftKey && storyList && currentIndex !== undefined && lastSelectedIndex !== null) {
      // Range selection with Ctrl+Shift
      const rangeStoryIds = getStoriesInRange(storyList, lastSelectedIndex, currentIndex);
      setSelectedStoryIds(prev => {
        const newSet = new Set(prev);
        rangeStoryIds.forEach(id => newSet.add(id));
        return newSet;
      });
    } else if (e.ctrlKey || e.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedStoryIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(storyId)) {
          newSet.delete(storyId);
        } else {
          newSet.add(storyId);
        }
        return newSet;
      });
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    } else {
      // Single select
      setSelectedStoryIds(new Set([storyId]));
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    }
  };

  const clearSelection = () => {
    setSelectedStoryIds(new Set());
    setLastSelectedIndex(null);
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditStoryModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingStory(null);
    setShowEditStoryModal(false);
  };

  const handleDeleteSelected = () => {
    if (selectedStoryIds.size > 0) {
      if (confirm(`Are you sure you want to delete ${selectedStoryIds.size} selected stories?`)) {
        selectedStoryIds.forEach(storyId => {
          deleteStory(storyId);
        });
        clearSelection();
      }
    }
  };

  // Handle keyboard events
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedStoryIds.size > 0) {
          e.preventDefault();
          handleDeleteSelected();
        }
      } else if (e.key === 'Escape') {
        clearSelection();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStoryIds]);

  const renderStoryCard = (story: Story, storyList?: Story[], index?: number) => (
    <div
      key={story.id}
      draggable
      onDragStart={(e) => handleDragStart(e, story.id)}
      onDragEnd={handleDragEnd}
      onClick={(e) => handleStoryClick(e, story.id, storyList, index)}
      className={`group p-3 bg-background rounded border cursor-pointer hover:shadow-sm transition-shadow ${
        draggedStoryId === story.id ? 'opacity-50' : ''
      } ${
        selectedStoryIds.has(story.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
      <h4 className="font-medium text-sm mb-1">{story.title}</h4>
      <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className={`text-xs flex items-center gap-1 ${getBadgeColor('weight', story.weight)}`}>
              <Weight className="h-3 w-3" />
          {story.weight}
        </Badge>
            <Badge variant="outline" className={`text-xs ${getBadgeColor('size', story.size)}`}>
          {story.size}
        </Badge>
            <Badge variant="outline" className={`text-xs ${getBadgeColor('priority', story.priority)}`}>
          {story.priority}
        </Badge>
      </div>
      {story.roleId && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
          {roles.find(r => r.id === story.roleId)?.name}
        </div>
      )}
      {story.visionId && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3" />
          {visions.find(v => v.id === story.visionId)?.title}
        </div>
      )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            handleEditStory(story);
          }}
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );

  // Pie chart data preparation
  const getPieChartData = () => {
    // const filteredStories = getFilteredStories();
    
    switch (selectedBoardType) {
      case 'Priority':
        return priorities.map(priority => ({
          label: priority,
          value: getStoriesByPriority(priority).length,
          color: getPriorityColor(priority).includes('red') ? '#EF4444' : 
                 getPriorityColor(priority).includes('orange') ? '#F59E0B' :
                 getPriorityColor(priority).includes('yellow') ? '#EAB308' : '#6B7280'
        }));
      
      case 'Role':
        return roles.map(role => ({
          label: role.name,
          value: getStoriesByRole(role.id).length,
          color: role.color
        }));
      
      case 'Type':
        const storyTypes = settings.storyTypes || [
          { name: 'Spiritual', color: '#8B5CF6' },
          { name: 'Physical', color: '#EF4444' },
          { name: 'Intellectual', color: '#3B82F6' },
          { name: 'Social', color: '#10B981' }
        ];
        return storyTypes.map(type => ({
          label: type.name,
          value: getStoriesByType(type.name as StoryType).length,
          color: type.color
        }));
      
      case 'Vision':
        return visions.map(vision => ({
          label: vision.title,
          value: getStoriesByVision(vision.id).length,
          color: settings.visionTypes?.find(vt => vt.name === vision.type)?.color || '#8B5CF6'
        }));
      
      case 'Weight':
        return weights.map(weight => ({
          label: `Weight ${weight}`,
          value: getStoriesByWeight(weight).length,
          color: getWeightGradientColor(weight, settings.weightBaseColor, 21)
        }));
      
      case 'Size':
        return sizes.map(size => ({
          label: size.name,
          value: getStoriesBySize(size.name).length,
          color: size.color
        }));
      
      default:
        return [];
    }
  };

  const renderPieChart = () => {
    const data = getPieChartData().filter(item => item.value > 0);
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          <div className="text-center">
            <PieChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No stories to display</p>
          </div>
        </div>
      );
    }

    let currentAngle = 0;
    const radius = 120;
    const centerX = 150;
    const centerY = 150;

    return (
      <div className="flex items-center justify-center p-6">
        <div className="relative">
          <svg width="300" height="300" className="transform -rotate-90">
            {data.map((item, index) => {
              const percentage = item.value / total;
              const angle = percentage * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                  data-tooltip={`${item.label}: ${item.value} stories (${Math.round(percentage * 100)}%)`}
                />
              );
            })}
          </svg>
          
          {/* Legend */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
                <span className="text-muted-foreground">({item.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBoards = () => {
    switch (selectedBoardType) {
      case 'Priority':
        return priorities.map((priority) => {
          const priorityStories = getStoriesByPriority(priority);
          return (
            <Card 
              key={priority} 
              className={`${getPriorityColor(priority)} ${
                dragOverBoardId === priority ? 'ring-2 ring-blue-500' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragOverBoard(priority)}
              onDragLeave={handleDragLeaveBoard}
              onDrop={(e) => handleDrop(e, priority, priority)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{priority}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {priorityStories.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {priorityStories.map((story, index) => renderStoryCard(story, priorityStories, index))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSelectedPriority(priority);
                    setShowAddStoryModal(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </CardContent>
            </Card>
          );
        });

      case 'Role':
        return roles.map((role) => {
          const roleStories = getStoriesByRole(role.id);
          return (
            <Card 
              key={role.id} 
              className={`bg-blue-50 border-blue-200 ${
                dragOverBoardId === role.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragOverBoard(role.id)}
              onDragLeave={handleDragLeaveBoard}
              onDrop={(e) => handleDrop(e, role.id, role.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: role.color }}
                    />
                    <CardTitle className="text-base">{role.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {roleStories.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {roleStories.map((story, index) => renderStoryCard(story, roleStories, index))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAddStoryModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </CardContent>
            </Card>
          );
        });

      case 'Type':
        const storyTypes = settings.storyTypes || [
          { name: 'Spiritual', color: '#8B5CF6' },
          { name: 'Physical', color: '#EF4444' },
          { name: 'Intellectual', color: '#3B82F6' },
          { name: 'Social', color: '#10B981' }
        ];
        return storyTypes.map((type) => {
          const typeStories = getStoriesByType(type.name as StoryType);
          return (
            <Card 
              key={type.name} 
              className={`bg-gray-50 border-gray-200 ${
                dragOverBoardId === type.name ? 'ring-2 ring-blue-500' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragOverBoard(type.name)}
              onDragLeave={handleDragLeaveBoard}
              onDrop={(e) => handleDrop(e, type.name, type.name)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: type.color }}
                    />
                    <CardTitle className="text-base">{type.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {typeStories.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {typeStories.map((story, index) => renderStoryCard(story, typeStories, index))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAddStoryModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </CardContent>
            </Card>
          );
        });

      case 'Vision':
        return visions.map((vision) => {
          const visionStories = getStoriesByVision(vision.id);
          const visionType = settings.visionTypes?.find(vt => vt.name === vision.type);
          return (
            <Card 
              key={vision.id} 
              className={`bg-purple-50 border-purple-200 ${
                dragOverBoardId === vision.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragOverBoard(vision.id)}
              onDragLeave={handleDragLeaveBoard}
              onDrop={(e) => handleDrop(e, vision.id, vision.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: visionType?.color || '#8B5CF6' }}
                    />
                    <CardTitle className="text-base">{vision.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {visionStories.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {visionStories.map((story, index) => renderStoryCard(story, visionStories, index))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAddStoryModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </CardContent>
            </Card>
          );
        });

      case 'Weight':
        return weights.map((weight) => {
          const weightStories = getStoriesByWeight(weight);
          const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor, 21);
          return (
            <Card 
              key={weight} 
              className={`${
                dragOverBoardId === weight.toString() ? 'ring-2 ring-blue-500' : ''
              }`}
              style={{
                backgroundColor: `${gradientColor}10`,
                borderColor: `${gradientColor}30`
              }}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragOverBoard(weight.toString())}
              onDragLeave={handleDragLeaveBoard}
              onDrop={(e) => handleDrop(e, weight.toString(), weight)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: gradientColor }}
                    />
                  <CardTitle className="text-base">Weight {weight}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {weightStories.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {weightStories.map((story, index) => renderStoryCard(story, weightStories, index))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAddStoryModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </CardContent>
            </Card>
          );
        });

      case 'Size':
        return sizes.map((size) => {
          const sizeStories = getStoriesBySize(size.name);
          return (
            <Card 
              key={size.name} 
              className={`bg-orange-50 border-orange-200 ${
                dragOverBoardId === size.name ? 'ring-2 ring-blue-500' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragOverBoard(size.name)}
              onDragLeave={handleDragLeaveBoard}
              onDrop={(e) => handleDrop(e, size.name, size.name)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: size.color }}
                    />
                    <CardTitle className="text-base">{size.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {sizeStories.length}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {size.timeEstimate}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {sizeStories.map((story, index) => renderStoryCard(story, sizeStories, index))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => setShowAddStoryModal(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Story
                </Button>
              </CardContent>
            </Card>
          );
        });

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Story Boards</h2>
        </div>
        {selectedStoryIds.size > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {selectedStoryIds.size} selected
            </Badge>
            <Button 
              size="sm" 
              variant="destructive" 
              onClick={handleDeleteSelected}
              className="text-xs h-6"
            >
              Delete
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearSelection}
              className="text-xs h-6"
            >
              Clear
            </Button>
          </div>
        )}
      </div>

      {/* Sprint and Board Type Selection */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Sprint" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sprints</SelectItem>
              {sprints.map((sprint) => (
                <SelectItem key={sprint.id} value={sprint.id}>
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
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

        <div className="flex items-center gap-2">
          <Grid className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedBoardType} onValueChange={(value: BoardType) => setSelectedBoardType(value)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Priority">Priority</SelectItem>
              <SelectItem value="Role">Role</SelectItem>
              <SelectItem value="Type">Type</SelectItem>
              <SelectItem value="Vision">Vision</SelectItem>
              <SelectItem value="Weight">Weight</SelectItem>
              <SelectItem value="Size">Size</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <div className="flex border rounded-md">
            <Button
              variant={viewType === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('list')}
              className="rounded-r-none"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewType === 'pie' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('pie')}
              className="rounded-l-none"
            >
              <PieChart className="h-4 w-4 mr-1" />
              Chart
            </Button>
          </div>
        </div>
      </div>

      <FilterBar />

      {/* Comprehensive Filter Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <CardTitle className="text-base">Story Filters</CardTitle>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-xs"
              >
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {showFilters && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Priority Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorities.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: settings.priorityColors?.[priority] || '#6B7280' }}
                          />
                          {priority}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {settings.storyTypes?.map((type) => (
                      <SelectItem key={type.name} value={type.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select value={filters.roleId} onValueChange={(value) => updateFilter('roleId', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Vision Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vision</label>
                <Select value={filters.visionId} onValueChange={(value) => updateFilter('visionId', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Visions</SelectItem>
                    {visions.map((vision) => (
                      <SelectItem key={vision.id} value={vision.id}>
                        {vision.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Goal Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal</label>
                <Select value={filters.goalId} onValueChange={(value) => updateFilter('goalId', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Goals</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select value={filters.projectId} onValueChange={(value) => updateFilter('projectId', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Weight Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight</label>
                <Select value={filters.weight.toString()} onValueChange={(value) => updateFilter('weight', value === 'all' ? 'all' : parseInt(value))}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Weights</SelectItem>
                    {weights.map((weight) => (
                      <SelectItem key={weight} value={weight.toString()}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getWeightGradientColor(weight, settings.weightBaseColor, 21) }}
                          />
                          Weight {weight}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Size Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Size</label>
                <Select value={filters.size} onValueChange={(value) => updateFilter('size', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sizes</SelectItem>
                    {sizes.map((size) => (
                      <SelectItem key={size.name} value={size.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: size.color }}
                          />
                          {size.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {['icebox', 'backlog', 'todo', 'in-progress', 'review', 'done'].map((status) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: settings.statusColors?.[status] || '#6B7280' }}
                          />
                          {status}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {Array.from(new Set(stories.filter(s => s.location).map(s => s.location))).map((location) => (
                      <SelectItem key={location} value={location!}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {viewType === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {renderBoards()}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {selectedBoardType} Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderPieChart()}
          </CardContent>
        </Card>
      )}
      
      <AddStoryModal 
        open={showAddStoryModal} 
        onOpenChange={setShowAddStoryModal}
        initialData={{ priority: selectedPriority }}
      />
      
      {editingStory && (
        <EditStoryModal 
          open={showEditStoryModal} 
          onOpenChange={handleCloseEditModal}
          story={editingStory}
        />
      )}
    </div>
  );
}
