import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addStoryAtom, addStoryToProjectAtom, rolesAtom, visionsAtom, settingsAtom, safeSprintsAtom, currentSprintAtom, projectsAtom, storyPrioritiesAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { getWeightGradientColor } from '@/utils';
import type { Story, Priority, StoryType } from '@/types';

interface AddStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<Story>;
  targetColumnId?: string;
}

export function AddStoryModal({ open, onOpenChange, initialData, targetColumnId }: AddStoryModalProps) {
  const [, addStory] = useAtom(addStoryAtom);
  const [, addStoryToProject] = useAtom(addStoryToProjectAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [settings] = useAtom(settingsAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [currentSprint] = useAtom(currentSprintAtom);
  const [projects] = useAtom(projectsAtom);
  const [storyPriorities] = useAtom(storyPrioritiesAtom);

  // Use settings mirror system for story settings
  const storySettings = useStorySettings();


  const [formData, setFormData] = useState<Partial<Story>>({
    title: '',
    description: '',
    priority: undefined,
    weight: undefined,
    size: undefined,
    type: undefined,
    roleId: undefined,
    visionId: undefined,
    dueDate: undefined,
    sprintId: undefined,
    taskCategories: [],
    scheduledDate: undefined,
    location: undefined,
    goalId: undefined,
    status: (targetColumnId || 'backlog') as "icebox" | "backlog" | "todo" | "progress" | "review" | "done",
    ...initialData
  });

  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatEndDate, setRepeatEndDate] = useState<string>('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      return;
    }

    const storyData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || ''
    };
    
    
    if (repeatWeekly) {
      // Create stories for multiple sprints
      const selectedSprint = sprints.find(s => s.id === formData.sprintId) || currentSprint;
      if (selectedSprint) {
        const startSprintIndex = sprints.findIndex(s => s.id === selectedSprint.id);
        const endDate = repeatEndDate ? new Date(repeatEndDate) : null;
        
        let sprintIndex = startSprintIndex;
        while (sprintIndex < sprints.length) {
          const sprint = sprints[sprintIndex];
          
          // Check if we've reached the end date
          if (endDate && new Date(sprint.startDate) > endDate) {
            break;
          }
          
          // Create story for this sprint
          const weeklyStoryData = {
            ...storyData,
            sprintId: sprint.id,
            title: `${storyData.title} (Week ${sprint.isoWeek})`
          };
          
          const newStory = addStory(weeklyStoryData, formData.status);
          // Add to project if projectId is provided
          const projectId = initialData?.projectId || formData.projectId;
          if (projectId && newStory) {
            addStoryToProject(projectId, newStory.id);
          }
          sprintIndex++;
        }
      }
    } else {
      // Create single story
      const newStory = addStory(storyData, formData.status);
      // Add to project if projectId is provided
      const projectId = initialData?.projectId || formData.projectId;
      if (projectId && newStory) {
        addStoryToProject(projectId, newStory.id);
      }
    }
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      priority: 'Q1',
      weight: 1,
      size: 'M',
      type: 'Intellectual',
      roleId: undefined,
      visionId: undefined,
      dueDate: undefined,
      sprintId: undefined
    });
    setRepeatWeekly(false);
    setRepeatEndDate('');
    
    onOpenChange(false);
  };


  const priorities = storyPriorities.map(p => p.name as Priority);
  const weights = [1, 3, 5, 8, 13, 21];
  // Use story sizes from settings instead of hardcoded array

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Story</DialogTitle>
          <DialogDescription className="text-sm">
            Create a new story to track your tasks and goals.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title - First and most prominent */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter story title..."
              required
              className="text-lg"
            />
          </div>


          {/* Main Details Grid - 1 column on mobile, 2 columns on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority...">
                      {formData.priority && (() => {
                        const selectedPriority = storyPriorities.find(p => p.name === formData.priority);
                        return selectedPriority ? (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: selectedPriority.color }}
                            />
                            <div>
                              <div className="font-medium">{selectedPriority.name}</div>
                              <div className="text-xs text-muted-foreground">{selectedPriority.description}</div>
                            </div>
                          </div>
                        ) : formData.priority;
                      })()}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {storyPriorities.map(priority => (
                      <SelectItem key={priority.id} value={priority.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: priority.color }}
                          />
                          <div>
                            <div className="font-medium">{priority.name}</div>
                            <div className="text-xs text-muted-foreground">{priority.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Role */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={formData.roleId || 'none'}
                  onValueChange={(value) => {
                    const selectedRole = roles.find(role => role.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      roleId: value === 'none' ? undefined : value,
                      description: selectedRole ? `As a ${selectedRole.name} I need to` : prev.description
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: role.color }}
                          />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Type and Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: StoryType) => setFormData(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type...">
                        {formData.type && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: storySettings.getTypeColor(formData.type) }}
                            />
                            {formData.type}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {storySettings.storyTypes.map(type => (
                        <SelectItem key={type.name} value={type.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: type.color }}
                            />
                            {type.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={formData.status || 'backlog'}
                    onValueChange={(value) => {
                      setFormData(prev => ({ ...prev, status: value as any }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status...">
                        {formData.status && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ 
                                backgroundColor: settings.statusColors?.[formData.status] || '#6B7280'
                              }}
                            />
                            {formData.status === 'icebox' ? 'Icebox' :
                             formData.status === 'backlog' ? 'Backlog' :
                             formData.status === 'todo' ? 'To Do' :
                             formData.status === 'progress' ? 'In Progress' :
                             formData.status === 'review' ? 'Review' :
                             formData.status === 'done' ? 'Done' : formData.status}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="icebox">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: settings.statusColors?.icebox || '#6B7280' }}
                          ></div>
                          <span>Icebox</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="backlog">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: storySettings.getStatusColor('backlog') }}
                          ></div>
                          <span>Backlog</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="todo">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: storySettings.getStatusColor('todo') }}
                          ></div>
                          <span>To Do</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="progress">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: settings.statusColors?.progress || '#F97316' }}
                          ></div>
                          <span>In Progress</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="review">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: storySettings.getStatusColor('review') }}
                          ></div>
                          <span>Review</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="done">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: storySettings.getStatusColor('done') }}
                          ></div>
                          <span>Done</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Weight and Size in a row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight</label>
                  <Select
                    value={formData.weight?.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, weight: parseInt(value) as Story['weight'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select weight..." />
                    </SelectTrigger>
                    <SelectContent>
                      {weights.map(weight => {
                        const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor, 21);
                        return (
                          <SelectItem key={weight} value={weight.toString()}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded border"
                                style={{ backgroundColor: gradientColor }}
                              />
                              {weight}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <Select
                    value={formData.size}
                    onValueChange={(value: Story['size']) => setFormData(prev => ({ ...prev, size: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size...">
                        {formData.size && (
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: settings.storySizes?.find(s => s.name === formData.size)?.color || '#6B7280' }}
                            />
                            <span>{formData.size}</span>
                            {settings.storySizes?.find(s => s.name === formData.size)?.timeEstimate && (
                              <span className="text-muted-foreground text-xs">
                                ({settings.storySizes.find(s => s.name === formData.size)?.timeEstimate})
                              </span>
                            )}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(settings.storySizes || []).map(size => (
                        <SelectItem key={size.name} value={size.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: size.color }}
                            />
                            <span>{size.name}</span>
                            <span className="text-muted-foreground text-xs">({size.timeEstimate})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vision */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Vision</label>
                <Select
                  value={formData.visionId || 'none'}
                  onValueChange={(value) => {
                    const selectedVision = visions.find(v => v.id === value);
                    setFormData(prev => ({ 
                      ...prev, 
                      visionId: value === 'none' ? undefined : value,
                      type: selectedVision?.type || prev.type
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vision...">
                      {formData.visionId && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: settings.visionTypes?.find(vt => vt.name === visions.find(v => v.id === formData.visionId)?.type)?.color || '#6B7280'
                            }}
                          />
                          {visions.find(v => v.id === formData.visionId)?.title}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {visions.map(vision => (
                      <SelectItem key={vision.id} value={vision.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: settings.visionTypes?.find(vt => vt.name === vision.type)?.color || '#6B7280'
                            }}
                          />
                          {vision.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Project */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Project</label>
                <Select
                  value={formData.projectId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, projectId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project...">
                      {formData.projectId && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: storySettings.weightBaseColor }}
                          />
                          {projects.find(p => p.id === formData.projectId)?.name}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.length === 0 ? (
                      <SelectItem value="no-projects" disabled>
                        No projects available
                      </SelectItem>
                    ) : (
                      projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: storySettings.weightBaseColor }}
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
            </div>
            
            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter story description..."
                rows={3}
              />
            </div>

            {/* Sprint and Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sprint</label>
                <Select
                  value={formData.sprintId || 'none'}
                  onValueChange={(value) => {
                    setFormData(prev => ({ ...prev, sprintId: value === 'none' ? undefined : value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sprint</SelectItem>
                    {sprints.length === 0 ? (
                      <SelectItem value="no-sprints" disabled>
                        No sprints available
                      </SelectItem>
                    ) : (
                      sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">
                              Week {sprint.isoWeek} - {sprint.year}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Task Categories, Scheduled Date, Location, and Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Categories</label>
                <div className="space-y-2">
                  {(settings.taskCategories || []).map((category) => (
                    <div key={category.name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`category-${category.name}`}
                        checked={formData.taskCategories?.includes(category.name) || false}
                        onChange={(e) => {
                          const currentCategories = formData.taskCategories || [];
                          if (e.target.checked) {
                            setFormData(prev => ({ 
                              ...prev, 
                              taskCategories: [...currentCategories, category.name] 
                            }));
                          } else {
                            setFormData(prev => ({ 
                              ...prev, 
                              taskCategories: currentCategories.filter(c => c !== category.name) 
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <label 
                        htmlFor={`category-${category.name}`}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  value={formData.scheduledDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  type="text"
                  placeholder="Enter location..."
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Goal Associated</label>
                <Select
                  value={formData.goalId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, goalId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Goal</SelectItem>
                    {/* TODO: Add goals when available */}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Repeat Weekly */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="repeatWeekly"
                  checked={repeatWeekly}
                  onChange={(e) => setRepeatWeekly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="repeatWeekly" className="text-sm font-medium">
                  Repeat every week
                </label>
              </div>
              {repeatWeekly && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date (Optional)</label>
                  <Input
                    type="date"
                    value={repeatEndDate}
                    onChange={(e) => setRepeatEndDate(e.target.value)}
                    placeholder="Leave empty to repeat indefinitely"
                  />
                </div>
              )}
            </div>

            {/* Labels */}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title?.trim()} className="w-full sm:w-auto">
              Add Story
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
