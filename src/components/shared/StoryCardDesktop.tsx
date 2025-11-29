import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Target, 
  Weight, 
  MapPin, 
  Star, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  Repeat,
  MoreHorizontal,
  CalendarPlus,
  Snowflake,
  Layers,
  Circle,
  PlayCircle,
  Eye,
  CheckCircle2,
  Heart,
  Users,
  Brain,
  Dumbbell
} from 'lucide-react';
import type { Story } from '@/types';
import { 
  getRoleName, 
  getVisionName, 
  getGoalName, 
  getProjectName, 
  getLabelObjects 
} from '@/utils/storyUtils';
import { 
  getPriorityColorStyle, 
  getTypeColorStyle, 
  getSizeColorStyle, 
  getWeightColorStyle 
} from '@/utils/storyCardColors';
import type { Role, Vision, Goal, Project, Label } from '@/types';

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'icebox':
      return <Snowflake className="h-2.5 w-2.5" />;
    case 'backlog':
      return <Layers className="h-2.5 w-2.5" />;
    case 'todo':
      return <Circle className="h-2.5 w-2.5" />;
    case 'progress':
    case 'in-progress':
      return <PlayCircle className="h-2.5 w-2.5" />;
    case 'review':
      return <Eye className="h-2.5 w-2.5" />;
    case 'done':
      return <CheckCircle2 className="h-2.5 w-2.5" />;
    default:
      return null;
  }
};

// Helper function to get type icon
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'Spiritual':
      return <Heart className="h-2.5 w-2.5" />;
    case 'Social':
      return <Users className="h-2.5 w-2.5" />;
    case 'Intellectual':
      return <Brain className="h-2.5 w-2.5" />;
    case 'Physical':
      return <Dumbbell className="h-2.5 w-2.5" />;
    default:
      return null;
  }
};

interface StoryCardDesktopProps {
  story: Story;
  isScheduled: boolean;
  roles: Role[];
  visions: Vision[];
  goals: Goal[];
  projects: Project[];
  labels: Label[];
  storySettings: any;
  getStatusColor: (status: string) => string;
  getTaskCategoryColor: (category: string) => string;
  showActions: boolean;
  draggable: boolean;
  onEdit?: (story: Story) => void;
  onDelete?: (storyId: string) => void;
  onAddToGoogleCalendar: () => void;
}

/**
 * Desktop layout for StoryCard - detailed card layout
 */
