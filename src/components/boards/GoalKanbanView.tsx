import { useAtom } from 'jotai';
import { goalsAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Edit, Calendar, Snowflake, Layers, Circle, PlayCircle, Eye, CheckCircle2, Heart, Users, Brain, Dumbbell, DollarSign, Shield, Trophy } from 'lucide-react';
import { useGoalSettings } from '@/utils/settingsMirror';
import type { Goal } from '@/types';

interface GoalKanbanViewProps {
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  onOpenKanban: (goal: Goal) => void;
}

export function GoalKanbanView({ 
  onAddGoal, 
  onEditGoal, 
  onDeleteGoal: _onDeleteGoal, 
  onOpenKanban 
}: GoalKanbanViewProps) {
  const [goals] = useAtom(goalsAtom);
  const goalSettings = useGoalSettings();

  const getPriorityColor = (priority: string) => {
    const color = goalSettings.getPriorityColor(priority);
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`
    };
  };

  const getStatusColor = (status: string) => {
    const color = goalSettings.getStatusColor(status);
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`
    };
  };

  const getCategoryColor = (category: string) => {
    const color = goalSettings.getTypeColor(category);
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`
    };
  };

  const getGoalTypeColor = (goalType: string) => {
    const color = goalSettings.getTypeColor(goalType);
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`
    };
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium Priority';
      case 'low':
        return 'Low Priority';
      default:
        return priority;
    }
  };

  // Helper function to get priority letter
  const getPriorityLetter = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'H';
      case 'medium':
        return 'M';
      case 'low':
        return 'L';
      default:
        return priority.charAt(0).toUpperCase();
    }
  };

  const getGoalTypeText = (goalType: string) => {
    switch (goalType) {
      case 'target':
        return 'Target';
      case 'lifestyle-value':
        return 'Lifestyle/Value';
      default:
        return goalType;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'icebox':
        return 'Icebox';
      case 'backlog':
        return 'Backlog';
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'review':
        return 'Review';
      case 'done':
        return 'Done';
      default:
        return status;
    }
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'icebox':
        return <Snowflake className="h-3 w-3" />;
      case 'backlog':
        return <Layers className="h-3 w-3" />;
      case 'todo':
        return <Circle className="h-3 w-3" />;
      case 'in-progress':
        return <PlayCircle className="h-3 w-3" />;
      case 'review':
        return <Eye className="h-3 w-3" />;
      case 'done':
        return <CheckCircle2 className="h-3 w-3" />;
      default:
        return null;
    }
  };

  // Helper function to get goal type icon
  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'Spiritual':
        return <Heart className="h-3 w-3" />;
      case 'Social':
        return <Users className="h-3 w-3" />;
      case 'Intellectual':
        return <Brain className="h-3 w-3" />;
      case 'Physical':
        return <Dumbbell className="h-3 w-3" />;
      case 'Financial':
        return <DollarSign className="h-3 w-3" />;
      case 'Protector':
        return <Shield className="h-3 w-3" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage your life goals and track progress
          </p>
        </div>
        <Button onClick={onAddGoal} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Goal
        </Button>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-muted-foreground mb-3">
              <Target className="h-8 w-8 mx-auto mb-3" />
              <h3 className="text-base font-semibold mb-1">No Goals Yet</h3>
              <p className="text-sm">Start by adding your first goal to get organized</p>
            </div>
            <Button onClick={onAddGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              {/* Mobile: Single row layout */}
              <div className="sm:hidden p-1.5 flex items-center gap-1.5 min-h-[44px]">
                <Target className="h-3 w-3 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-medium truncate flex-1 min-w-0">
                  {goal.title}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap flex items-center gap-0.5" style={getGoalTypeColor(goal.goalType)}>
                    {getGoalTypeIcon(goal.goalType)}
                  </Badge>
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap flex items-center gap-0.5" style={getStatusColor(goal.status)}>
                    {getStatusIcon(goal.status) || getStatusText(goal.status).substring(0, 4)}
                  </Badge>
                  {goal.priority && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 whitespace-nowrap flex items-center gap-0.5" style={getPriorityColor(goal.priority)}>
                      <Trophy className="h-3 w-3" />
                      {getPriorityLetter(goal.priority)}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditGoal(goal)}
                    className="h-11 w-11 sm:h-7 sm:w-7 p-0 flex-shrink-0"
                  >
                    <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Desktop: Compact card layout */}
              <div className="hidden sm:block">
                <CardHeader className="pb-0.5 px-2 pt-1.5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-xs sm:text-sm line-clamp-1">{goal.title}</CardTitle>
                      {goal.description && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1">
                          {goal.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditGoal(goal)}
                        className="h-6 w-6 p-0 sm:h-8 sm:w-8"
                      >
                        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 px-3 pb-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getCategoryColor(goal.category)}>
                    {goal.category}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5 flex items-center gap-0.5" style={getGoalTypeColor(goal.goalType)}>
                    {getGoalTypeIcon(goal.goalType) || getGoalTypeText(goal.goalType)}
                  </Badge>
                  {goal.priority && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5 flex items-center gap-0.5" style={getPriorityColor(goal.priority)}>
                      <Trophy className="h-3 w-3" />
                      {getPriorityLetter(goal.priority)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5 flex items-center gap-0.5" style={getStatusColor(goal.status)}>
                    {getStatusIcon(goal.status) || getStatusText(goal.status)}
                  </Badge>
                </div>

                {/* Story Count */}
                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{goal.storyIds?.length || 0} stories assigned</span>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenKanban(goal)}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">View Kanban</span>
                    <span className="sm:hidden">Kanban</span>
                  </Button>
                </div>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
