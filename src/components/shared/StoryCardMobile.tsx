import { Calendar, CalendarPlus, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getWeightGradientColor } from '@/utils/color';
import { StatusSelector } from './StatusSelector';
import { getPriorityColorStyle } from '@/utils/storyCardColors';
import type { Story } from '@/types';

interface StoryCardMobileProps {
  story: Story;
  isScheduled: boolean;
  storySettings: any;
  getStatusColor: (status: string) => string;
  showActions: boolean;
  onEdit?: (story: Story) => void;
  onAddToGoogleCalendar: () => void;
  onStatusChange?: (newStatus: Story['status']) => void;
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
  onAddToGoogleCalendar,
  onStatusChange
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
        {onStatusChange ? (
          <StatusSelector
            status={story.status}
            getStatusColor={getStatusColor}
            onStatusChange={onStatusChange}
            size="sm"
          />
        ) : (
          <div 
            style={{ 
              backgroundColor: getStatusColor(story.status),
              color: 'white'
            }}
            className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5 rounded"
          >
            {story.status.substring(0, 4)}
          </div>
        )}
        <span 
          className="text-[9px] font-medium whitespace-nowrap"
          style={{ 
            color: getWeightGradientColor(story.weight, storySettings.weightBaseColor)
          }}
        >
          {story.weight}
        </span>
        {/* Priority tag */}
        <div 
          style={getPriorityColorStyle(story.priority, storySettings)}
          className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5 rounded border"
        >
          {story.priority}
        </div>
        {/* Actions */}
        {showActions && (
          <>
            <Button
              size="sm"
              variant="ghost"
              className={`h-12 w-12 sm:h-8 sm:w-8 p-0 flex-shrink-0 touch-manipulation ${
                story.status === 'progress' || story.status === 'in-progress'
                  ? 'text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50'
                  : 'text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onAddToGoogleCalendar();
              }}
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

