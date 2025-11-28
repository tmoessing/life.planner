import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import { useAtom } from 'jotai';
import { addProjectAtom, updateProjectAtom, storiesAtom } from '@/stores/appStore';
import { projectStatusesAtom } from '@/stores/statusStore';
import { useProjectSettings } from '@/utils/settingsMirror';
import { useProjectForm } from '@/hooks/useProjectForm';
import type { Project, Priority } from '@/types';

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
  const [projectStatuses] = useAtom(projectStatusesAtom);
  const projectSettings = useProjectSettings();

  const {
    formData,
    selectedStories,
    storySearchQuery,
    setStorySearchQuery,
    updateFormField,
    handleStoryToggle,
    getSubmitData
  } = useProjectForm({
    project,
    mode,
    projectStatuses,
    onClose
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = getSubmitData();

    if (mode === 'add') {
      addProject(submitData);
    } else if (mode === 'edit' && project) {
      updateProject(project.id, submitData);
    }

    onClose();
  };

  const availableStories = stories.filter(story => !story.deleted);
  
  // Filter stories based on search query
  const filteredStories = storySearchQuery
    ? availableStories.filter(story =>
        story.title.toLowerCase().includes(storySearchQuery.toLowerCase())
      )
    : availableStories;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader className="pb-1 sm:pb-4">
          <DialogTitle className="text-sm sm:text-xl">
            {mode === 'add' ? 'Create New Project' : 'Edit Project'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm hidden sm:block">
            {mode === 'add' 
              ? 'Create a new project to organize and track your stories.'
              : 'Edit the project details and manage associated stories.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-6">
          {/* Project Name */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormField('name', e.target.value)}
              placeholder="Enter project name"
              required
              className="touch-target h-8 sm:h-auto"
            />
          </div>

          {/* Description */}
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="description" className="text-xs sm:text-sm">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              placeholder="Enter project description"
              rows={1}
              className="touch-target text-sm"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="status" className="text-xs sm:text-sm">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: Project['status']) => updateFormField('status', value)}
            >
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projectStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.name} className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      {status.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="priority" className="text-xs sm:text-sm">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: Priority) => updateFormField('priority', value)}
            >
              <SelectTrigger className="touch-target">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high" className="touch-target min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.priorityColors?.high || '#EF4444' }}
                    />
                    High
                  </div>
                </SelectItem>
                <SelectItem value="medium" className="touch-target min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.priorityColors?.medium || '#F59E0B' }}
                    />
                    Medium
                  </div>
                </SelectItem>
                <SelectItem value="low" className="touch-target min-h-[44px]">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: projectSettings.priorityColors?.low || '#6B7280' }}
                    />
                    Low
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Project Type */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="type" className="text-xs sm:text-sm">Project Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => updateFormField('type', value)}
            >
              <SelectTrigger className="touch-target">
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                {(projectSettings.projectTypes || []).map((type) => (
                  <SelectItem key={type.name} value={type.name} className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Size */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="size" className="text-xs sm:text-sm">Project Size</Label>
            <Select
              value={formData.size}
              onValueChange={(value) => updateFormField('size', value)}
            >
              <SelectTrigger className="touch-target">
                <SelectValue placeholder="Select project size" />
              </SelectTrigger>
              <SelectContent>
                {(projectSettings.projectSizes || []).map((size) => (
                  <SelectItem key={size.name} value={size.name} className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: size.color }}
                      />
                      {size.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="startDate" className="text-xs sm:text-sm">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => updateFormField('startDate', e.target.value)}
                className="touch-target"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="endDate" className="text-xs sm:text-sm">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => updateFormField('endDate', e.target.value)}
                className="touch-target"
              />
            </div>
          </div>

          {/* Stories Selection */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Stories</Label>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search stories..."
                value={storySearchQuery}
                onChange={(e) => setStorySearchQuery(e.target.value)}
                className="pl-10 text-sm touch-target"
              />
            </div>
            <div className="max-h-40 sm:max-h-60 overflow-y-auto border rounded-md p-2 space-y-1 mobile-scroll">
              {availableStories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No stories available
                </p>
              ) : filteredStories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No stories match your search
                </p>
              ) : (
                filteredStories.map(story => (
                  <label
                    key={story.id}
                    className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 sm:p-2 rounded touch-target min-h-[44px]"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStories.includes(story.id)}
                      onChange={() => handleStoryToggle(story.id)}
                      className="rounded w-4 h-4 sm:w-4 sm:h-4"
                    />
                    <span className="text-sm flex-1">{story.title}</span>
                  </label>
                ))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedStories.length} story{selectedStories.length !== 1 ? 's' : ''} selected
              {storySearchQuery && filteredStories.length !== availableStories.length && (
                <span className="ml-2">
                  ({filteredStories.length} of {availableStories.length} shown)
                </span>
              )}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-1.5 sm:gap-2 pt-1.5 sm:pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              size="sm"
              className="w-full sm:w-auto touch-target h-8 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              size="sm"
              className="w-full sm:w-auto touch-target h-8 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
            >
              {mode === 'add' ? 'Create Project' : 'Update Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
