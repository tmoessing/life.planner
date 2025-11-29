import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { addStoryAtom, addStoryToProjectAtom, rolesAtom, visionsAtom, goalsAtom, settingsAtom, safeSprintsAtom, projectsAtom, storyPrioritiesAtom } from '@/stores/appStore';
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
  const [goals] = useAtom(goalsAtom);
  const [settings] = useAtom(settingsAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [projects] = useAtom(projectsAtom);
  const [storyPriorities] = useAtom(storyPrioritiesAtom);

  // Use settings mirror system for story settings
  const storySettings = useStorySettings();


  const [formData, setFormData] = useState<Partial<Story>>(() => ({
    title: '',
    description: '',
    priority: undefined,
    weight: undefined,
    size: undefined,
    type: undefined,
    roleId: undefined,
    visionId: undefined,
    dueDate: undefined,
    sprintId: initialData?.sprintId,
    taskCategories: [],
    scheduledDate: undefined,
    location: undefined,
    goalId: undefined,
    status: (initialData?.status || targetColumnId || 'backlog') as "icebox" | "backlog" | "todo" | "progress" | "review" | "done",
    ...initialData
  }));

  // Update form data when modal opens with new initialData
  useEffect(() => {
    if (open) {
      // Merge initialData properly - ensure sprintId and status from initialData take precedence
      const mergedData = {
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
      };
      setFormData(mergedData);
      // Reset recurrence state
      setHasRecurrence(false);
      setRecurrenceCadence('weekly');
      setRecurrenceInterval(1);
      setRecurrenceWeekOfMonth('any');
      setRecurrenceEndDate('');
      setRecurrenceCount('');
      setRecurrenceEndType('never');
    }
  }, [open, initialData, targetColumnId]);

  // Recurrence state
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrenceCadence, setRecurrenceCadence] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceWeekOfMonth, setRecurrenceWeekOfMonth] = useState<'first' | 'second' | 'third' | 'fourth' | 'last' | 'any'>('any');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('');
  const [recurrenceCount, setRecurrenceCount] = useState<number | ''>('');
  const [recurrenceEndType, setRecurrenceEndType] = useState<'date' | 'count' | 'never'>('never');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim()) {
      return;
    }

    // Require sprint selection for recurring stories
    if (hasRecurrence && !formData.sprintId) {
      alert('Please select a sprint for recurring stories.');
      return;
    }

    const storyData = {
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || '',
      // Add recurrence data if enabled
      repeat: hasRecurrence ? {
        cadence: recurrenceCadence,
        interval: recurrenceInterval,
        endDate: recurrenceEndType === 'date' ? recurrenceEndDate : undefined,
        count: recurrenceEndType === 'count' ? (typeof recurrenceCount === 'number' ? recurrenceCount : undefined) : undefined,
        weekOfMonth: recurrenceWeekOfMonth === 'any' ? undefined : recurrenceWeekOfMonth,
        instances: {}
      } : undefined
    };
    
    // Create single story with recurrence metadata
    const newStory = addStory(storyData, formData.status);
    // Add to project if projectId is provided
    const projectId = initialData?.projectId || formData.projectId;
    if (projectId && newStory) {
      addStoryToProject(projectId, newStory.id);
    }
    
    // Reset form
    setFormData({
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
    });
    
    // Reset recurrence state
    setHasRecurrence(false);
    setRecurrenceCadence('weekly');
    setRecurrenceInterval(1);
    setRecurrenceWeekOfMonth('any');
    setRecurrenceEndDate('');
    setRecurrenceCount('');
    setRecurrenceEndType('never');
    
    onOpenChange(false);
  };


  const weights = [1, 3, 5, 8, 13, 21];
  // Use story sizes from settings instead of hardcoded array

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader className="pb-1 sm:pb-4">
          <DialogTitle className="text-sm sm:text-xl">Add New Story</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm hidden sm:block">
            Create a new story to track your tasks and goals.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-6">
          {/* Title - First and most prominent */}
          <div className="space-y-1 sm:space-y-2">
            <label className="text-xs sm:text-sm font-medium">Title *</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter story title..."
              required
              className="text-sm sm:text-lg h-8 sm:h-auto"
            />
          </div>


          {/* Main Details Grid - 1 column on mobile, 2 columns on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-6">
            {/* Left Column */}
            <div className="space-y-1.5 sm:space-y-4">
              {/* Priority */}
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Priority</label>
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
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Role</label>
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
              <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Type</label>
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

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Status</label>
                  <Select
                    value={formData.status || (formData.sprintId ? 'todo' : 'backlog')}
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
                      {/* Only show icebox/backlog if story is not assigned to a sprint */}
                      {!formData.sprintId && (
                        <SelectItem value="icebox">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: settings.statusColors?.icebox || '#6B7280' }}
                            ></div>
                            <span>Icebox</span>
                          </div>
                        </SelectItem>
                      )}
                      {!formData.sprintId && (
                        <SelectItem value="backlog">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: storySettings.getStatusColor('backlog') }}
                            ></div>
                            <span>Backlog</span>
                          </div>
                        </SelectItem>
                      )}
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
            <div className="space-y-1.5 sm:space-y-4">
              {/* Weight and Size in a row */}
              <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Weight</label>
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

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Size</label>
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
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Vision</label>
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
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Project</label>
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
          <div className="space-y-1.5 sm:space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:block">Additional Details</h3>
            </div>
            
            {/* Description */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter story description..."
                rows={3}
              />
            </div>

            {/* Sprint and Due Date */}
            <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Sprint</label>
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

              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            {/* Task Categories, Scheduled Date, Location, and Goal */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Task Categories</label>
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

              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Scheduled Date</label>
                <Input
                  type="date"
                  value={formData.scheduledDate || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Location</label>
                <Input
                  type="text"
                  placeholder="Enter location..."
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div className="space-y-1 sm:space-y-2">
                <label className="text-xs sm:text-sm font-medium">Goal Associated</label>
                <Select
                  value={formData.goalId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, goalId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select goal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Goal</SelectItem>
                    {goals.filter(goal => goal.status === 'todo' || goal.status === 'in-progress').map(goal => (
                      <SelectItem key={goal.id} value={goal.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: settings.storyTypes?.find(st => st.name === goal.goalType)?.color || '#6B7280'
                            }}
                          />
                          {goal.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recurrence Pattern Section */}
            <div className="space-y-1.5 sm:space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasRecurrence"
                  checked={hasRecurrence}
                  onCheckedChange={(checked) => setHasRecurrence(checked as boolean)}
                />
                <label htmlFor="hasRecurrence" className="text-xs sm:text-sm font-medium">
                  Repeat this story
                </label>
              </div>
              
            {hasRecurrence && (
              <div className="space-y-1.5 sm:space-y-4 pl-3 sm:pl-6 border-l-2 border-gray-200">
                {/* Sprint requirement warning */}
                {!formData.sprintId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 text-yellow-600">⚠️</div>
                      <p className="text-sm text-yellow-800">
                        A sprint must be selected for recurring stories to generate instances within the sprint timeframe.
                      </p>
                    </div>
                  </div>
                )}
                  {/* Cadence selector */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Repeat</label>
                    <Select
                      value={recurrenceCadence}
                      onValueChange={(value: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly') => setRecurrenceCadence(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Interval */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Every</label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="1"
                        value={recurrenceInterval}
                        onChange={(e) => setRecurrenceInterval(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">
                        {recurrenceCadence === 'daily' ? 'day(s)' :
                         recurrenceCadence === 'weekly' || recurrenceCadence === 'biweekly' ? 'week(s)' :
                         recurrenceCadence === 'monthly' ? 'month(s)' :
                         recurrenceCadence === 'yearly' ? 'year(s)' : 'time(s)'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Week of month selector (shown when cadence is monthly) */}
                  {recurrenceCadence === 'monthly' && (
                    <div className="space-y-1 sm:space-y-2">
                      <label className="text-xs sm:text-sm font-medium">Week of month</label>
                      <Select
                        value={recurrenceWeekOfMonth}
                        onValueChange={(value: 'first' | 'second' | 'third' | 'fourth' | 'last' | 'any') => setRecurrenceWeekOfMonth(value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any week" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any week</SelectItem>
                          <SelectItem value="first">First complete week</SelectItem>
                          <SelectItem value="second">Second complete week</SelectItem>
                          <SelectItem value="third">Third complete week</SelectItem>
                          <SelectItem value="fourth">Fourth complete week</SelectItem>
                          <SelectItem value="last">Last complete week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  
                  {/* End condition */}
                  <div className="space-y-1 sm:space-y-2">
                    <label className="text-xs sm:text-sm font-medium">Ends</label>
                    <div className="space-y-1 sm:space-y-2">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="endNever"
                          name="endType"
                          checked={recurrenceEndType === 'never'}
                          onChange={() => setRecurrenceEndType('never')}
                        />
                        <label htmlFor="endNever" className="text-sm">Never</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="endDate"
                          name="endType"
                          checked={recurrenceEndType === 'date'}
                          onChange={() => setRecurrenceEndType('date')}
                        />
                        <label htmlFor="endDate" className="text-sm">On date</label>
                        {recurrenceEndType === 'date' && (
                          <Input
                            type="date"
                            value={recurrenceEndDate}
                            onChange={(e) => setRecurrenceEndDate(e.target.value)}
                            className="ml-2"
                          />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="endCount"
                          name="endType"
                          checked={recurrenceEndType === 'count'}
                          onChange={() => setRecurrenceEndType('count')}
                        />
                        <label htmlFor="endCount" className="text-sm">After</label>
                        {recurrenceEndType === 'count' && (
                          <Input
                            type="number"
                            min="1"
                            value={recurrenceCount}
                            onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || '')}
                            className="ml-2 w-20"
                          />
                        )}
                        {recurrenceEndType === 'count' && (
                          <span className="text-sm text-muted-foreground">occurrences</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Labels */}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-1.5 sm:gap-2 pt-1.5 sm:pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              size="sm"
              className="w-full sm:w-auto h-8 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.title?.trim() || (hasRecurrence && !formData.sprintId)} 
              size="sm"
              className="w-full sm:w-auto h-8 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
            >
              Add Story
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
