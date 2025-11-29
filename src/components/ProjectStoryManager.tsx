import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useDroppable, useDraggable, DragOverEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { StoryCard } from '@/components/shared/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  projectsAtom, 
  storiesAtom, 
  addStoryToProjectAtom,
  removeStoryFromProjectAtom,
} from '@/stores/appStore';
import { Search, X, Plus } from 'lucide-react';
import type { Project, Story } from '@/types';

// Draggable Story Card Component
function DraggableStoryCard({ 
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
      } ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        if (!isDragging) {
          onClick(e);
        }
      }}
    >
      <StoryCard story={story} isSelected={isSelected} onEdit={onEdit} isDragging={isDragging} />
    </div>
  );
}

// Project Stories Section with Droppable Zone
function ProjectStoriesSection({ 
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
    id: 'project-stories',
    data: {
      type: 'drop-zone',
      zone: 'project'
    }
  });


  return (
    <div className="flex-1 border-r p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Project Stories ({stories.length})</h3>
        <Badge variant="outline">Drag to remove</Badge>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-2 overflow-y-auto h-full min-h-[200px] border-2 border-dashed rounded-lg p-2 ${
          isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
        }`}
        style={{ minHeight: '200px' }}
      >
        {stories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No stories in this section</p>
          </div>
        ) : (
          stories.map((story) => (
            <DraggableStoryCard
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
        <h3 className="font-semibold">Available Stories ({stories.length})</h3>
        <Badge variant="outline">Drag to add</Badge>
      </div>
      <div 
        ref={setNodeRef}
        className={`space-y-2 overflow-y-auto h-full min-h-[200px] border-2 border-dashed rounded-lg p-2 ${
          isOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50'
        }`}
        style={{ minHeight: '200px' }}
      >
        {stories.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            <p>No stories in this section</p>
          </div>
        ) : (
          stories.map((story) => (
            <DraggableStoryCard
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

interface ProjectStoryManagerProps {
  project: Project;
  onClose: () => void;
}

export function ProjectStoryManager({ project, onClose }: ProjectStoryManagerProps) {
  const [projects] = useAtom(projectsAtom);
  const [stories] = useAtom(storiesAtom);
  const [, addStoryToProject] = useAtom(addStoryToProjectAtom);
  const [, removeStoryFromProject] = useAtom(removeStoryFromProjectAtom);
  // const [, updateStory] = useAtom(updateStoryAtom); // Available for future use

  const [searchText, setSearchText] = useState('');
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);

  // Get current project data (updated in real-time)
  const currentProject = projects.find(p => p.id === project.id) || project;

  // Get project stories
  const projectStories = stories.filter(story => 
    currentProject.storyIds?.includes(story.id) && !story.deleted
  );

  // Get available stories (not in project)
  const availableStories = stories.filter(story => 
    !currentProject.storyIds?.includes(story.id) && !story.deleted
  );

  // Filter stories based on search
  const filteredProjectStories = projectStories.filter(story =>
    story.title.toLowerCase().includes(searchText.toLowerCase()) ||
    story.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredAvailableStories = availableStories.filter(story =>
    story.title.toLowerCase().includes(searchText.toLowerCase()) ||
    story.description.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      return;
    }

    const storyId = active.id as string;

    // Simple ID-based approach
    if (over.id === 'project-stories' && !currentProject.storyIds?.includes(storyId)) {
      addStoryToProject(currentProject.id, storyId);
    } else if (over.id === 'available-stories' && currentProject.storyIds?.includes(storyId)) {
      removeStoryFromProject(currentProject.id, storyId);
    }
  };

  const handleStoryToggle = (storyId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Single selection with Ctrl/Cmd
      setSelectedStories(prev => 
        prev.includes(storyId) 
          ? prev.filter(id => id !== storyId)
          : [...prev, storyId]
      );
    } else if (event.shiftKey && selectedStories.length > 0) {
      // Range selection with Shift
      const currentIndex = availableStories.findIndex(s => s.id === storyId);
      const lastSelectedIndex = availableStories.findIndex(s => s.id === selectedStories[selectedStories.length - 1]);
      
      const start = Math.min(currentIndex, lastSelectedIndex);
      const end = Math.max(currentIndex, lastSelectedIndex);
      
      const rangeStories = availableStories.slice(start, end + 1).map(s => s.id);
      setSelectedStories(prev => [...new Set([...prev, ...rangeStories])]);
    } else {
      // Single selection
      setSelectedStories([storyId]);
    }
  };

  const handleAddSelectedToProject = () => {
    selectedStories.forEach(storyId => {
      if (!currentProject.storyIds?.includes(storyId)) {
        addStoryToProject(currentProject.id, storyId);
      }
    });
    setSelectedStories([]);
  };

  const handleRemoveSelectedFromProject = () => {
    selectedStories.forEach(storyId => {
      if (currentProject.storyIds?.includes(storyId)) {
        removeStoryFromProject(currentProject.id, storyId);
      }
    });
    setSelectedStories([]);
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  const activeStory = activeId ? stories.find(s => s.id === activeId) : null;

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header - positioned below main app header */}
      <div className="border-b p-4 flex items-center justify-between mt-14 md:mt-16">
        <div>
          <h2 className="text-xl font-bold">{currentProject.name} - Product Management</h2>
          <p className="text-sm text-muted-foreground">
            {projectStories.length} stories in project • {availableStories.length} available
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-2xl font-bold hover:text-muted-foreground"
        >
          ×
        </button>
      </div>

      {/* Controls */}
      <div className="border-b p-4 space-y-4 pb-20 lg:pb-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stories..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedStories.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedStories.length} selected
              </Badge>
              <Button
                size="sm"
                onClick={handleAddSelectedToProject}
                className="gap-1"
              >
                <Plus className="h-3 w-3" />
                Add to Project
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRemoveSelectedFromProject}
                className="gap-1"
              >
                <X className="h-3 w-3" />
                Remove from Project
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <DndContext 
          onDragStart={handleDragStart} 
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
        >
          {/* Project Stories */}
          <ProjectStoriesSection 
            stories={filteredProjectStories}
            selectedStories={selectedStories}
            onStoryToggle={handleStoryToggle}
            onEditStory={handleEditStory}
          />

          {/* Available Stories */}
          <AvailableStoriesSection 
            stories={filteredAvailableStories}
            selectedStories={selectedStories}
            onStoryToggle={handleStoryToggle}
            onEditStory={handleEditStory}
          />

          <DragOverlay>
            {activeStory ? (
              <div className="opacity-50 max-w-sm sm:max-w-md">
                <StoryCard story={activeStory} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Edit Story Modal */}
      {editingStory && (
        <EditStoryModal
          open={!!editingStory}
          onOpenChange={(open) => !open && setEditingStory(null)}
          story={editingStory}
        />
      )}
    </div>
  );
}
