import { useState, useMemo } from 'react';
import { useAtom } from 'jotai';
import {
  goalsAtom,
  storiesAtom,
  currentSprintAtom,
  currentViewAtom,
  updateGoalAtom,
  deleteGoalAtom,
} from '@/stores/appStore';
import { todayViewModeAtom } from '@/stores/uiStore';
import { assignmentsAtom } from '@/stores/assignmentStore';
import { classesAtom } from '@/stores/classStore';
import { settingsAtom } from '@/stores/settingsStore';
import { getWeightGradientColor } from '@/utils/color';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GoalModal } from '@/components/modals/GoalModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import {
  Calendar,
  Clock,
  Plus,
  GraduationCap,
  FileText,
  Book,
  FileCheck,
  FolderKanban,
  ClipboardList,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { getCurrentWeek, getWeekDates } from '@/utils/date';
import { useGoalSettings } from '@/utils/settingsMirror';
import { ChartsSection } from '@/components/charts/ChartsSection';
import { StoryCard } from '@/components/shared/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import type { Goal, Story, Assignment, AssignmentType, Class } from '@/types';
import { FocusHeader } from './focus/FocusHeader';
import { FocusProgress } from './focus/FocusProgress';
import { FocusGoalsGrid } from './focus/FocusGoalsGrid';

