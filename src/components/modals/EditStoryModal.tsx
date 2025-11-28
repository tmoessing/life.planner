import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { updateStoryAtom, deleteStoryAtom, rolesAtom, visionsAtom, goalsAtom, settingsAtom, safeSprintsAtom, projectsAtom, labelsAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { getWeightGradientColor } from '@/utils';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import type { Story, Priority, StoryType, RecurrenceEditMode } from '@/types';

interface EditStoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  story: Story | null;
}

export function EditStoryModal({ open, onOpenChange, story }: EditStoryModalProps) {
  const [, updateStory] = useAtom(updateStoryAtom);
  const [, deleteStory] = useAtom(deleteStoryAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [goals] = useAtom(goalsAtom);
  const [settings] = useAtom(settingsAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [projects] = useAtom(projectsAtom);
  const [labels] = useAtom(labelsAtom);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Use settings mirror system for story settings
  const storySettings = useStorySettings();

  const [formData, setFormData] = useState<Partial<Story>>({});
  
  // Recurrence edit state
  const [editMode, setEditMode] = useState<RecurrenceEditMode>('this');
  const [hasRecurrence, setHasRecurrence] = useState(false);
  const [recurrenceCadence, setRecurrenceCadence] = useState<'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly'>('weekly');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceWeekOfMonth, setRecurrenceWeekOfMonth] = useState<'first' | 'second' | 'third' | 'fourth' | 'last' | 'any'>('any');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<string>('');
  const [recurrenceCount, setRecurrenceCount] = useState<number | ''>('');
  const [recurrenceEndType, setRecurrenceEndType] = useState<'date' | 'count' | 'never'>('never');

  // Update form data when story changes
  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        description: story.description,
        priority: story.priority,
        weight: story.weight,
        size: story.size,
        type: story.type,
        labels: story.labels || [],
        roleId: story.roleId,
        visionId: story.visionId,
        projectId: story.projectId,
        dueDate: story.dueDate,
        status: story.status,
        sprintId: story.sprintId,
        taskCategories: story.taskCategories || [],
        scheduledDate: story.scheduledDate,
        location: story.location,
        goalId: story.goalId,
      });
      
      // Initialize recurrence state
      if (story.repeat && story.repeat.cadence !== 'none') {
        setHasRecurrence(true);
        setRecurrenceCadence(story.repeat.cadence as 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly');
        setRecurrenceInterval(story.repeat.interval || 1);
        setRecurrenceWeekOfMonth(story.repeat.weekOfMonth || 'any');
        setRecurrenceEndDate(story.repeat.endDate || '');
        setRecurrenceCount(story.repeat.count || '');
        setRecurrenceEndType(story.repeat.endDate ? 'date' : story.repeat.count ? 'count' : 'never');
      } else {
        setHasRecurrence(false);
        setRecurrenceCadence('weekly');
        setRecurrenceInterval(1);
        setRecurrenceWeekOfMonth('any');
        setRecurrenceEndDate('');
        setRecurrenceCount('');
        setRecurrenceEndType('never');
      }
    }
  }, [story]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!story || !formData.title?.trim()) {
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
      // Update recurrence data if enabled
      repeat: hasRecurrence ? {
        cadence: recurrenceCadence,
        interval: recurrenceInterval,
        endDate: recurrenceEndType === 'date' ? recurrenceEndDate : undefined,
        count: recurrenceEndType === 'count' ? (typeof recurrenceCount === 'number' ? recurrenceCount : undefined) : undefined,
        weekOfMonth: recurrenceWeekOfMonth === 'any' ? undefined : recurrenceWeekOfMonth,
        instances: story.repeat?.instances || {}
      } : undefined
    };
    
    // Handle different edit modes for recurring stories
    if (story.repeat && story.repeat.cadence !== 'none' && editMode !== 'all') {
      // For recurring stories, we need special handling
      // This will be implemented when we update the story service
      updateStory(story.id, storyData);
    } else {
      // Normal update for non-recurring stories or "all" mode
      updateStory(story.id, storyData);
    }
    
    onOpenChange(false);
  };

  const handleLabelToggle = (labelId: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels?.includes(labelId)
        ? prev.labels.filter(id => id !== labelId)
        : [...(prev.labels || []), labelId]
    }));
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (!story) return;
    deleteStory(story.id);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  const priorities: Priority[] = ['Q1', 'Q2', 'Q3', 'Q4'];
  // Use story sizes from settings instead of hardcoded array

  if (!story) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
          <DialogHeader>
            <DialogTitle>Edit Story</DialogTitle>
            <DialogDescription>
              Update the story details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title - First and most prominent */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter story title..."
              required
              className="text-lg"
            />
          </div>


          {/* Main Details Grid - 2 columns for better square layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Left Column */}
            <div className="space-y-2">
              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {formData.priority && (
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ 
                              backgroundColor: storySettings.getPriorityColor(formData.priority)
                            }}
                          />
                          {formData.priority === 'Q1' ? 'Q1 - Urgent & Important' :
                           formData.priority === 'Q2' ? 'Q2 - Not Urgent & Important' :
                           formData.priority === 'Q3' ? 'Q3 - Urgent & Not Important' :
                           formData.priority === 'Q4' ? 'Q4 - Not Urgent & Not Important' : formData.priority}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {priorities.map(priority => {
                      const getPriorityLabel = (p: Priority) => {
                        switch (p) {
                          case 'Q1':
                            return 'Q1 - Urgent & Important';
                          case 'Q2':
                            return 'Q2 - Not Urgent & Important';
                          case 'Q3':
                            return 'Q3 - Urgent & Not Important';
                          case 'Q4':
                            return 'Q4 - Not Urgent & Not Important';
                          default:
                            return p;
                        }
                      };
                      
                      const getPriorityColor = (p: Priority) => {
                        switch (p) {
                          case 'Q1':
                            return storySettings.getPriorityColor('Q1');
                          case 'Q2':
                            return storySettings.getPriorityColor('Q2');
                          case 'Q3':
                            return storySettings.getPriorityColor('Q3');
                          case 'Q4':
                            return storySettings.getPriorityColor('Q4');
                          default:
                            return storySettings.getPriorityColor('Q4');
                        }
                      };
                      
                      return (
                        <SelectItem key={priority} value={priority}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: getPriorityColor(priority) }}
                            />
                            {getPriorityLabel(priority)}
                          </div>
                        </SelectItem>
                      );
                    })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="space-y-2">
              {/* Weight and Size in a row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Weight</label>
                  <Select
                    value={formData.weight?.toString()}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, weight: parseInt(value) as Story['weight'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 3, 5, 8, 13, 21].map(weight => {
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
                      <SelectValue>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-muted-foreground">Additional Details</h3>
            </div>
            
            {/* Description */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter story description..."
                rows={3}
              />
            </div>

            {/* Sprint and Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Sprint</label>
                <Select
                  value={formData.sprintId || 'none'}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, sprintId: value === 'none' ? undefined : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sprint..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sprint</SelectItem>
                    {sprints.map((sprint) => (
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
                    ))}
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

            {/* Labels */}
            {labels.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Labels</label>
                <div className="flex flex-wrap gap-2">
                  {labels.map(label => (
                    <Badge
                      key={label.id}
                      variant={formData.labels?.includes(label.id) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => handleLabelToggle(label.id)}
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Task Categories, Scheduled Date, Location, and Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Task Categories</label>
                <div className="space-y-2">
                  {(settings.taskCategories || []).map((category) => (
                    <div key={category.name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`task-category-${category.name}`}
                        checked={formData.taskCategories?.includes(category.name) || false}
                        onChange={(e) => {
                          const newCategories = e.target.checked
                            ? [...(formData.taskCategories || []), category.name]
                            : (formData.taskCategories || []).filter(cat => cat !== category.name);
                          setFormData(prev => ({ ...prev, taskCategories: newCategories }));
                        }}
                        className="rounded border-gray-300"
                      />
                      <label 
                        htmlFor={`task-category-${category.name}`}
                        className="text-sm flex items-center gap-2 cursor-pointer"
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
          </div>

          {/* Recurrence Pattern Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasRecurrence"
                checked={hasRecurrence}
                onCheckedChange={(checked) => setHasRecurrence(checked as boolean)}
              />
              <label htmlFor="hasRecurrence" className="text-sm font-medium">
                Repeat this story
              </label>
            </div>
            
            {hasRecurrence && (
              <div className="space-y-2 pl-4 border-l-2 border-gray-200">
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
                {/* Edit mode selector for existing recurring stories */}
                {story?.repeat && story.repeat.cadence !== 'none' && (
                  <div className="bg-blue-50 p-2 rounded-lg">
                    <p className="text-sm font-medium mb-2">Edit Recurrence</p>
                    <Select
                      value={editMode}
                      onValueChange={(value: RecurrenceEditMode) => setEditMode(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="this">Only this occurrence</SelectItem>
                        <SelectItem value="future">This and future occurrences</SelectItem>
                        <SelectItem value="all">All occurrences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {/* Cadence selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Repeat</label>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Every</label>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Week of month</label>
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
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ends</label>
                  <div className="space-y-2">
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

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleDeleteClick}
              className="gap-2 w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={!formData.title?.trim() || (hasRecurrence && !formData.sprintId)}
                className="w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
              >
                Update Story
              </Button>
            </div>
          </div>

          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Story"
        itemName={story?.title}
        description="This will permanently delete the story and cannot be undone."
      />
    </>
  );
}
