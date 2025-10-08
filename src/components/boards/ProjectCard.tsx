import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Calendar, FolderOpen, Target, Kanban, Settings, Weight, Clock } from 'lucide-react';
import type { Project } from '@/types';
import { useAtom } from 'jotai';
import { storiesAtom, settingsAtom } from '@/stores/appStore';

interface ProjectCardProps {
  project: Project;
  isSelected?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  onEdit?: (project: Project) => void;
  onOpenKanban?: (project: Project) => void;
  onOpenStoryManager?: (project: Project) => void;
}

export function ProjectCard({ project, isSelected = false, onClick, onEdit, onOpenKanban, onOpenStoryManager }: ProjectCardProps) {
  const [stories] = useAtom(storiesAtom);
  const [settings] = useAtom(settingsAtom);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: project.id,
    data: {
      type: 'project',
      project,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  const projectStories = stories.filter(story => project.storyIds?.includes(story.id));
  const completedStories = projectStories.filter(story => story.checklist.every(item => item.done));
  const progressPercentage = projectStories.length > 0 ? Math.round((completedStories.length / projectStories.length) * 100) : 0;

  // Calculate total weight
  const totalWeight = projectStories.reduce((sum, story) => sum + story.weight, 0);

  // Calculate estimated time based on story sizes
  const getTimeEstimateInMinutes = (size: string): number => {
    const sizeConfig = settings.storySizes?.find(s => s.name === size);
    if (!sizeConfig) return 0;
    
    const timeEstimate = sizeConfig.timeEstimate.toLowerCase();
    if (timeEstimate.includes('min')) {
      return parseInt(timeEstimate) || 0;
    } else if (timeEstimate.includes('hour')) {
      return (parseInt(timeEstimate) || 1) * 60;
    } else if (timeEstimate.includes('day')) {
      return (parseInt(timeEstimate) || 1) * 8 * 60; // 8 hours per day
    }
    return 0;
  };

  const totalEstimatedMinutes = projectStories.reduce((sum, story) => {
    return sum + getTimeEstimateInMinutes(story.size);
  }, 0);

  const formatTimeEstimate = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) { // Less than a day
      const hours = Math.round(minutes / 60);
      return `${hours}h`;
    } else {
      const days = Math.round(minutes / (8 * 60)); // 8 hours per day
      return `${days}d`;
    }
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'Icebox':
        return { backgroundColor: '#6B728020', color: '#6B7280', borderColor: '#6B728040' };
      case 'Backlog':
        return { backgroundColor: '#3B82F620', color: '#3B82F6', borderColor: '#3B82F640' };
      case 'To do':
        return { backgroundColor: '#F59E0B20', color: '#F59E0B', borderColor: '#F59E0B40' };
      case 'In Progress':
        return { backgroundColor: '#F9731620', color: '#F97316', borderColor: '#F9731640' };
      case 'Done':
        return { backgroundColor: '#10B98120', color: '#10B981', borderColor: '#10B98140' };
      default:
        return { backgroundColor: '#6B728020', color: '#6B7280', borderColor: '#6B728040' };
    }
  };

  const statusColors = getStatusColor(project.status);

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
        if (!isDragging) {
          onClick?.(e);
        }
      }}
    >
      <CardContent className="p-3 space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm line-clamp-1">{project.name}</h3>
            {project.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                {project.description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-2"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(project);
            }}
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className="text-xs px-2 py-1"
            style={statusColors}
          >
            {project.status}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            <span>{projectStories.length} stories</span>
          </div>
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{completedStories.length} completed</span>
          </div>
          <div className="flex items-center gap-1">
            <Weight className="h-3 w-3" />
            <span>{totalWeight} points</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatTimeEstimate(totalEstimatedMinutes)}</span>
          </div>
        </div>

        {/* Dates */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
          </div>
          {project.endDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onOpenKanban?.(project);
              }}
              title="Open Kanban Board"
            >
              <Kanban className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onOpenStoryManager?.(project);
              }}
              title="Product Management"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 sm:h-5 sm:w-5 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(project);
            }}
          >
            <MoreHorizontal className="h-2.5 w-2.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
