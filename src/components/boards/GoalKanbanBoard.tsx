import { useAtom } from 'jotai';
import { goalsAtom, storiesAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Goal } from '@/types';

interface GoalKanbanBoardProps {
  goal: Goal;
  onBack: () => void;
}

export function GoalKanbanBoard({ goal, onBack }: GoalKanbanBoardProps) {
  const [stories] = useAtom(storiesAtom);

  // Get stories assigned to this goal
  const goalStories = stories.filter(story => 
    !story.deleted && goal.storyIds?.includes(story.id)
  );

  // Group stories by status
  const storiesByStatus = {
    'not-started': goalStories.filter(story => story.status === 'icebox' || story.status === 'backlog'),
    'in-progress': goalStories.filter(story => story.status === 'todo' || story.status === 'progress'),
    'review': goalStories.filter(story => story.status === 'review'),
    'done': goalStories.filter(story => story.status === 'done')
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'text-gray-600';
      case 'in-progress':
        return 'text-blue-600';
      case 'review':
        return 'text-yellow-600';
      case 'done':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'Not Started';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Goals
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{goal.title}</h2>
          {goal.description && (
            <p className="text-muted-foreground">{goal.description}</p>
          )}
        </div>
      </div>

      {/* Goal Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="font-medium">Goal Status:</span>
              <Badge variant="outline" className="capitalize">
                {goal.status.replace('-', ' ')}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <Badge variant="outline">{goal.goalType}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Stories:</span>
              <span>{goalStories.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(storiesByStatus).map(([status, stories]) => (
          <Card key={status}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${getStatusColor(status)}`}>
                {getStatusText(status)} ({stories.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stories.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">No stories</p>
                </div>
              ) : (
                stories.map((story) => (
                  <Card key={story.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">{story.title}</h4>
                      {story.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {story.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 flex-wrap">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getPriorityColor(story.priority)}`}
                        >
                          {story.priority}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {story.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {story.size}
                        </Badge>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {goalStories.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <Target className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Stories Assigned</h3>
              <p>This goal doesn't have any stories assigned to it yet.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
