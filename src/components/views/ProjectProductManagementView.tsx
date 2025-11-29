import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, DragOverEvent, useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { StoryCard } from '@/components/shared/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { AddStoryModal } from '@/components/modals/AddStoryModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  projectsAtom, 
  storiesAtom, 
  addStoryToProjectAtom,
  removeStoryFromProjectAtom,
  updateStoryAtom,
  rolesAtom,
  labelsAtom,
  visionsAtom,
  settingsAtom,
  selectedProjectIdAtom
} from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { FolderOpen, Plus, Weight, MoreHorizontal } from 'lucide-react';
import type { Project, Story, Priority } from '@/types';
import { getWeightGradientColor } from '@/utils';

// Simple Story Card Component for Available Stories (not assigned to any project)
function AvailableStoryCard({ 
  story, 
  isSelected, 
  onClick,
  onEdit
}: { 
  story: Story; 
  isSelected: boolean; 
  onClick: (e: React.MouseEvent) => void;
  onEdit: (story: Story) => void;
}) {
  return (
    <StoryCard
      story={story}
      isSelected={isSelected}
      onClick={onClick}
      onEdit={onEdit}
      showActions={true}
    />
  );
}

// Project Story Card Component (assigned to current project)
function ProjectStoryCard({ 
  story, 
  isSelected, 
  onClick,
  onEdit,
  projectName
}: { 
  story: Story; 
  isSelected: boolean; 
  onClick: (e: React.MouseEvent) => void;
  onEdit: (story: Story) => void;
  projectName: string;
}) {
  return (
    <StoryCard
      story={story}
      isSelected={isSelected}
      onClick={onClick}
      onEdit={onEdit}
      showActions={true}
    />
  );
}

// Draggable Story Card Component for Available Stories
function DraggableAvailableStoryCard({ 
  story, 
  isSelected, 
  onClick,
  onEdit
}: { 
  story: Story; 
  isSelected: boolean; 
  onClick: (e: React.MouseEvent) => void;
  onEdit: (story: Story) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: story.id,
    data: {
      type: 'story',
      story,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' : ''}`}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only handle click if not dragging and not a drag operation
        if (!isDragging) {
          onClick(e);
        }
      }}
      onMouseDown={(e) => {
        // Prevent drag from starting on certain elements
        if (e.target instanceof HTMLElement) {
          const isButton = e.target.closest('button');
          const isInput = e.target.closest('input');
          if (isButton || isInput) {
            e.stopPropagation();
          }
        }
        
        // Special handling for Ctrl+Shift to prevent drag interference
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
          e.stopPropagation();
        }
      }}
      onKeyDown={(e) => {
        // Handle keyboard combinations
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        }
      }}
    >
      <AvailableStoryCard story={story} isSelected={isSelected} onEdit={onEdit} onClick={() => {}} />
    </div>
  );
}

// Draggable Story Card Component for Project Stories
function DraggableProjectStoryCard({ 
  story, 
  isSelected, 
  onClick,
  onEdit,
  projectName
}: { 
  story: Story; 
  isSelected: boolean; 
  onClick: (e: React.MouseEvent) => void;
  onEdit: (story: Story) => void;
  projectName: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: story.id,
    data: {
      type: 'story',
      story,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cursor-grab hover:shadow-md transition-shadow ${
        isDragging ? 'opacity-50 cursor-grabbing' : ''
      } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950/30' : ''}`}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        // Only handle click if not dragging and not a drag operation
        if (!isDragging) {
          onClick(e);
        }
      }}
      onMouseDown={(e) => {
        // Prevent drag from starting on certain elements
        if (e.target instanceof HTMLElement) {
          const isButton = e.target.closest('button');
          const isInput = e.target.closest('input');
          if (isButton || isInput) {
            e.stopPropagation();
          }
        }
        
        // Special handling for Ctrl+Shift to prevent drag interference
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
          e.stopPropagation();
        }
      }}
      onKeyDown={(e) => {
        // Handle keyboard combinations
        if ((e.ctrlKey || e.metaKey) && e.shiftKey) {
        }
      }}
    >
      <ProjectStoryCard story={story} isSelected={isSelected} onEdit={onEdit} projectName={projectName} onClick={() => {}} />
    </div>
  );
}

