import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Target, 
  Weight, 
  MapPin, 
  Tag, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react';
import { getWeightGradientColor } from '@/utils/color';
import type { Story, Priority, StoryType } from '@/types';

interface StoryCardProps {
  story: Story;
  roles: Array<{ id: string; name: string }>;
  labels: Array<{ id: string; name: string; color: string }>;
  visions: Array<{ id: string; name: string }>;
  goals: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
  settings: any;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  onSelect?: (storyId: string, index: number, event: React.MouseEvent) => void;
  isSelected?: boolean;
  isDragging?: boolean;
  showActions?: boolean;
  className?: string;
}

export function StoryCard({
  story,
  roles,
  labels,
  visions,
  goals,
  projects,
  settings,
  onEdit,
  onDelete,
  onSelect,
  isSelected = false,
  isDragging = false,
  showActions = true,
  className = ''
}: StoryCardProps) {
  const getRoleName = (roleId?: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.name || 'No Role';
  };

  const getVisionName = (visionId?: string) => {
    const vision = visions.find(v => v.id === visionId);
    return vision?.name || 'No Vision';
  };

  const getGoalName = (goalId?: string) => {
    const goal = goals.find(g => g.id === goalId);
    return goal?.name || 'No Goal';
  };

  const getProjectName = (projectId?: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.name || 'No Project';
  };

  const getLabelNames = (labelIds: string[]) => {
    return labelIds
      .map(id => labels.find(l => l.id === id))
      .filter(Boolean)
      .map(label => label!.name);
  };

  const getPriorityColor = (priority: Priority) => {
    return settings.priorityColors?.[priority] || '#6B7280';
  };

  const getTypeColor = (type: StoryType) => {
    const storyType = settings.storyTypes?.find((t: any) => t.name === type);
    return storyType?.color || '#6B7280';
  };

  const getStatusColor = (status: string) => {
    return settings.statusColors?.[status] || '#6B7280';
  };

  const getTaskCategoryColor = (category: string) => {
    const taskCategory = settings.taskCategories?.find((tc: any) => tc.name === category);
    return taskCategory?.color || '#6B7280';
  };

  const completedChecklistItems = story.checklist.filter(item => item.done).length;
  const totalChecklistItems = story.checklist.length;
  const checklistProgress = totalChecklistItems > 0 ? (completedChecklistItems / totalChecklistItems) * 100 : 0;

  const handleClick = (event: React.MouseEvent) => {
    if (onSelect) {
      onSelect(story.id, 0, event); // Index would need to be passed from parent
    }
  };

  return (
    <Card 
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {story.title}
          </CardTitle>
          {showActions && (
            <div className="flex items-center space-x-1 ml-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(story);
                  }}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(story.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Description */}
        {story.description && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {story.description}
          </p>
        )}

        {/* Priority and Type */}
        <div className="flex items-center space-x-2 mb-2">
          <Badge 
            style={{ 
              backgroundColor: getPriorityColor(story.priority),
              color: 'white'
            }}
            className="text-xs"
          >
            {story.priority}
          </Badge>
          <Badge 
            style={{ 
              backgroundColor: getTypeColor(story.type),
              color: 'white'
            }}
            className="text-xs"
          >
            {story.type}
          </Badge>
        </div>

        {/* Weight and Size */}
        <div className="flex items-center space-x-2 mb-2">
          <div className="flex items-center space-x-1">
            <Weight className="h-3 w-3 text-muted-foreground" />
            <span 
              className="text-xs font-medium"
              style={{ 
                color: getWeightGradientColor(story.weight, settings.weightBaseColor)
              }}
            >
              {story.weight}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {story.size}
          </Badge>
        </div>

        {/* Status */}
        <div className="mb-2">
          <Badge 
            style={{ 
              backgroundColor: getStatusColor(story.status),
              color: 'white'
            }}
            className="text-xs"
          >
            {story.status}
          </Badge>
        </div>

        {/* Checklist Progress */}
        {totalChecklistItems > 0 && (
          <div className="mb-2">
            <div className="flex items-center space-x-1 mb-1">
              <CheckCircle className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {completedChecklistItems}/{totalChecklistItems} tasks
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${checklistProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Role and Vision */}
        <div className="space-y-1 mb-2">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getRoleName(story.roleId)}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Target className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {getVisionName(story.visionId)}
            </span>
          </div>
        </div>

        {/* Created Date */}
        {story.createdAt && (
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Created: {new Date(story.createdAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Goal and Project */}
        {(story.goalId || story.projectId) && (
          <div className="space-y-1 mb-2">
            {story.goalId && (
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Goal: {getGoalName(story.goalId)}
                </span>
              </div>
            )}
            {story.projectId && (
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  Project: {getProjectName(story.projectId)}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Labels */}
        {story.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {getLabelNames(story.labels).map((labelName, index) => {
              const label = labels.find(l => l.name === labelName);
              return (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs"
                  style={{ 
                    borderColor: label?.color || '#6B7280',
                    color: label?.color || '#6B7280'
                  }}
                >
                  {labelName}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Task Categories */}
        {story.taskCategories && story.taskCategories.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {story.taskCategories.map((category, index) => (
              <Badge 
                key={index}
                style={{ 
                  backgroundColor: getTaskCategoryColor(category),
                  color: 'white'
                }}
                className="text-xs"
              >
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1">
          {story.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Due: {new Date(story.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {story.scheduledDate && (
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Scheduled: {new Date(story.scheduledDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {story.location && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {story.location}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
