import { useState, useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { 
  goalsAtom, 
  storiesAtom, 
  currentSprintAtom,
  rolesAtom,
  currentViewAtom,
  updateGoalAtom,
  deleteGoalAtom,
  updateStoryAtom
} from '@/stores/appStore';
import { todayViewModeAtom } from '@/stores/uiStore';
import type { ViewType } from '@/types';
import { assignmentsAtom } from '@/stores/assignmentStore';
import { classesAtom } from '@/stores/classStore';
import { settingsAtom } from '@/stores/settingsStore';
import { getWeightGradientColor } from '@/utils/color';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { GoalModal } from '@/components/modals/GoalModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Clock,
  Users,
  Heart,
  Dumbbell,
  Brain,
  TrendingUp,
  Plus,
  MoreVertical,
  Edit,
  X,
  Trash2,
  GraduationCap,
  FileText,
  Book,
  FileCheck,
  FolderKanban,
  ClipboardList,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Eye
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentWeek, getWeekDates } from '@/utils/date';
import { useGoalSettings } from '@/utils/settingsMirror';
import { ChartsSection } from '@/components/charts/ChartsSection';
import { StoryCard } from '@/components/shared/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import type { Goal, Story, Assignment, AssignmentType, Class } from '@/types';

const goalTypeIcons = {
  spiritual: Heart,
  social: Users,
  intellectual: Brain,
  physical: Dumbbell,
  financial: TrendingUp,
  protector: Target
};

// Remove hardcoded colors - we'll use settings mirror instead

