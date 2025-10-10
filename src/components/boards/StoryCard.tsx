import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Calendar, User, Star, Weight } from 'lucide-react';
import type { Story, Priority } from '@/types';
import { useAtom } from 'jotai';
import { rolesAtom, visionsAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { getWeightGradientColor } from '@/utils';

interface StoryCardProps {
  story: Story;
  isSelected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onEdit?: (story: Story) => void;
}

export function StoryCard({ story, isSelected = false, onClick, onEdit }: StoryCardProps) {
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const storySettings = useStorySettings();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: story.id,
    data: {
      type: 'story',
      story,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const role = roles.find(r => r.id === story.roleId);
  const vision = visions.find(v => v.id === story.visionId);

  const getPriorityColor = (priority: Priority) => {
    const priorityColor = storySettings.getPriorityColor(priority);
    return {
      backgroundColor: `${priorityColor}20`,
      color: priorityColor,
      borderColor: `${priorityColor}40`
    };
  };

  const getWeightColor = (weight: number) => {
    const gradientColor = getWeightGradientColor(weight, storySettings.weightBaseColor, 21);
    return {
      backgroundColor: `${gradientColor}20`,
      color: gradientColor,
      borderColor: `${gradientColor}40`
    };
  };

  const getStoryTypeColor = (type: string) => {
    const typeColor = storySettings.getTypeColor(type);
    return {
      backgroundColor: `${typeColor}20`,
      color: typeColor,
      borderColor: `${typeColor}40`
    };
  };

  // const getStorySizeConfig = (size: string) => {
  //   const storySize = storySettings.storySizes?.find(ss => ss.name === size);
  //   return storySize || { name: size, color: '#6B7280', timeEstimate: '' };
  // };

  const getStorySizeColor = (size: string) => {
    const sizeColor = storySettings.getSizeColor(size);
    return {
      backgroundColor: `${sizeColor}20`,
      color: sizeColor,
      borderColor: `${sizeColor}40`
    };
  };

  const getTaskCategoryColor = (category: string) => {
    return storySettings.getTaskCategoryColor(category);
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only handle click if not dragging
        if (!isDragging) {
          onClick?.(e);
        }
      }}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only handle double-click if not dragging
        if (!isDragging) {
          onEdit?.(story);
        }
      }}
    >
      <CardContent className="p-1.5 sm:p-2 space-y-1">
        {/* Title */}
        <h4 className="font-medium text-xs line-clamp-2">{story.title}</h4>
        
        {/* Description */}
        {story.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {story.description}
          </p>
        )}

        {/* Priority, Weight, Type and Size */}
        <div className="flex items-center gap-1 flex-wrap">
          <Badge 
            variant="outline" 
            className="text-xs px-1.5 py-0.5"
            style={getPriorityColor(story.priority)}
          >
            {story.priority}
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs flex items-center gap-1 px-1.5 py-0.5"
            style={getWeightColor(story.weight)}
          >
            <Weight className="h-2.5 w-2.5" />
            {story.weight}
          </Badge>
          <Badge 
            variant="secondary" 
            className="text-xs px-1.5 py-0.5"
            style={getStoryTypeColor(story.type)}
          >
            {story.type}
          </Badge>
          <Badge 
            variant="outline" 
            className="text-xs px-1.5 py-0.5"
            style={getStorySizeColor(story.size)}
          >
            {story.size}
          </Badge>
        </div>

        {/* Task Categories, Scheduled Date, Location, Goal - New attributes */}
        <div className="flex items-center gap-1 flex-wrap">
          {story.taskCategories && story.taskCategories.length > 0 && (
            <>
              {story.taskCategories.map((category, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="text-xs px-1.5 py-0.5"
                  style={{ 
                    backgroundColor: getTaskCategoryColor(category),
                    color: 'white',
                    borderColor: getTaskCategoryColor(category)
                  }}
                >
                  {category}
                </Badge>
              ))}
            </>
          )}
          {story.scheduledDate && (
            <Badge 
              variant="outline" 
              className="text-xs px-1.5 py-0.5 flex items-center gap-1"
            >
              <Calendar className="h-2.5 w-2.5" />
              {new Date(story.scheduledDate).toLocaleDateString()}
            </Badge>
          )}
          {story.location && (
            <Badge 
              variant="outline" 
              className="text-xs px-1.5 py-0.5 flex items-center gap-1"
            >
              📍 {story.location}
            </Badge>
          )}
          {story.goalId && (
            <Badge 
              variant="outline" 
              className="text-xs px-1.5 py-0.5 flex items-center gap-1"
            >
              <Star className="h-2.5 w-2.5" />
              Goal
            </Badge>
          )}
        </div>

        {/* Role and Vision - Hidden on mobile to save space */}
        <div className="hidden sm:block space-y-0.5">
          {role && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <User className="h-2.5 w-2.5" />
              <span className="truncate">{role.name}</span>
            </div>
          )}
          {vision && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-2.5 w-2.5" />
              <span className="truncate">{vision.title}</span>
            </div>
          )}
        </div>


        {/* Due Date - Hidden on mobile to save space */}
        {story.dueDate && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-2.5 w-2.5" />
            <span>{new Date(story.dueDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Checklist Progress - Hidden on mobile to save space */}
        {story.checklist.length > 0 && (
          <div className="hidden sm:block text-xs text-muted-foreground">
            {story.checklist.filter(item => item.done).length} / {story.checklist.length} tasks
          </div>
        )}

        {/* Subtasks - Hidden on mobile to save space */}
        {story.subtasks && story.subtasks.length > 0 && (
          <div className="hidden sm:block text-xs text-muted-foreground">
            {story.subtasks.length} subtasks
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-xs text-muted-foreground hidden sm:block">
            Drag to move
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 sm:h-5 sm:w-5 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(story);
            }}
            title="Edit story"
          >
            <MoreHorizontal className="h-2.5 w-2.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
