import { useState } from 'react';
import { useAtom } from 'jotai';
import { storiesAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGoalSettings } from '@/utils/settingsMirror';
import type { Goal, Story } from '@/types';

interface GoalKanbanBoardProps {
  goal: Goal;
  onBack: () => void;
}

export function GoalKanbanBoard({ goal, onBack }: GoalKanbanBoardProps) {
  const [stories] = useAtom(storiesAtom);
  const goalSettings = useGoalSettings();

  // Get stories assigned to this goal
  const goalStories = stories.filter(story => 
    !story.deleted && goal.storyIds?.includes(story.id)
  );

  // Group stories by status using goal statuses from settings
  const goalStatuses = goalSettings.goalStatuses;
  
  // Initialize to "In Progress" column if it exists, otherwise default to first column
  const inProgressIndex = goalStatuses.findIndex(status => 
    status.name.toLowerCase() === 'in progress'
  );
  const [currentMobileColumnIndex, setCurrentMobileColumnIndex] = useState(
    inProgressIndex >= 0 ? inProgressIndex : 0
  );
  const storiesByStatus = goalStatuses.reduce((acc, status) => {
    const statusId = status.name.toLowerCase().replace(' ', '-');
    acc[statusId] = goalStories.filter(story => story.status === statusId);
    return acc;
  }, {} as Record<string, Story[]>);

  const getStatusColor = (status: string) => {
    const color = goalSettings.getStatusColor(status);
    return `text-[${color}]`;
  };

  const getStatusText = (status: string) => {
    const goalStatus = goalStatuses.find(s => s.name.toLowerCase().replace(' ', '-') === status);
    return goalStatus?.name || status;
  };

  const getPriorityColor = (priority: string) => {
    const color = goalSettings.getPriorityColor(priority);
    return `bg-[${color}20] text-[${color}] border-[${color}40]`;
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

      {/* Column Header Row - Desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-2">
        {Object.entries(storiesByStatus).map(([status, statusStories]) => {
          const statusColor = goalSettings.getStatusColor(status);
          return (
            <div
              key={status}
              onClick={() => {
                const columnElement = document.querySelector(`[data-column-id="${status}"]`);
                if (columnElement) {
                  columnElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
              }}
              className="flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: statusColor }}
              />
              <span className="text-sm font-medium" style={{ color: statusColor }}>
                {getStatusText(status)} {statusStories.length}
              </span>
            </div>
          );
        })}
      </div>

      {/* Column Header Row with Navigation Arrows - Mobile */}
      <div className="sm:hidden mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMobileColumnIndex(prev => Math.max(0, prev - 1))}
            disabled={currentMobileColumnIndex === 0}
            className="flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1 grid grid-cols-3 gap-1.5">
            {Object.entries(storiesByStatus).map(([status, statusStories], index) => {
              const statusColor = goalSettings.getStatusColor(status);
              const isActive = index === currentMobileColumnIndex;
              return (
                <div
                  key={status}
                  onClick={() => setCurrentMobileColumnIndex(index)}
                  className={`flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${
                    isActive ? 'ring-2 ring-offset-1' : ''
                  }`}
                  style={{ 
                    backgroundColor: `${statusColor}20`,
                    ...(isActive && { '--tw-ring-color': statusColor } as React.CSSProperties)
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColor }}
                  />
                  <span className="text-xs font-medium truncate flex-1 min-w-0" style={{ color: statusColor }}>
                    {getStatusText(status)} {statusStories.length}
                  </span>
                </div>
              );
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentMobileColumnIndex(prev => Math.min(Object.keys(storiesByStatus).length - 1, prev + 1))}
            disabled={currentMobileColumnIndex === Object.keys(storiesByStatus).length - 1}
            className="flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(storiesByStatus).map(([status, stories]) => (
          <Card key={status} data-column-id={status}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-sm font-medium ${getStatusColor(status)}`}>
                {getStatusText(status)} {stories.length}
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
