import { useAtom } from 'jotai';
import { goalsAtom, deleteGoalAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Edit, Trash2, Calendar } from 'lucide-react';
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
  const [, deleteGoal] = useAtom(deleteGoalAtom);
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
    const color = goalSettings.getCategoryColor(goalType);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Goals</h2>
          <p className="text-muted-foreground">
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
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Target className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
              <p>Start by adding your first goal to get organized</p>
            </div>
            <Button onClick={onAddGoal}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 px-3 pt-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm sm:text-lg line-clamp-2">{goal.title}</CardTitle>
                    {goal.description && (
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this goal?')) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 sm:h-8 sm:w-8"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getGoalTypeColor(goal.goalType)}>
                    {getGoalTypeText(goal.goalType)}
                  </Badge>
                  {goal.priority && (
                    <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getPriorityColor(goal.priority)}>
                      {getPriorityText(goal.priority)}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-[10px] sm:text-xs px-1.5 py-0.5" style={getStatusColor(goal.status)}>
                    {getStatusText(goal.status)}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
