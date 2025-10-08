import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { KanbanColumn } from '@/components/boards/KanbanColumn';
import { StoryCard } from '@/components/boards/StoryCard';
import { EditStoryModal } from '@/components/modals/EditStoryModal';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  projectsAtom, 
  storiesAtom, 
  updateStoryAtom,
  deleteStoryAtom,
  addStoryAtom
} from '@/stores/appStore';
import { FolderOpen, Undo } from 'lucide-react';
import type { Story } from '@/types';

export function ProjectsKanbanBoardsView() {
  const [projects] = useAtom(projectsAtom);
  const [stories] = useAtom(storiesAtom);
  const [, updateStory] = useAtom(updateStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  const [, addStory] = useAtom(addStoryAtom);

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Get the current selected project from the projects atom
  const selectedProject = selectedProjectId 
    ? projects.find(p => p.id === selectedProjectId) || null
    : null;
  const [activeId, setActiveId] = useState<string | null>(null);

  // Auto-select first project when projects load or change
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
  const [undoStack, setUndoStack] = useState<Array<{
    type: 'delete' | 'move';
    storyId: string;
    previousColumnId?: string;
    story?: Story;
  }>>([]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Get project stories
  const projectStories = selectedProject 
    ? stories.filter(story => 
        selectedProject.storyIds.includes(story.id) && !story.deleted
      )
    : [];

  // Define status columns for Kanban
  const statusColumns = [
    { id: 'icebox', name: 'Icebox' },
    { id: 'backlog', name: 'Backlog' },
    { id: 'todo', name: 'To Do' },
    { id: 'progress', name: 'In Progress' },
    { id: 'review', name: 'Review' },
    { id: 'done', name: 'Done' }
  ];

  // Group stories by status
  const storiesByStatus = statusColumns.reduce((acc, status) => {
    acc[status.id] = projectStories.filter(story => story.status === status.id);
    return acc;
  }, {} as Record<string, Story[]>);

  // Helper function to get range of stories between two indices
  const getStoriesInRange = (storyList: Story[], startIndex: number, endIndex: number): string[] => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    return storyList.slice(start, end + 1).map(story => story.id);
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const lastAction = undoStack[undoStack.length - 1];
      console.log('Undo action:', lastAction);
      
      if (lastAction.type === 'delete' && lastAction.story) {
        // Restore deleted story by adding it back
        const storyToRestore = { ...lastAction.story, deleted: false };
        console.log('Undo delete: restoring story', lastAction.storyId);
        addStory(storyToRestore);
      } else if (lastAction.type === 'move' && lastAction.previousColumnId) {
        // Restore previous status
        updateStory(lastAction.storyId, { status: lastAction.previousColumnId as any });
        console.log('Undo move:', lastAction.storyId, 'back to status:', lastAction.previousColumnId);
      }
      
      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (event.key === 'Delete' && selectedStories.length > 0) {
        // Delete selected stories and add to undo stack
        selectedStories.forEach(storyId => {
          // Find the story and its status to store in undo stack
          const story = stories.find(s => s.id === storyId);
          if (story) {
            setUndoStack(prev => [...prev, {
              type: 'delete',
              storyId,
              story: { ...story, status: story.status }
            }]);
          }
          deleteStory(storyId);
        });
        setSelectedStories([]);
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedStories, deleteStory, undoStack, storiesByStatus, addStory, updateStory, stories]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const storyId = active.id as string;
    const overId = over.id as string;

    // Find the target status
    const targetStatus = statusColumns.find(status => status.id === overId);
    if (targetStatus) {
      // Determine which stories to move
      const storiesToMove = selectedStories.includes(storyId) ? selectedStories : [storyId];
      
      // Update all selected stories to target status
      storiesToMove.forEach(id => {
        const story = stories.find(s => s.id === id);
        if (story && story.status !== targetStatus.id) {
          // Add to undo stack before updating
          setUndoStack(prev => [...prev, {
            type: 'move',
            storyId: id,
            previousColumnId: story.status
          }]);
          updateStory(id, { status: targetStatus.id as any });
        }
      });
    }
  };

  const handleStoryClick = (storyId: string, event: React.MouseEvent, storyList?: Story[], currentIndex?: number) => {
    if (event.ctrlKey && event.shiftKey && storyList && currentIndex !== undefined && lastSelectedIndex !== null) {
      // Range selection with Ctrl+Shift
      const rangeStoryIds = getStoriesInRange(storyList, lastSelectedIndex, currentIndex);
      setSelectedStories(prev => {
        const newSet = new Set(prev);
        rangeStoryIds.forEach(id => newSet.add(id));
        return Array.from(newSet);
      });
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-select with Ctrl/Cmd
      setSelectedStories(prev => 
        prev.includes(storyId) 
          ? prev.filter(id => id !== storyId)
          : [...prev, storyId]
      );
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    } else {
      // Single select
      setSelectedStories([storyId]);
      // Update last selected index for range selection
      if (storyList && currentIndex !== undefined) {
        setLastSelectedIndex(currentIndex);
      }
    }
  };

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
  };

  const activeStory = activeId ? stories.find(s => s.id === activeId) : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">Projects - Kanban Boards</h2>
            <p className="text-sm text-muted-foreground">
              Select a project to view and manage its stories in a Kanban board
            </p>
          </div>
          
          {/* Project Selector */}
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <Select
              value={selectedProjectId || ''}
              onValueChange={(projectId) => {
                setSelectedProjectId(projectId);
                setSelectedStories([]); // Clear selection when switching projects
              }}
            >
              <SelectTrigger className="w-full sm:w-64">
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
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {undoStack.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleUndo}
              className="gap-1"
            >
              <Undo className="h-3 w-3" />
              <span className="hidden sm:inline">Undo</span>
            </Button>
          )}
          {selectedStories.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedStories([])}
            >
              <span className="hidden sm:inline">Clear Selection</span>
              <span className="sm:hidden">Clear</span>
              <span className="ml-1">({selectedStories.length})</span>
            </Button>
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
              Select a project from the dropdown above to view its Kanban board
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
            <h3 className="font-semibold">{selectedProject.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedProject.description}</p>
            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{projectStories.length} stories</span>
              <span>Status: {selectedProject.status}</span>
            </div>
          </div>

          {/* Kanban Board */}
          <div className="min-h-[400px] sm:min-h-[600px]">
            <DndContext 
              onDragStart={handleDragStart} 
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4">
                {statusColumns.map((status) => (
                  <div key={status.id} className="min-w-0">
                    <KanbanColumn
                      column={{ id: status.id, name: status.name as "Icebox" | "Backlog" | "To Do" | "In Progress" | "Review" | "Done", storyIds: [] }}
                      stories={storiesByStatus[status.id] || []}
                      selectedStories={selectedStories}
                      onStoryClick={handleStoryClick}
                      onEditStory={handleEditStory}
                      projectId={selectedProject.id}
                    />
                  </div>
                ))}
              </div>

              <DragOverlay>
                {activeStory ? (
                  <div className="opacity-50">
                    {selectedStories.includes(activeStory.id) && selectedStories.length > 1 ? (
                      <div className="space-y-2">
                        <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          Moving {selectedStories.length} stories
                        </div>
                        <StoryCard story={activeStory} />
                      </div>
                    ) : (
                      <StoryCard story={activeStory} />
                    )}
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
    </div>
  );
}