export function StoryCardDesktop({
  story,
  isScheduled,
  roles,
  visions,
  goals,
  projects,
  labels,
  storySettings,
  getStatusColor,
  getTaskCategoryColor,
  showActions,
  draggable,
  onEdit,
  onDelete,
  onAddToGoogleCalendar
}: StoryCardDesktopProps) {
  const completedChecklistItems = story.checklist.filter(item => item.done).length;
  const totalChecklistItems = story.checklist.length;

  return (
    <div className="hidden sm:block">
      <CardHeader className="pb-0.5">
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            <CardTitle className="text-xs font-medium line-clamp-1 flex-1">
              {story.title}
            </CardTitle>
            {isScheduled && (
              <div title="Scheduled">
                <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
              </div>
            )}
          </div>
          {showActions && (
            <div className="flex items-center space-x-0.5 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 sm:h-5 sm:w-5 p-0 text-blue-500 hover:text-blue-700 touch-manipulation"
                onClick={onAddToGoogleCalendar}
                title="Add to Google Calendar and move to In Progress (C)"
              >
                <CalendarPlus className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
              </Button>
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 sm:h-5 sm:w-5 p-0 touch-manipulation"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(story);
                  }}
                  title="Edit story (E)"
                >
                  <Edit className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 sm:h-5 sm:w-5 p-0 text-red-500 hover:text-red-700 touch-manipulation"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(story.id);
                  }}
                  title="Delete story (Delete)"
                >
                  <Trash2 className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                </Button>
              )}
              {!onEdit && !onDelete && draggable && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  title="Edit story"
                >
                  <MoreHorizontal className="h-2.5 w-2.5" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Description */}
        {story.description && (
          <p className="text-[10px] text-muted-foreground mb-1 line-clamp-1">
            {story.description}
          </p>
        )}

        {/* Priority, Type, Weight, Size, Status */}
        <div className="flex items-center gap-1 flex-wrap mb-1">
          <Badge 
            variant="outline"
            className="text-[10px] px-1 py-0"
            style={getPriorityColorStyle(story.priority, storySettings)}
          >
            {story.priority}
          </Badge>
          <Badge 
            variant="outline"
            className="text-[10px] px-1 py-0 flex items-center gap-0.5"
            style={getTypeColorStyle(story.type, storySettings)}
          >
            {getTypeIcon(story.type) || story.type}
          </Badge>
          <Badge 
            variant="outline"
            className="text-[10px] flex items-center gap-0.5 px-1 py-0"
            style={getWeightColorStyle(story.weight, storySettings)}
          >
            <Weight className="h-2.5 w-2.5" />
            {story.weight}
          </Badge>
          <Badge 
            variant="outline"
            className="text-[10px] px-1 py-0"
            style={getSizeColorStyle(story.size, storySettings)}
          >
            {story.size}
          </Badge>
          <Badge 
            style={{ 
              backgroundColor: getStatusColor(story.status),
              color: 'white'
            }}
            className="text-[10px] px-1 py-0 flex items-center gap-0.5"
          >
            {getStatusIcon(story.status) || story.status}
          </Badge>
          {(story as any)._isRecurringInstance && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1 py-0 bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-0.5"
            >
              <Repeat className="h-2.5 w-2.5" />
              Recurring
            </Badge>
          )}
        </div>

        {/* Task Categories */}
        {story.taskCategories && story.taskCategories.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-1">
            {story.taskCategories.slice(0, 2).map((category, idx) => (
              <Badge 
                key={idx}
                variant="outline"
                className="text-[10px] px-1 py-0"
                style={{ 
                  backgroundColor: getTaskCategoryColor(category),
                  color: 'white',
                  borderColor: getTaskCategoryColor(category)
                }}
              >
                {category.substring(0, 6)}
              </Badge>
            ))}
            {story.taskCategories.length > 2 && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                +{story.taskCategories.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Scheduled Date, Location, Goal */}
        {(story.scheduledDate || story.location || story.goalId) && (
          <div className="flex items-center gap-1 flex-wrap mb-1">
            {story.scheduledDate && (
              <Badge 
                variant="outline"
                className="text-[10px] px-1 py-0 flex items-center gap-0.5"
              >
                <Calendar className="h-2.5 w-2.5" />
                {new Date(story.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Badge>
            )}
            {story.location && (
              <Badge 
                variant="outline"
                className="text-[10px] px-1 py-0 flex items-center gap-0.5"
              >
                <MapPin className="h-2.5 w-2.5" />
                {story.location.substring(0, 8)}
              </Badge>
            )}
            {story.goalId && (
              <Badge 
                variant="outline"
                className="text-[10px] px-1 py-0 flex items-center gap-0.5"
              >
                <Star className="h-2.5 w-2.5" />
                Goal
              </Badge>
            )}
          </div>
        )}

        {/* Checklist Progress */}
        {totalChecklistItems > 0 && (
          <div className="mb-0.5">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-2 w-2 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                {completedChecklistItems}/{totalChecklistItems}
              </span>
            </div>
          </div>
        )}

        {/* Role, Vision, Goal, Project */}
        {(story.roleId || story.visionId || story.goalId || story.projectId) && (
          <div className="flex flex-wrap gap-0.5 mb-0.5">
            {story.roleId && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 flex items-center gap-0.5">
                <User className="h-2 w-2" />
                {getRoleName(story.roleId, roles).substring(0, 8)}
              </Badge>
            )}
            {story.visionId && (
              <Badge variant="outline" className="text-[10px] px-1 py-0 flex items-center gap-0.5">
                <Target className="h-2 w-2" />
                {getVisionName(story.visionId, visions).substring(0, 8)}
              </Badge>
            )}
            {story.goalId && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {getGoalName(story.goalId, goals).substring(0, 8)}
              </Badge>
            )}
            {story.projectId && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                {getProjectName(story.projectId, projects).substring(0, 8)}
              </Badge>
            )}
          </div>
        )}

        {/* Labels */}
        {story.labels.length > 0 && (
          <div className="flex flex-wrap gap-0.5 mb-0.5">
            {getLabelObjects(story.labels, labels).slice(0, 3).map((label, idx) => (
              <Badge 
                key={idx}
                variant="outline" 
                className="text-[10px] px-1 py-0"
                style={{ 
                  borderColor: label.color || '#6B7280',
                  color: label.color || '#6B7280'
                }}
              >
                {label.name.substring(0, 6)}
              </Badge>
            ))}
            {story.labels.length > 3 && (
              <Badge variant="outline" className="text-[10px] px-1 py-0">
                +{story.labels.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Subtasks count */}
        {story.subtasks && story.subtasks.length > 0 && (
          <div className="text-[10px] text-muted-foreground mb-0.5">
            {story.subtasks.length} subtasks
          </div>
        )}

        {/* Dates */}
        {(story.dueDate || story.createdAt) && (
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            {story.dueDate && (
              <div className="flex items-center gap-0.5">
                <Calendar className="h-2 w-2" />
                <span>
                  {new Date(story.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
            {story.createdAt && (
              <div className="flex items-center gap-0.5">
                <Clock className="h-2 w-2" />
                <span>
                  Created: {new Date(story.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Drag hint */}
        {draggable && !showActions && (
          <div className="text-[10px] text-muted-foreground mt-1">
            Drag to move
          </div>
        )}
      </CardContent>
    </div>
  );
}