export function FocusView() {
  const [goals] = useAtom(goalsAtom);
  const [stories] = useAtom(storiesAtom);
  const [currentSprint] = useAtom(currentSprintAtom);
  const [, setCurrentView] = useAtom(currentViewAtom);
  const [, updateGoal] = useAtom(updateGoalAtom);
  const [, deleteGoal] = useAtom(deleteGoalAtom);

  // State for goal dropdown menus
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [creatingGoalType, setCreatingGoalType] = useState<string | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // State for section expand/collapse
  const [isStoriesExpanded, setIsStoriesExpanded] = useState(true);
  const [isSchoolExpanded, setIsSchoolExpanded] = useState(true);

  // State for story editing
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [showEditStoryModal, setShowEditStoryModal] = useState(false);
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setShowEditStoryModal(true);
  };

  // Get today's date string (ISO format)
  const todayDateString = new Date().toISOString().split('T')[0];

  // State for view mode toggle (today vs week) - using shared atom
  const [viewMode, setViewMode] = useAtom(todayViewModeAtom);

  // Use goal settings mirror for proper colors and types
  const goalSettings = useGoalSettings();

  // Get assignments and classes
  const [assignments] = useAtom(assignmentsAtom);
  const [classes] = useAtom(classesAtom);
  const [settings] = useAtom(settingsAtom);

  // Get current week info
  const { isoWeek, year } = getCurrentWeek();
  const { startDate, endDate } = getWeekDates(isoWeek, year);

  // Filter goals for the four main categories (show only in-progress)
  const activeGoals = useMemo(() => goals.filter(goal =>
    goal.status === 'in-progress' &&
    ['Spiritual', 'Social', 'Intellectual', 'Physical'].includes(goal.goalType)
  ), [goals]);

  // Filter stories based on view mode
  const filteredStories = useMemo(() => stories.filter(story => {
    if (story.deleted) return false;
    if (story.sprintId !== currentSprint?.id) return false;
    const activeStatuses = ['todo', 'progress', 'review'];
    if (!activeStatuses.includes(story.status)) return false;

    if (viewMode === 'today') {
      return story.scheduled === todayDateString || story.scheduledDate === todayDateString;
    }
    return true;
  }), [stories, currentSprint, viewMode, todayDateString]);

  // Calculate progress based on view mode
  const progress = useMemo(() => ({
    totalWeight: filteredStories.reduce((sum, story) => sum + (story.weight || 0), 0),
    completedWeight: filteredStories
      .filter(story => story.status === 'done')
      .reduce((sum, story) => sum + (story.weight || 0), 0),
    totalStories: filteredStories.length,
    completedStories: filteredStories.filter(story => story.status === 'done').length,
    inProgressStories: filteredStories.filter(story => story.status === 'progress').length,
    todoStories: filteredStories.filter(story => story.status === 'todo').length,
    reviewStories: filteredStories.filter(story => story.status === 'review').length
  }), [filteredStories]);

  const progressPercentage = progress.totalWeight > 0
    ? Math.round((progress.completedWeight / progress.totalWeight) * 100)
    : 0;

  // Group goals by type
  const goalsByType = useMemo(() => activeGoals.reduce((acc, goal) => {
    const type = goal.goalType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>), [activeGoals]);

  // Get class by ID
  const getClass = (classId: string) => {
    return classes.find(c => c.id === classId);
  };

  // UI Utilities
  const getClassTypeAccentColor = (classType: Class['classType']) => {
    const colors = { Major: 'bg-purple-500', Minor: 'bg-pink-500', GE: 'bg-orange-500', Religion: 'bg-yellow-500', Elective: 'bg-green-500' };
    return colors[classType] || 'bg-gray-500';
  };

  const getClassTypeBorderColor = (classType: Class['classType']) => {
    const colors = { Major: 'border-purple-300', Minor: 'border-pink-300', GE: 'border-orange-300', Religion: 'border-yellow-300', Elective: 'border-green-300' };
    return colors[classType] || 'border-gray-300';
  };

  const getAssignmentTypeIcon = (type: AssignmentType | string) => {
    const t = type === 'exam' ? 'test' : type;
    switch (t) {
      case 'homework': return <FileText className="h-3.5 w-3.5" />;
      case 'reading': return <Book className="h-3.5 w-3.5" />;
      case 'paper': return <FileCheck className="h-3.5 w-3.5" />;
      case 'project': return <FolderKanban className="h-3.5 w-3.5" />;
      case 'test': return <ClipboardList className="h-3.5 w-3.5" />;
      default: return <MoreHorizontal className="h-3.5 w-3.5" />;
    }
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'not-started': return 'bg-gray-100 text-gray-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredAssignments = () => {
    if (!settings?.layout?.sections?.classes) return [];

    return assignments.filter(assignment => {
      if (!assignment.dueDate) return false;
      if (viewMode === 'today') return assignment.dueDate === todayDateString;
      return assignment.dueDate >= startDate && assignment.dueDate <= endDate;
    }).sort((a, b) => {
      if (!a.dueDate || !b.dueDate) return 0;
      if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
      return (a.dueTime || '23:59').localeCompare(b.dueTime || '23:59');
    });
  };

  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const filteredAssignments = getFilteredAssignments();

  const assignmentsByDate = useMemo(() => {
    const grouped: Record<string, Assignment[]> = {};
    filteredAssignments.forEach(assignment => {
      if (assignment.dueDate) {
        if (!grouped[assignment.dueDate]) grouped[assignment.dueDate] = [];
        grouped[assignment.dueDate].push(assignment);
      }
    });
    return grouped;
  }, [filteredAssignments]);


  // Handlers
  const handleAddGoal = (goalType: string) => {
    setCreatingGoalType(goalType[0].toUpperCase() + goalType.slice(1));
    setIsGoalModalOpen(true);
  };

  const handleToggleComplete = (goal: Goal) => {
    updateGoal(goal.id, { completed: !goal.completed });
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (goalToDelete) {
      deleteGoal(goalToDelete.id);
      setIsDeleteModalOpen(false);
      setGoalToDelete(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <FocusHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        isoWeek={isoWeek}
        year={year}
        startDate={startDate as any}
        endDate={endDate as any}
      />

      <FocusProgress
        progress={progress}
        progressPercentage={progressPercentage}
      />

      {viewMode === 'week' && (
        <div className="mb-4 sm:mb-6">
          <ChartsSection />
        </div>
      )}

      <FocusGoalsGrid
        goalsByType={goalsByType}
        goalSettings={goalSettings}
        onAddGoal={handleAddGoal}
        onToggleComplete={handleToggleComplete}
        onEditGoal={handleEditGoal}
        onDeleteGoal={handleDeleteGoal}
        onViewAllGoals={() => setCurrentView('goals')}
      />

      {/* Stories Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {viewMode === 'today' ? "Today's Stories" : 'Active Stories'} ({filteredStories.length})
          </h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
            onClick={() => setIsStoriesExpanded(!isStoriesExpanded)}
          >
            {isStoriesExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {isStoriesExpanded && (
          <>
            {filteredStories.length === 0 ? (
              <Card>
                <CardContent className="py-6 text-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No active stories for {viewMode}</p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddStoryModal(true)} className="mt-4 gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add Story
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStories.map((story, index) => (
                  <StoryCard key={story.id} story={story} index={index} onEdit={handleEditStory} showActions={true} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* School Section */}
      {settings?.layout?.sections?.classes && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
              <GraduationCap className="h-4 w-4" /> School
            </h2>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setIsSchoolExpanded(!isSchoolExpanded)}>
              {isSchoolExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>

          {isSchoolExpanded && filteredAssignments.length > 0 && (
            <div className="space-y-3">
              {Object.entries(assignmentsByDate).map(([dueDate, dateAssignments]) => (
                <Card key={dueDate}>
                  <CardHeader className="pb-2 pt-3 px-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" /> {formatDueDate(dueDate)}
                      <Badge variant="secondary" className="px-1.5 h-5">{dateAssignments.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 px-3 pb-3 space-y-2">
                    {dateAssignments.map(assignment => {
                      const classItem = getClass(assignment.classId);
                      return (
                        <div key={assignment.id} className={`flex items-start gap-2 p-2 rounded-md border-2 ${getClassTypeBorderColor(classItem?.classType || 'Major')} relative overflow-hidden`}>
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getClassTypeAccentColor(classItem?.classType || 'Major')}`} />
                          <div className="flex-shrink-0 mt-0.5 ml-2">{getAssignmentTypeIcon(assignment.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div className="truncate">
                                <p className="text-sm font-medium truncate">{assignment.title}</p>
                                <p className="text-[10px] text-muted-foreground">{classItem?.title || 'Unknown'}</p>
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <Badge variant="outline" className={`text-[10px] h-5 ${getStatusColor(assignment.status)}`}>{assignment.status}</Badge>
                                <Badge variant="outline" className="text-[10px] h-5" style={{ color: getWeightGradientColor(assignment.weight || 3, settings?.weightBaseColor || '#3B82F6', 21) }}>W:{assignment.weight || 3}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
          setCreatingGoalType(null);
        }}
        goal={editingGoal}
        initialGoalType={creatingGoalType || undefined}
        mode={editingGoal ? 'edit' : 'add'}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        itemName={goalToDelete?.title}
        description="Are you sure you want to delete this goal? This action cannot be undone."
      />

      {showEditStoryModal && editingStory && (
        <EditStoryModal
          open={showEditStoryModal}
          onOpenChange={setShowEditStoryModal}
          story={editingStory}
        />
      )}

      {showAddStoryModal && (
        <AddStoryModal open={showAddStoryModal} onOpenChange={setShowAddStoryModal} />
      )}
    </div>
  );
}