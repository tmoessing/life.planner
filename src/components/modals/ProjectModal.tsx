import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAtom } from 'jotai';
import { addProjectAtom, updateProjectAtom, storiesAtom } from '@/stores/appStore';
import { useProjectSettings } from '@/utils/settingsMirror';
import type { Project } from '@/types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  mode: 'add' | 'edit';
}

export function ProjectModal({ isOpen, onClose, project, mode }: ProjectModalProps) {
  const [, addProject] = useAtom(addProjectAtom);
  const [, updateProject] = useAtom(updateProjectAtom);
  const [stories] = useAtom(storiesAtom);
  const projectSettings = useProjectSettings();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Icebox' as Project['status'],
    startDate: '',
    endDate: '',
    storyIds: [] as string[]
  });

  const [selectedStories, setSelectedStories] = useState<string[]>([]);

  useEffect(() => {
    if (mode === 'edit' && project) {
      setFormData({
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        storyIds: project.storyIds
      });
      setSelectedStories(project.storyIds);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Icebox',
        startDate: '',
        endDate: '',
        storyIds: []
      });
      setSelectedStories([]);
    }
  }, [mode, project, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      storyIds: selectedStories
    };

    if (mode === 'add') {
      addProject(submitData);
    } else if (mode === 'edit' && project) {
      updateProject(project.id, submitData);
    }

    onClose();
  };

  const handleStoryToggle = (storyId: string) => {
    setSelectedStories(prev => 
      prev.includes(storyId) 
        ? prev.filter(id => id !== storyId)
        : [...prev, storyId]
    );
  };

  const availableStories = stories.filter(story => !story.deleted);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Create a new project to organize and track your stories.'
              : 'Edit the project details and manage associated stories.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter project description"
              rows={3}
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Project['status']) => 
                setFormData(prev => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Icebox">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.getStatusColor('Icebox') }}
                    />
                    Icebox
                  </div>
                </SelectItem>
                <SelectItem value="Backlog">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.getStatusColor('Backlog') }}
                    />
                    Backlog
                  </div>
                </SelectItem>
                <SelectItem value="To do">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.getStatusColor('To do') }}
                    />
                    To do
                  </div>
                </SelectItem>
                <SelectItem value="In Progress">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.getStatusColor('In Progress') }}
                    />
                    In Progress
                  </div>
                </SelectItem>
                <SelectItem value="Done">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.getStatusColor('Done') }}
                    />
                    Done
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
          </div>

          {/* Stories Selection */}
          <div className="space-y-2">
            <Label>Stories</Label>
            <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
              {availableStories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No stories available
                </p>
              ) : (
                availableStories.map(story => (
                  <label
                    key={story.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStories.includes(story.id)}
                      onChange={() => handleStoryToggle(story.id)}
                      className="rounded"
                    />
                    <span className="text-sm flex-1">{story.title}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedStories.length} story{selectedStories.length !== 1 ? 's' : ''} selected
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Create Project' : 'Update Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
