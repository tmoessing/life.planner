import { Calendar, CalendarPlus, Edit, Snowflake, Layers, Circle, PlayCircle, Eye, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getWeightGradientColor } from '@/utils/color';
import type { Story } from '@/types';

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'icebox':
      return <Snowflake className="h-3 w-3" />;
    case 'backlog':
      return <Layers className="h-3 w-3" />;
    case 'todo':
      return <Circle className="h-3 w-3" />;
    case 'progress':
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

interface StoryCardMobileProps {
  story: Story;
  isScheduled: boolean;
  storySettings: any;
  getStatusColor: (status: string) => string;
  showActions: boolean;
  onEdit?: (story: Story) => void;
  onAddToGoogleCalendar: () => void;
}

/**
 * Mobile layout for StoryCard - compact single-row layout like Gmail
 */
export function StoryCardMobile({
  story,
  isScheduled,
  storySettings,
  getStatusColor,
  showActions,
  onEdit,
  onAddToGoogleCalendar
}: StoryCardMobileProps) {
  return (
    <div className="sm:hidden p-1.5 flex items-center gap-1.5 min-h-[44px]">
      {/* Priority badge as indicator */}
      <div 
        className="w-1 h-6 rounded-full flex-shrink-0"
        style={{ backgroundColor: storySettings.getPriorityColor(story.priority) }}
      />
      {/* Title - takes available space */}
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <span className="text-xs font-medium truncate flex-1 min-w-0">
          {story.title}
        </span>
        {isScheduled && (
          <div title="Scheduled">
            <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
          </div>
        )}
      </div>
      {/* Key badges and info - right aligned, compact */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Badge 
          style={{ 
            backgroundColor: getStatusColor(story.status),
            color: 'white'
          }}
          className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5"
        >
          {getStatusIcon(story.status) || story.status.substring(0, 4)}
        </Badge>
        <span 
          className="text-[9px] font-medium whitespace-nowrap"
          style={{ 
            color: getWeightGradientColor(story.weight, storySettings.weightBaseColor)
          }}
        >
          {story.weight}
        </span>
        {/* Actions */}
        {showActions && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className="h-12 w-12 sm:h-8 sm:w-8 p-0 flex-shrink-0 text-blue-500 hover:text-blue-700 touch-manipulation"
              onClick={onAddToGoogleCalendar}
              title="Add to Google Calendar and move to In Progress (C)"
            >
              <CalendarPlus className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-12 w-12 sm:h-8 sm:w-8 p-0 flex-shrink-0 touch-manipulation"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(story);
                }}
                title="Edit story (E)"
              >
                <Edit className="h-5 w-5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

