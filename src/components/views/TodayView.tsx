import { useAtom } from 'jotai';
import { 
  goalsAtom, 
  storiesAtom, 
  currentSprintAtom,
  rolesAtom,
  currentViewAtom
} from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Calendar, 
  CheckCircle2, 
  Circle,
  Clock,
  Users,
  BookOpen,
  Heart,
  Dumbbell,
  Brain,
  TrendingUp
} from 'lucide-react';
import { getCurrentWeek } from '@/utils/date';
import { useGoalSettings } from '@/utils/settingsMirror';
import type { Goal, Story } from '@/types';

const goalTypeIcons = {
  spiritual: Heart,
  social: Users,
  intellectual: Brain,
  physical: Dumbbell,
  financial: TrendingUp,
  protector: Target
};

// Remove hardcoded colors - we'll use settings mirror instead

export function TodayView() {
  const [goals] = useAtom(goalsAtom);
  const [stories] = useAtom(storiesAtom);
  const [currentSprint] = useAtom(currentSprintAtom);
  const [roles] = useAtom(rolesAtom);
  const [, setCurrentView] = useAtom(currentViewAtom);
  
  // Use goal settings mirror for proper colors and types
  const goalSettings = useGoalSettings();

  // Get current week info
  const { isoWeek, year } = getCurrentWeek();

  // Filter goals that are in progress for the four main categories
  const inProgressGoals = goals.filter(goal => 
    goal.status === 'in-progress' && 
    ['Spiritual', 'Social', 'Intellectual', 'Physical'].includes(goal.goalType)
  );

  // Filter stories for current week
  const weeklyStories = stories.filter(story => 
    story.sprintId === currentSprint?.id && 
    !story.deleted
  );

  // Calculate weekly progress
  const weeklyProgress = {
    totalWeight: weeklyStories.reduce((sum, story) => sum + story.weight, 0),
    completedWeight: weeklyStories
      .filter(story => story.status === 'done')
      .reduce((sum, story) => sum + story.weight, 0),
    totalStories: weeklyStories.length,
    completedStories: weeklyStories.filter(story => story.status === 'done').length,
    inProgressStories: weeklyStories.filter(story => story.status === 'progress').length,
    todoStories: weeklyStories.filter(story => story.status === 'todo').length,
    reviewStories: weeklyStories.filter(story => story.status === 'review').length
  };

  const progressPercentage = weeklyProgress.totalWeight > 0 
    ? Math.round((weeklyProgress.completedWeight / weeklyProgress.totalWeight) * 100)
    : 0;

  // Group goals by type
  const goalsByType = inProgressGoals.reduce((acc, goal) => {
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


  // Get goal type info from settings
  const getGoalTypeInfo = (goalType: string) => {
    const type = goalSettings.goalTypes.find(gt => gt.name === goalType);
    return type || { name: goalType, color: '#6B7280', description: '' };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Today's Focus</h1>
          <p className="text-muted-foreground">
            Week {isoWeek}, {year} • {currentSprint?.startDate ? new Date(currentSprint.startDate).toLocaleDateString() : ''}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </span>
        </div>
      </div>

      {/* Goals Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="h-5 w-5" />
          Goals in Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <IconComponent 
                      className="h-4 w-4" 
                      style={{ color: typeColor }}
                    />
                    <span className="capitalize">{typeInfo.name}</span>
                    <Badge 
                      variant="secondary" 
                      className="ml-auto"
                      style={{ backgroundColor: typeColor + '20', color: typeColor }}
                    >
                      {goalsOfType.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {goalsOfType.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">
                      No {typeInfo.name.toLowerCase()} goals in progress
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {goalsOfType.slice(0, 3).map((goal) => (
                        <div key={goal.id} className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {goal.completed ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Circle className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{goal.title}</p>
                            {goal.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {goal.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {goalsOfType.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{goalsOfType.length - 3} more
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Weekly Stories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Active Stories ({weeklyStories.filter(story => story.status !== 'done').length})
          </h2>
          {weeklyStories.length > 0 && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setCurrentView('story-boards')}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              View All
            </Button>
          )}
        </div>
        {weeklyStories.filter(story => story.status !== 'done').length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                No active stories for this week
              </p>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('story-boards')}
                className="gap-2"
              >
                <Target className="h-4 w-4" />
                View All Stories
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {weeklyStories.filter(story => story.status !== 'done').map((story) => (
              <Card key={story.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium line-clamp-2">
                      {story.title}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        story.status === 'progress' ? 'border-blue-200 text-blue-800 bg-blue-50' :
                        story.status === 'todo' ? 'border-gray-200 text-gray-800 bg-gray-50' :
                        story.status === 'review' ? 'border-yellow-200 text-yellow-800 bg-yellow-50' :
                        'border-gray-200 text-gray-800 bg-gray-50'
                      }`}
                    >
                      {story.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {story.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {story.description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Role: {getRoleName(story.roleId)}</span>
                      <span>•</span>
                      <span>Size: {story.size}</span>
                      <span>•</span>
                      <span>Weight: {story.weight}</span>
                    </div>


                    {story.checklist.length > 0 && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>
                            {story.checklist.filter(item => item.done).length} / {story.checklist.length} tasks
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Weekly Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Weight Progress */}
          <Card className="border-2 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Dumbbell className="h-4 w-4 text-blue-600" />
                Weight Progress
                <Badge variant="secondary" className="ml-auto bg-blue-100 text-blue-800">
                  {progressPercentage}%
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Completed: {weeklyProgress.completedWeight}</span>
                  <span className="text-muted-foreground">/ {weeklyProgress.totalWeight}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {weeklyProgress.totalWeight - weeklyProgress.completedWeight} weight remaining
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Story Status Breakdown */}
          <Card className="border-2 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Stories Status
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                  {weeklyProgress.completedStories}/{weeklyProgress.totalStories}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-600">✓ Done:</span>
                  <span>{weeklyProgress.completedStories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600">🔄 In Progress:</span>
                  <span>{weeklyProgress.inProgressStories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-600">📝 To Do:</span>
                  <span>{weeklyProgress.todoStories}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-600">👀 Review:</span>
                  <span>{weeklyProgress.reviewStories}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-2 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-purple-600" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Avg Weight:</span>
                  <span>{weeklyProgress.totalStories > 0 ? Math.round(weeklyProgress.totalWeight / weeklyProgress.totalStories) : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Completion Rate:</span>
                  <span>{weeklyProgress.totalStories > 0 ? Math.round((weeklyProgress.completedStories / weeklyProgress.totalStories) * 100) : 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Stories:</span>
                  <span>{weeklyProgress.inProgressStories + weeklyProgress.todoStories}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals Progress */}
          <Card className="border-2 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Target className="h-4 w-4 text-orange-600" />
                Goals Progress
                <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
                  {inProgressGoals.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1 text-sm">
                {['Spiritual', 'Social', 'Intellectual', 'Physical'].map((goalType) => {
                  const goalsOfType = goalsByType[goalType] || [];
                  const completedGoals = goalsOfType.filter(goal => goal.completed).length;
                  return (
                    <div key={goalType} className="flex justify-between">
                      <span className="capitalize">{goalType}:</span>
                      <span>{completedGoals}/{goalsOfType.length}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
