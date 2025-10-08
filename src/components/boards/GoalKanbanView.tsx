import { useAtom } from 'jotai';
import { goalsAtom, deleteGoalAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Target, Edit, Trash2, Calendar, Users } from 'lucide-react';
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
  onDeleteGoal, 
  onOpenKanban 
}: GoalKanbanViewProps) {
  const [goals] = useAtom(goalsAtom);
  const [, deleteGoal] = useAtom(deleteGoalAtom);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Q1':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Q2':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Q3':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Q4':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not-started':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Spiritual':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Physical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Intellectual':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Social':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Financial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Protector':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGoalTypeColor = (goalType: string) => {
    switch (goalType) {
      case 'target':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lifestyle-value':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'Q1':
        return 'Q1 - Urgent & Important';
      case 'Q2':
        return 'Q2 - Important, Not Urgent';
      case 'Q3':
        return 'Q3 - Urgent, Not Important';
      case 'Q4':
        return 'Q4 - Not Urgent, Not Important';
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
      case 'not-started':
        return 'Not Started';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'on-hold':
        return 'On Hold';
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2">{goal.title}</CardTitle>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {goal.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditGoal(goal)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this goal?')) {
                          deleteGoal(goal.id);
                        }
                      }}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={`text-xs ${getCategoryColor(goal.category)}`}>
                    {goal.category}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getGoalTypeColor(goal.goalType)}`}>
                    {getGoalTypeText(goal.goalType)}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(goal.priority)}`}>
                    {getPriorityText(goal.priority)}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(goal.status)}`}>
                    {getStatusText(goal.status)}
                  </Badge>
                </div>

                {/* Story Count */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  <span>{goal.storyIds?.length || 0} stories assigned</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenKanban(goal)}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    View Kanban
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