export function FocusView() {
  const [goals] = useAtom(goalsAtom);
  const [stories] = useAtom(storiesAtom);
  const [currentSprint] = useAtom(currentSprintAtom);
  const [roles] = useAtom(rolesAtom);
  const [, setCurrentView] = useAtom(currentViewAtom);
  const [, updateGoal] = useAtom(updateGoalAtom);
  const [, deleteGoal] = useAtom(deleteGoalAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  
  // State for goal selection modal
  const [isGoalSelectionOpen, setIsGoalSelectionOpen] = useState(false);
  const [selectedGoalType, setSelectedGoalType] = useState<string>('');
  
  // State for goal dropdown menus
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [creatingGoalType, setCreatingGoalType] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State for section expand/collapse
  const [isGoalsExpanded, setIsGoalsExpanded] = useState(true);
  const [isStoriesExpanded, setIsStoriesExpanded] = useState(true);
  const [isSchoolExpanded, setIsSchoolExpanded] = useState(true);
  
  // State for section dropdowns
  const [openSectionDropdown, setOpenSectionDropdown] = useState<string | null>(null);
  
  // State for story editing
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showScheduleStoriesModal, setShowScheduleStoriesModal] = useState(false);
  
  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditStoryModal(true);
  };
  
  const handleCloseEditStoryModal = () => {
    setShowEditStoryModal(false);
    setEditingStory(null);
  };
  
  // Get today's date string (ISO format)
  const todayDateString = new Date().toISOString().split('T')[0];

  // Get sprint stories for scheduling modal
  const sprintStories = stories.filter(story => 
    !story.deleted && 
    story.sprintId === currentSprint?.id && 
    ['todo', 'progress', 'review'].includes(story.status)
  );

  const handleScheduleStory = (storyId: string) => {
    const story = sprintStories.find(s => s.id === storyId);
    if (!story) return;
    
    // Toggle: if already scheduled for today, unschedule it; otherwise schedule it
    const newScheduledDate = (story.scheduledDate === todayDateString || story.scheduled === todayDateString) 
      ? undefined 
      : todayDateString;
    
    updateStory(storyId, { 
      scheduledDate: newScheduledDate,
      scheduled: newScheduledDate 
    });
  };
  
  // State for view mode toggle (today vs week) - using shared atom
  const [viewMode, setViewMode] = useAtom(todayViewModeAtom);
  const [isDraggingWeek, setIsDraggingWeek] = useState(false);
  const [isDraggingToday, setIsDraggingToday] = useState(false);
  
  // Use goal settings mirror for proper colors and types
  const goalSettings = useGoalSettings();

  // Get assignments and classes
  const [assignments] = useAtom(assignmentsAtom);
  const [classes] = useAtom(classesAtom);
  const [settings] = useAtom(settingsAtom);

  // Get current week info
  const { isoWeek, year } = getCurrentWeek();
  const { startDate, endDate } = getWeekDates(isoWeek, year);

  // Filter goals for the four main categories (show all except done)
  const activeGoals = goals.filter(goal => 
    goal.status !== 'done' && 
    ['Spiritual', 'Social', 'Intellectual', 'Physical'].includes(goal.goalType)
  );

  // Filter stories based on view mode
  // Only show stories from current sprint in to do, in progress, or review stages
  const filteredStories = stories.filter(story => {
    if (story.deleted) return false;
    
    // Only show stories from current sprint
    if (story.sprintId !== currentSprint?.id) return false;
    
    // Only show stories in to do, in progress, or review stages
    const activeStatuses = ['todo', 'progress', 'review'];
    if (!activeStatuses.includes(story.status)) return false;
    
    if (viewMode === 'today') {
      // Today mode: show stories that have been scheduled for today via the roadmap
      const isScheduledToday = story.scheduled === todayDateString || story.scheduledDate === todayDateString;
      return isScheduledToday;
    } else {
      // Week mode: show all active stories in current sprint (already filtered above)
      return true;
    }
  });

  // Calculate progress based on view mode
  const progress = {
    totalWeight: filteredStories.reduce((sum, story) => sum + story.weight, 0),
    completedWeight: filteredStories
      .filter(story => story.status === 'done')
      .reduce((sum, story) => sum + story.weight, 0),
    totalStories: filteredStories.length,
    completedStories: filteredStories.filter(story => story.status === 'done').length,
    inProgressStories: filteredStories.filter(story => story.status === 'progress').length,
    todoStories: filteredStories.filter(story => story.status === 'todo').length,
    reviewStories: filteredStories.filter(story => story.status === 'review').length
  };

  const progressPercentage = progress.totalWeight > 0 
    ? Math.round((progress.completedWeight / progress.totalWeight) * 100)
    : 0;

  // Group goals by type
  const goalsByType = activeGoals.reduce((acc, goal) => {
    if (!acc[goal.goalType]) {
      acc[goal.goalType] = [];
    }
    acc[goal.goalType].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  // Get role name by ID
  const getRoleName = (roleId?: string) => {
    if (!roleId) return 'No Role';
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'Unknown Role';
  };

  // Get class by ID
  const getClass = (classId: string) => {
    return classes.find(c => c.id === classId);
  };

  // Get class type color for FocusView
  const getClassTypeColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'bg-purple-100 text-purple-800 border-purple-300',
      Minor: 'bg-pink-100 text-pink-800 border-pink-300',
      GE: 'bg-orange-100 text-orange-800 border-orange-300',
      Religion: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      Elective: 'bg-green-100 text-green-800 border-green-300'
    };
    return colors[classType] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getClassTypeAccentColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'bg-purple-500',
      Minor: 'bg-pink-500',
      GE: 'bg-orange-500',
      Religion: 'bg-yellow-500',
      Elective: 'bg-green-500'
    };
    return colors[classType] || 'bg-gray-500';
  };

  const getClassTypeBorderColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'border-purple-300',
      Minor: 'border-pink-300',
      GE: 'border-orange-300',
      Religion: 'border-yellow-300',
      Elective: 'border-green-300'
    };
    return colors[classType] || 'border-gray-300';
  };

  // Get assignment type icon
  const getAssignmentTypeIcon = (type: AssignmentType | string) => {
    if (type === 'exam') type = 'test';
    switch (type) {
      case 'homework':
        return <FileText className="h-3.5 w-3.5" />;
      case 'reading':
        return <Book className="h-3.5 w-3.5" />;
      case 'paper':
        return <FileCheck className="h-3.5 w-3.5" />;
      case 'project':
        return <FolderKanban className="h-3.5 w-3.5" />;
      case 'test':
        return <ClipboardList className="h-3.5 w-3.5" />;
      default:
        return <MoreHorizontal className="h-3.5 w-3.5" />;
    }
  };

  // Get assignment type color
  const getAssignmentTypeColor = (type: AssignmentType | string) => {
    if (type === 'exam') type = 'test';
    switch (type) {
      case 'homework':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'reading':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'paper':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'project':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'test':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get status color
  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter assignments based on view mode
  const getFilteredAssignments = () => {
    if (!settings.layout.sections.classes) return [];
    
    return assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      
      if (viewMode === 'today') {
        // Today mode: show only assignments due today
        return assignment.dueDate === todayDateString;
      } else {
        // Week mode: show assignments for current week
        return assignment.dueDate >= startDate && assignment.dueDate <= endDate;
      }
    }).sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      // If same date, sort by time
      const timeA = a.dueTime || '23:59';
      const timeB = b.dueTime || '23:59';
      return timeA.localeCompare(timeB);
    });
  };

  // Group assignments by due date
  const groupAssignmentsByDate = (assignments: Assignment[]) => {
    const grouped: Record<string, Assignment[]> = {};
    assignments.forEach(assignment => {
      if (assignment.dueDate) {
        if (!grouped[assignment.dueDate]) {
          grouped[assignment.dueDate] = [];
        }
        grouped[assignment.dueDate].push(assignment);
      }
    });
    return grouped;
  };

  // Format date for display
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };

  // Format time for display
  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const filteredAssignments = getFilteredAssignments();
  const assignmentsByDate = groupAssignmentsByDate(filteredAssignments);


  // Get goal type info from settings
  const getGoalTypeInfo = (goalType: string) => {
    const type = goalSettings.goalTypes.find(gt => gt.name === goalType);
    return type || { name: goalType, color: '#6B7280', description: '' };
  };

  // Handler for adding a goal to a specific category
  const handleAddGoal = (goalType: string) => {
    setSelectedGoalType(goalType);
    setIsGoalSelectionOpen(true);
  };

  // Handler for creating a new goal with a specific type
  const handleCreateNewGoal = (goalType: string) => {
    setCreatingGoalType(goalType);
    setIsGoalSelectionOpen(false);
    setIsGoalModalOpen(true);
  };

  // Handler for selecting a goal (they're already in-progress, just close the dialog)
  const handleSelectGoal = () => {
    setIsGoalSelectionOpen(false);
    setSelectedGoalType('');
  };

  // Get goals for the selected category that are in progress
  const getAvailableGoals = () => {
    return goals.filter(goal => 
      goal.goalType === selectedGoalType && 
      goal.status === 'in-progress'
    );
  };

  // Handle goal dropdown actions
  const handleToggleComplete = (goal: Goal) => {
    updateGoal(goal.id, { completed: !goal.completed });
    setOpenDropdownId(null);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleRemoveFromProgress = (goal: Goal) => {
    updateGoal(goal.id, { status: 'backlog' });
    setOpenDropdownId(null);
  };

  const handleDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      setIsDeleteModalOpen(false);
      setGoalToDelete(null);
    }
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent | TouchEvent) => {
    const target = e.target as Element;
    if (!target.closest('[data-goal-dropdown]')) {
      setOpenDropdownId(null);
    }
  };

  // Handle section dropdown click outside
  const handleSectionClickOutside = (e: MouseEvent | TouchEvent) => {
    const target = e.target as Element;
    if (!target.closest('[data-section-dropdown]')) {
      setOpenSectionDropdown(null);
    }
  };

  // Add event listeners for closing dropdowns
  useEffect(() => {
    if (openDropdownId) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
      };
    }
  }, [openDropdownId]);

  useEffect(() => {
    if (openSectionDropdown) {
      document.addEventListener('mousedown', handleSectionClickOutside);
      document.addEventListener('touchstart', handleSectionClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleSectionClickOutside);
        document.removeEventListener('touchstart', handleSectionClickOutside);
      };
    }
  }, [openSectionDropdown]);

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:gap-3">
        <div className="flex flex-row items-center justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-xs text-muted-foreground">
              {viewMode === 'today'
                ? new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                  })
                : `Week ${isoWeek}, ${year} • ${new Date(startDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })} – ${new Date(endDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}`}
            </p>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="sm:hidden">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </span>
          </div>
        </div>
        
        {/* View Mode Toggle - Liquid glass with subtle drag interaction (drag Week onto Today) */}
        <Tabs
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'today' | 'week')}
          className="w-full sm:w-auto"
        >
          <TabsList
            className="grid w-full sm:w-auto grid-cols-2 rounded-full bg-white/10 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <TabsTrigger
              value="today"
              className="text-xs sm:text-sm rounded-full cursor-grab active:cursor-grabbing data-[state=active]:bg-white/80 data-[state=active]:text-slate-900 dark:data-[state=active]:bg-white/10 dark:data-[state=active]:text-white transition-colors"
              draggable
              onDragStart={() => setIsDraggingToday(true)}
              onDragEnd={() => setIsDraggingToday(false)}
              onDragOver={(e) => {
                if (isDraggingWeek) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                if (isDraggingWeek) {
                  e.preventDefault();
                  setViewMode('today');
                  setIsDraggingWeek(false);
                }
              }}
            >
              Today
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="text-xs sm:text-sm rounded-full cursor-grab active:cursor-grabbing"
              draggable
              onDragStart={() => setIsDraggingWeek(true)}
              onDragEnd={() => setIsDraggingWeek(false)}
              onDragOver={(e) => {
                if (isDraggingToday) {
                  e.preventDefault();
                }
              }}
              onDrop={(e) => {
                if (isDraggingToday) {
                  e.preventDefault();
                  setViewMode('week');
                  setIsDraggingToday(false);
                }
              }}
            >
              Week
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Weekly Progress */}
      <div className="w-full flex justify-center">
        {/* Combined Stories & Weight Progress */}
        <Card className="border w-full max-w-md">
            <CardContent className="px-2 sm:px-3 py-3 sm:py-4">
              <div className="space-y-3 sm:space-y-4">
                {/* Stories Progress Bar - Color Coded */}
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs">
                    <span>Stories</span>
                    <div className="flex flex-row items-center gap-x-2 flex-wrap justify-end">
                      <span className="text-yellow-600 flex items-center gap-1">
                        <ClipboardList className="h-3 w-3" />
                        To Do: {progress.todoStories}
                      </span>
                      <span className="text-blue-600 flex items-center gap-1">
                        <PlayCircle className="h-3 w-3" />
                        In Progress: {progress.inProgressStories}
                      </span>
                      <span className="text-purple-600 flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Review: {progress.reviewStories}
                      </span>
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Done: {progress.completedStories}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5 overflow-hidden flex">
                    {progress.totalStories > 0 ? (
                      <>
                        {/* To Do - Yellow */}
                        {progress.todoStories > 0 && (
                          <div 
                            className="bg-yellow-600 h-1 sm:h-1.5 transition-all duration-300"
                            style={{ width: `${(progress.todoStories / progress.totalStories) * 100}%` }}
                          />
                        )}
                        {/* In Progress - Blue */}
                        {progress.inProgressStories > 0 && (
                          <div 
                            className="bg-blue-600 h-1 sm:h-1.5 transition-all duration-300"
                            style={{ width: `${(progress.inProgressStories / progress.totalStories) * 100}%` }}
                          />
                        )}
                        {/* Review - Purple */}
                        {progress.reviewStories > 0 && (
                          <div 
                            className="bg-purple-600 h-1 sm:h-1.5 transition-all duration-300"
                            style={{ width: `${(progress.reviewStories / progress.totalStories) * 100}%` }}
                          />
                        )}
                        {/* Done - Green */}
                        {progress.completedStories > 0 && (
                          <div 
                            className="bg-green-600 h-1 sm:h-1.5 transition-all duration-300"
                            style={{ width: `${(progress.completedStories / progress.totalStories) * 100}%` }}
                          />
                        )}
                      </>
                    ) : (
                      <div className="w-full" />
                    )}
                  </div>
                </div>
                
                {/* Weight Progress Bar */}
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between text-[10px] sm:text-xs">
                    <span>Weight</span>
                    <span className="text-muted-foreground">{progress.completedWeight} / {progress.totalWeight}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 sm:h-1.5">
                    <div 
                      className="bg-blue-600 h-1 sm:h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Charts Section - Only show in week view */}
      {viewMode === 'week' && (
        <div className="mb-4 sm:mb-6">
          <ChartsSection />
        </div>
      )}

      {/* Goals Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
            <Target className="h-4 w-4" />
            Goals
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative" data-section-dropdown>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 touch-target"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenSectionDropdown(openSectionDropdown === 'goals' ? null : 'goals');
                }}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
              {openSectionDropdown === 'goals' && (
                <div className="absolute right-0 top-7 z-50 w-40 bg-background border rounded-md shadow-lg py-1">
                  <button
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 touch-target min-h-[44px] sm:min-h-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsGoalsExpanded(!isGoalsExpanded);
                      setOpenSectionDropdown(null);
                    }}
                  >
                    {isGoalsExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Expand
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 touch-target"
              onClick={() => setIsGoalsExpanded(!isGoalsExpanded)}
            >
              {isGoalsExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        {isGoalsExpanded && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-3">
          {['Spiritual', 'Social', 'Intellectual', 'Physical'].map((goalType) => {
            const typeInfo = getGoalTypeInfo(goalType);
            const IconComponent = goalTypeIcons[goalType.toLowerCase() as keyof typeof goalTypeIcons];
            const goalsOfType = goalsByType[goalType] || [];
            const typeColor = goalSettings.getTypeColor(goalType);

            return (
              <Card 
                key={goalType} 
                className="border-2 cursor-pointer hover:shadow-md transition-shadow" 
                style={{ borderColor: typeColor }}
                onClick={() => setCurrentView('goals')}
              >
                <CardHeader className="pb-1 sm:pb-2 pt-2.5 sm:pt-3 px-2 sm:px-3">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-2 sm:gap-1.5">
                    {/* Icon and Title - Centered on mobile */}
                    <div className="flex flex-col items-center sm:flex-row sm:items-center gap-1.5 sm:gap-1.5 flex-1">
                      <IconComponent 
                        className="h-5 w-5 sm:h-3.5 sm:w-3.5" 
                        style={{ color: typeColor }}
                      />
                      <span className="capitalize text-xs sm:text-xs md:text-sm font-medium">{typeInfo.name}</span>
                    </div>
                    {/* Badge and Add Button - Bottom row on mobile, right side on desktop */}
                    <div className="flex items-center gap-1.5 sm:gap-1.5 w-full sm:w-auto justify-center sm:justify-end">
                      <Badge 
                        variant="secondary" 
                        className="text-[10px] sm:text-[10px] px-2 sm:px-1.5 py-0.5 sm:py-0 h-5 sm:h-5"
                        style={{ backgroundColor: typeColor + '20', color: typeColor }}
                      >
                        {goalsOfType.length}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-5 w-5 sm:h-6 sm:w-6 p-0 touch-target"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddGoal(goalType);
                        }}
                        title={`Add ${typeInfo.name} goal`}
                      >
                        <Plus className="h-3 w-3 sm:h-3 sm:w-3" style={{ color: typeColor }} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 px-2 sm:px-3 pb-2 sm:pb-3">
                  {goalsOfType.length === 0 ? (
                    <p className="text-[9px] sm:text-xs text-muted-foreground italic">
                      No {typeInfo.name.toLowerCase()} goals
                    </p>
                  ) : (
                    <div className="space-y-1 sm:space-y-1.5">
                      {goalsOfType.slice(0, 2).map((goal) => {
                        const isDropdownOpen = openDropdownId === goal.id;
                        return (
                          <div key={goal.id} className="flex items-start gap-1 sm:gap-1.5 group relative">
                            <div className="flex-shrink-0 mt-0.5">
                              {goal.completed ? (
                                <CheckCircle2 className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-green-600" />
                              ) : (
                                <Circle className="h-2.5 w-2.5 sm:h-3.5 sm:w-3.5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[9px] sm:text-xs md:text-sm font-medium truncate">{goal.title}</p>
                              {goal.description && (
                                <p className="text-[8px] sm:text-[10px] text-muted-foreground line-clamp-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                            <div className="flex-shrink-0 relative" data-goal-dropdown>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-4 w-4 sm:h-5 sm:w-5 p-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity touch-target"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenDropdownId(isDropdownOpen ? null : goal.id);
                                }}
                              >
                                <MoreVertical className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              </Button>
                              {isDropdownOpen && (
                                <div className="absolute right-0 top-6 z-50 w-40 sm:w-40 bg-background border rounded-md shadow-lg py-1 max-w-[calc(100vw-2rem)] sm:max-w-none">
                                  <button
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 touch-target min-h-[44px] sm:min-h-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleComplete(goal);
                                    }}
                                  >
                                    {goal.completed ? (
                                      <>
                                        <Circle className="h-3.5 w-3.5" />
                                        Mark Incomplete
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Mark Complete
                                      </>
                                    )}
                                  </button>
                                  <button
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 touch-target min-h-[44px] sm:min-h-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditGoal(goal);
                                    }}
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                    Edit
                                  </button>
                                  <button
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 touch-target min-h-[44px] sm:min-h-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveFromProgress(goal);
                                    }}
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Remove from Progress
                                  </button>
                                  <div className="border-t my-1" />
                                  <button
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted text-red-600 hover:text-red-700 flex items-center gap-2 touch-target min-h-[44px] sm:min-h-0"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteGoal(goal);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {goalsOfType.length > 2 && (
                        <p className="text-[8px] sm:text-[10px] text-muted-foreground">
                          +{goalsOfType.length - 2} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
        )}
      </div>

      {/* Weekly Stories */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-0 mb-2">
          <div className="flex items-center gap-2 flex-1">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {viewMode === 'today' ? 'Today\'s Stories' : 'Active Stories'} ({filteredStories.filter(story => story.status !== 'done').length})
            </h2>
            <div className="flex items-center gap-2">
              <div className="relative" data-section-dropdown>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 touch-target"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenSectionDropdown(openSectionDropdown === 'stories' ? null : 'stories');
                  }}
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </Button>
                {openSectionDropdown === 'stories' && (
                  <div className="absolute left-0 top-7 z-50 w-40 bg-background border rounded-md shadow-lg py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 touch-target min-h-[44px] sm:min-h-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsStoriesExpanded(!isStoriesExpanded);
                        setOpenSectionDropdown(null);
                      }}
                    >
                      {isStoriesExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          Expand
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 touch-target"
                onClick={() => setIsStoriesExpanded(!isStoriesExpanded)}
              >
                {isStoriesExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          </div>
          {viewMode === 'today' && filteredStories.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowScheduleStoriesModal(true)}
              className="gap-1.5 w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0 text-xs h-8"
            >
              <Target className="h-3.5 w-3.5" />
              View All Stories
            </Button>
          )}
        </div>
        {isStoriesExpanded && (
          <>
            {filteredStories.length === 0 ? (
              <Card>
                <CardContent className="py-4 sm:py-6 text-center">
                  <Calendar className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                    {viewMode === 'today' ? 'No active stories for today' : 'No active stories for this week'}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button 
                      variant="default" 
                      onClick={() => setShowAddStoryModal(true)}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Story
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setCurrentView('story-boards')}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Target className="h-3.5 w-3.5" />
                      View All Stories
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                  {filteredStories.map((story, index) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      index={index}
                      onEdit={handleEditStory}
                      showActions={true}
                      className="transition-all duration-200 hover:shadow-md"
                    />
                  ))}
                </div>
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddStoryModal(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Story
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* School Section */}
      {isSchoolExpanded && settings?.layout?.sections?.classes && (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
            <GraduationCap className="h-4 w-4" />
            School
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative" data-section-dropdown>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 touch-target"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenSectionDropdown(openSectionDropdown === 'school' ? null : 'school');
                }}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
              {openSectionDropdown === 'school' && (
                <div className="absolute right-0 top-7 z-50 w-40 bg-background border rounded-md shadow-lg py-1">
                  <button
                    className="w-full text-left px-3 py-2 text-xs hover:bg-muted flex items-center gap-2 touch-target min-h-[44px] sm:min-h-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSchoolExpanded(!isSchoolExpanded);
                      setOpenSectionDropdown(null);
                    }}
                  >
                    {isSchoolExpanded ? (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        Collapse
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        Expand
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 touch-target"
              onClick={() => setIsSchoolExpanded(!isSchoolExpanded)}
            >
              {isSchoolExpanded ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
        {isSchoolExpanded && (
          <>
            {filteredAssignments.length === 0 ? (
          <Card>
            <CardContent className="py-4 sm:py-6 text-center">
              <GraduationCap className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                {viewMode === 'today' ? 'No assignments due today' : 'No assignments due this week'}
              </p>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('classes' as ViewType)}
                className="gap-1.5 text-xs h-8"
              >
                <GraduationCap className="h-3.5 w-3.5" />
                View Classes
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {Object.entries(assignmentsByDate).map(([dueDate, dateAssignments]) => (
              <Card key={dueDate} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {formatDueDate(dueDate)}
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                      {dateAssignments.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 pb-3">
                  <div className="space-y-2">
                    {dateAssignments.map((assignment) => {
                      const classItem = getClass(assignment.classId);
                      const className = classItem?.title || 'Unknown Class';
                      const classType = classItem?.classType || 'Major';
                      const accentColor = getClassTypeAccentColor(classType);
                      const borderColor = getClassTypeBorderColor(classType);
                      
                      return (
                        <div 
                          key={assignment.id} 
                          className={`flex items-start gap-2 p-2 rounded-md border-2 ${borderColor} hover:shadow-sm transition-all relative overflow-hidden`}
                        >
                          {/* Class type accent bar */}
                          <div 
                            className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}
                          />
                          <div className="flex-shrink-0 mt-0.5 ml-2">
                            {getAssignmentTypeIcon(assignment.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium line-clamp-2">
                                  {assignment.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  <p className="text-[10px] text-muted-foreground">
                                    {className}
                                  </p>
                                  <Badge 
                                    variant="outline" 
                                    className={`text-[10px] px-1.5 py-0 h-4 ${getClassTypeColor(classType)}`}
                                  >
                                    {classType}
                                  </Badge>
                                </div>
                                {assignment.description && (
                                  <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                                    {assignment.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] px-1.5 py-0 h-5 ${getAssignmentTypeColor(assignment.type)}`}
                                >
                                  {((assignment.type as string) === 'exam' || assignment.type === 'test') ? 'test' : assignment.type}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={`text-[10px] px-1.5 py-0 h-5 ${getStatusColor(assignment.status)}`}
                                >
                                  {assignment.status}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className="text-[10px] px-1.5 py-0 h-5"
                                  style={{
                                    backgroundColor: `${getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21)}20`,
                                    color: getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21),
                                    borderColor: getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21)
                                  }}
                                >
                                  W:{assignment.weight || 3}
                                </Badge>
                              </div>
                            </div>
                            {assignment.dueTime && (
                              <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                                <Clock className="h-2.5 w-2.5" />
                                {formatTime(assignment.dueTime)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
            )}
          </>
        )}
      </div>
      )}

      {/* Goal Edit/Create Modal */}
      {editingGoal ? (
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => {
            setIsGoalModalOpen(false);
            setEditingGoal(null);
          }}
          mode="edit"
          goal={editingGoal}
        />
      ) : creatingGoalType ? (
        <GoalModal
          isOpen={isGoalModalOpen}
          onClose={() => {
            setIsGoalModalOpen(false);
            setCreatingGoalType(null);
          }}
          mode="add"
          initialGoalType={creatingGoalType}
          initialStatus="in-progress"
        />
      ) : null}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setGoalToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        itemName={goalToDelete?.title}
        description="This will permanently delete the goal and cannot be undone."
      />

      {/* Goal Selection Modal */}
      <Dialog open={isGoalSelectionOpen} onOpenChange={setIsGoalSelectionOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Select {selectedGoalType} Goal
            </DialogTitle>
            <DialogDescription>
              View all {selectedGoalType.toLowerCase()} goals that are currently in progress.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {getAvailableGoals().length === 0 ? (
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  No available {selectedGoalType.toLowerCase()} goals to add.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => handleCreateNewGoal(selectedGoalType)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New {selectedGoalType} Goal
                </Button>
              </div>
            ) : (
              <>
                <div className="grid gap-3">
                  {getAvailableGoals().map((goal) => (
                    <Card 
                      key={goal.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectGoal()}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm line-clamp-2">
                              {goal.title}
                            </h3>
                            {goal.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {goal.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span className="capitalize">{goal.status}</span>
                              <span>•</span>
                              <span className="capitalize">{goal.priority} priority</span>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            In Progress
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleCreateNewGoal(selectedGoalType)}
                    className="w-full gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Create New {selectedGoalType} Goal
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Story Modal */}
      {showEditStoryModal && editingStory && (
        <EditStoryModal
          story={editingStory}
          open={showEditStoryModal}
          onOpenChange={handleCloseEditStoryModal}
        />
      )}

      {/* Add Story Modal */}
      <AddStoryModal
        key={`add-story-${currentSprint?.id || 'no-sprint'}`}
        open={showAddStoryModal}
        onOpenChange={setShowAddStoryModal}
        initialData={useMemo(() => ({
          sprintId: currentSprint?.id,
          status: 'todo' as const
        }), [currentSprint?.id])}
      />

      {/* Schedule Stories Modal */}
      <Dialog open={showScheduleStoriesModal} onOpenChange={setShowScheduleStoriesModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule Stories for Today</DialogTitle>
            <DialogDescription>
              Click on stories to schedule them for today. Stories already scheduled for today will be unscheduled when clicked.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {sprintStories.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-sm text-muted-foreground">No stories available to schedule</p>
                </CardContent>
              </Card>
            ) : (
              sprintStories.map((story) => {
                const isScheduledToday = story.scheduledDate === todayDateString || story.scheduled === todayDateString;
                return (
                  <Card 
                    key={story.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isScheduledToday ? 'ring-2 ring-primary bg-primary/5' : ''
                    }`}
                    onClick={() => handleScheduleStory(story.id)}
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`mt-1 ${isScheduledToday ? 'text-primary' : 'text-muted-foreground'}`}>
                              {isScheduledToday ? (
                                <CheckCircle2 className="h-5 w-5" />
                              ) : (
                                <Circle className="h-5 w-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm sm:text-base mb-1">{story.title}</h3>
                              {story.description && (
                                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-2">
                                  {story.description}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5">
                                  {story.status}
                                </Badge>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  {getRoleName(story.roleId)}
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">
                                  • W:{story.weight}
                                </span>
                                {isScheduledToday && (
                                  <Badge variant="default" className="text-[10px] px-1.5 py-0 h-5">
                                    Scheduled
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export alias for backward compatibility
export { FocusView as TodayView };