// Project Stories Section with Droppable Zone
function ProjectStoriesSection({ 
  stories, 
  selectedStories, 
  onStoryToggle,
  onEditStory,
  onAddStory
}: { 
  stories: Story[]; 
  selectedStories: string[]; 
  onStoryToggle: (storyId: string, event: React.MouseEvent) => void;
  onEditStory: (story: Story) => void;
  onAddStory: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'project-stories',
    data: {
      type: 'drop-zone',
      zone: 'project'
    }
  });

  return (
    <div className="flex-1 border-r border-border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Project Stories ({stories.length})</h3>
        <Badge variant="outline">Drag to remove</Badge>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-2 overflow-y-auto h-full min-h-[400px] border-2 border-dashed rounded-lg p-2 ${
          isOver 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
        }`}
        style={{ minHeight: '400px' }}
      >
        {stories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4">
            <p>No stories in this project</p>
            <Button
              onClick={onAddStory}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Story
            </Button>
          </div>
        ) : (
          stories.map((story) => (
            <DraggableProjectStoryCard
              key={story.id}
              story={story}
              isSelected={selectedStories.includes(story.id)}
              onClick={(e) => onStoryToggle(story.id, e)}
              onEdit={onEditStory}
              projectName="this project"
            />
          ))
        )}
      </div>
    </div>
  );
}

// Available Stories Section with Droppable Zone
function AvailableStoriesSection({ 
  stories, 
  selectedStories, 
  onStoryToggle,
  onEditStory
}: { 
  stories: Story[]; 
  selectedStories: string[]; 
  onStoryToggle: (storyId: string, event: React.MouseEvent) => void;
  onEditStory: (story: Story) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'available-stories',
    data: {
      type: 'drop-zone',
      zone: 'available'
    }
  });

  return (
    <div className="flex-1 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">Available Stories ({stories.length})</h3>
        <Badge variant="outline">Drag to add</Badge>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-2 overflow-y-auto h-full min-h-[400px] border-2 border-dashed rounded-lg p-2 ${
          isOver 
            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/30' 
            : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50'
        }`}
        style={{ minHeight: '400px' }}
      >
        {stories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No available stories</p>
          </div>
        ) : (
          stories.map((story) => (
            <DraggableAvailableStoryCard
              key={story.id}
              story={story}
              isSelected={selectedStories.includes(story.id)}
              onClick={(e) => onStoryToggle(story.id, e)}
              onEdit={onEditStory}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function ProjectProductManagementView() {
  const [projects] = useAtom(projectsAtom);
  const [stories] = useAtom(storiesAtom);
  const [, addStoryToProject] = useAtom(addStoryToProjectAtom);
  const [, removeStoryFromProject] = useAtom(removeStoryFromProjectAtom);
  const [, updateStory] = useAtom(updateStoryAtom);

  const [selectedProjectId, setSelectedProjectId] = useAtom(selectedProjectIdAtom);

  // Use settings mirror system for story settings
  const storySettings = useStorySettings();
  
  // Get the current selected project from the projects atom
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) || null
    : null;
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [isAddStoryModalOpen, setIsAddStoryModalOpen] = useState(false);

  // Auto-select first project when projects load or change
  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProject]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // Increased distance to make clicks easier
        delay: 100, // Small delay to distinguish between click and drag
        tolerance: 5, // Allow small movements before starting drag
      },
    })
  );

  // Get current project data (updated in real-time)
  const currentProject = selectedProject ? projects.find(p => p.id === selectedProject.id) || selectedProject : null;

  // Get project stories (stories assigned to the current project)
  const projectStories = currentProject 
    ? stories.filter(story => 
        currentProject.storyIds.includes(story.id) && !story.deleted
      )
    : [];

  // Get available stories (stories not assigned to ANY project)
  const availableStories = currentProject 
    ? stories.filter(story => {
        // Story must not be deleted
        if (story.deleted) return false;
        
        // Story must not be assigned to any project
        const isAssignedToAnyProject = projects.some(project => 
          project.storyIds.includes(story.id)
        );
        
        return !isAssignedToAnyProject;
      })
    : [];

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !currentProject) {
      return;
    }

    const storyId = active.id as string;
    const isStoryInProject = currentProject.storyIds.includes(storyId);

    // Check if dropping on the correct zone
    if (over.id === 'available-stories' && isStoryInProject) {
      removeStoryFromProject(currentProject.id, storyId);
    } else if (over.id === 'project-stories' && !isStoryInProject) {
      
      // First, remove the story from any other project it might be assigned to
      const otherProjects = projects.filter(project => 
        project.id !== currentProject.id && project.storyIds.includes(storyId)
      );
      
      // Remove from other projects
      otherProjects.forEach(project => {
        removeStoryFromProject(project.id, storyId);
      });
      
      // Then add to current project
      addStoryToProject(currentProject.id, storyId);
    } else if (over.data?.current?.zone === 'available' && isStoryInProject) {
      // Fallback: check data zone
      removeStoryFromProject(currentProject.id, storyId);
    } else if (over.data?.current?.zone === 'project' && !isStoryInProject) {
      // Fallback: check data zone
      
      // First, remove the story from any other project it might be assigned to
      const otherProjects = projects.filter(project => 
        project.id !== currentProject.id && project.storyIds.includes(storyId)
      );
      
      // Remove from other projects
      otherProjects.forEach(project => {
        removeStoryFromProject(project.id, storyId);
      });
      
      // Then add to current project
      addStoryToProject(currentProject.id, storyId);
    }
  };

  const handleStoryToggle = (storyId: string, event: React.MouseEvent) => {
    // Handle Ctrl+Shift combination (Ctrl+Shift takes priority)
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      // Ctrl+Shift: Add to selection without clearing previous
      setSelectedStories(prev => 
        prev.includes(storyId) 
          ? prev.filter(id => id !== storyId)
          : [...prev, storyId]
      );
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-selection with Ctrl/Cmd - toggle individual stories
      setSelectedStories(prev => 
        prev.includes(storyId) 
          ? prev.filter(id => id !== storyId)
          : [...prev, storyId]
      );
    } else if (event.shiftKey && selectedStories.length > 0) {
      // Range selection with Shift - select range from last selected to current
      const allStories = [...projectStories, ...availableStories];
      const currentIndex = allStories.findIndex(s => s.id === storyId);
      const lastSelectedIndex = allStories.findIndex(s => s.id === selectedStories[selectedStories.length - 1]);
      
      if (currentIndex !== -1 && lastSelectedIndex !== -1) {
      const start = Math.min(currentIndex, lastSelectedIndex);
      const end = Math.max(currentIndex, lastSelectedIndex);
      
      const rangeStories = allStories.slice(start, end + 1).map(s => s.id);
      setSelectedStories(prev => [...new Set([...prev, ...rangeStories])]);
      }
    } else {
      // Single selection - clear previous selections and select only this story
      setSelectedStories([storyId]);
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  const activeStory = activeId ? stories.find(s => s.id === activeId) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedProject?.id || ''}
              onValueChange={(projectId) => {
                setSelectedProjectId(projectId);
                setSelectedStories([]); // Clear selection when switching projects
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select a project..." />
              </SelectTrigger>
              <SelectContent>
                {projects.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No projects available
                  </SelectItem>
                ) : (
                  projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{project.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({project.storyIds?.length || 0} stories)
                        </span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsAddStoryModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Story
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {selectedStories.length > 0 && (
            <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStories([])}
            >
              Clear Selection ({selectedStories.length})
            </Button>
              {selectedStories.length > 1 && (
                <div className="text-xs text-muted-foreground">
                  {selectedStories.length} stories selected
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {!selectedProject ? (
        <Card className="h-96 flex items-center justify-center">
          <CardContent className="text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
            <p className="text-muted-foreground mb-4">
              Select a project from the dropdown above to manage its stories
            </p>
            {projects.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Create your first project to get started
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Project Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-foreground">{currentProject?.name}</h3>
            <p className="text-sm text-muted-foreground">{currentProject?.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{projectStories.length} stories assigned to this project</span>
              <span>{availableStories.length} unassigned stories available</span>
              <span>Status: {currentProject?.status}</span>
            </div>
            
          </div>

          {/* Two Column Layout */}
          <div className="flex h-[600px] border border-border rounded-lg overflow-hidden">
            <DndContext 
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              sensors={sensors}
            >
              {/* Project Stories */}
              <ProjectStoriesSection 
                stories={projectStories}
                selectedStories={selectedStories}
                onStoryToggle={handleStoryToggle}
                onEditStory={handleEditStory}
                onAddStory={() => setIsAddStoryModalOpen(true)}
              />

              {/* Available Stories */}
              <AvailableStoriesSection 
                stories={availableStories}
                selectedStories={selectedStories}
                onStoryToggle={handleStoryToggle}
                onEditStory={handleEditStory}
              />

              <DragOverlay>
                {activeStory ? (
                  <div className="opacity-50">
                    <StoryCard story={activeStory} />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      )}

      {/* Edit Story Modal */}
      {editingStory && (
        <EditStoryModal
          open={!!editingStory}
          onOpenChange={(open) => !open && setEditingStory(null)}
          story={editingStory}
        />
      )}

      {/* Add Story Modal */}
      <AddStoryModal
        open={isAddStoryModalOpen}
        onOpenChange={setIsAddStoryModalOpen}
        initialData={selectedProject ? { projectId: selectedProject.id } : undefined}
      />
    </div>
  );
}
