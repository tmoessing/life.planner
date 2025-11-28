import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  currentSprintAtom, 
  safeSprintsAtom,
  selectedSprintIdAtom,
  storiesAtom,
  addStoryAtom,
  addStoryToProjectAtom,
  rolesAtom,
  labelsAtom,
  settingsAtom,
  visionsAtom,
  goalsAtom,
  projectsAtom,
  storyPrioritiesAtom
} from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Weight, 
  Target,
  Save,
  X
} from 'lucide-react';
import { getWeightGradientColor } from '@/utils/color';
import type { Story } from '@/types';

interface StoryFormData {
  title: string;
  description: string;
  priority: string;
  type: string;
  size: string;
  weight: number;
  roleId?: string;
  location?: string;
  sprintId?: string;
  labels: string[];
  status: string;
  visionId?: string;
  projectId?: string;
  dueDate?: string;
  taskCategories: string[];
  scheduledDate?: string;
  goalId?: string;
}

const defaultStory: StoryFormData = {
  title: '',
  description: '',
  priority: 'Q4',
  type: 'none',
  size: 'none',
  weight: 0,
  roleId: undefined,
  location: '',
  sprintId: undefined,
  labels: [],
  status: 'backlog',
  visionId: undefined,
  projectId: undefined,
  dueDate: undefined,
  taskCategories: [],
  scheduledDate: undefined,
  goalId: undefined
};

export function AddStoriesView() {
  const [currentSprint] = useAtom(currentSprintAtom);
  const [sprints] = useAtom(safeSprintsAtom);
  const [selectedSprintId] = useAtom(selectedSprintIdAtom);
  const [stories] = useAtom(storiesAtom);
  const [, addStory] = useAtom(addStoryAtom);
  const [, addStoryToProject] = useAtom(addStoryToProjectAtom);
  const [roles] = useAtom(rolesAtom);
  const [labels] = useAtom(labelsAtom);
  const [settings] = useAtom(settingsAtom);
  const [visions] = useAtom(visionsAtom);
  const [goals] = useAtom(goalsAtom);
  const [projects] = useAtom(projectsAtom);
  const [storyPriorities] = useAtom(storyPrioritiesAtom);

  // Use settings mirror system for story settings
  const storySettings = useStorySettings();
  
  // Debug: Log projects to see what's available
  
  const [storyForms, setStoryForms] = useState<StoryFormData[]>([{ ...defaultStory }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<{row: number, field: string} | null>(null);
  const [localSelectedSprintId, setLocalSelectedSprintId] = useState<string>('unassigned');
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null }>({});
  
  // Default options for bulk editing
  const [defaultOptions, setDefaultOptions] = useState({
    priority: 'none',
    type: 'none',
    size: 'none',
    weight: 'none',
    roleId: 'none',
    visionId: 'none',
    projectId: 'none',
    goalId: 'none',
    status: 'none',
    location: '',
    dueDate: '',
    scheduledDate: ''
  });

  // Get the selected sprint - use local selection or fall back to global selection or current sprint
  const selectedSprint = localSelectedSprintId === 'unassigned' ? null : 
    sprints.find(sprint => sprint.id === (localSelectedSprintId || selectedSprintId)) || currentSprint;

  const addNewStoryForm = () => {
    // Create new story with default options applied
    const newStory = { ...defaultStory };
    
    // Apply default options if they're not 'none' (or empty for text/date fields)
    Object.entries(defaultOptions).forEach(([key, value]) => {
      if (key === 'location' || key === 'dueDate' || key === 'scheduledDate') {
        // For text/date fields, apply if not empty
        if (value && value.trim() !== '') {
          (newStory as any)[key] = value;
        }
      } else if (value !== 'none') {
        // For other fields, apply if not 'none'
        (newStory as any)[key] = value;
      }
    });
    
    setStoryForms(prev => [...prev, newStory]);
    // Focus on the title field of the new row
    setTimeout(() => {
      const newRowIndex = storyForms.length;
      const titleField = fieldRefs.current[`${newRowIndex}-title`];
      if (titleField) {
        titleField.focus();
      }
    }, 100);
  };

  const handleDefaultOptionChange = (field: keyof typeof defaultOptions, value: string) => {
    setDefaultOptions(prev => ({ ...prev, [field]: value }));
    
    // Apply the default to all existing stories
    if (field === 'location' || field === 'dueDate' || field === 'scheduledDate') {
      // For text/date fields, apply the value directly
      setStoryForms(prev => prev.map(story => ({
        ...story,
        [field]: value
      })));
    } else if (value !== 'none') {
      // For other fields, only apply if not 'none'
      setStoryForms(prev => prev.map(story => ({
        ...story,
        [field]: value
      })));
    }
  };

  const removeStoryForm = (index: number) => {
    if (storyForms.length > 1) {
      setStoryForms(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateStoryForm = (index: number, field: keyof StoryFormData, value: any) => {
    setStoryForms(prev => prev.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldName === 'title' && storyForms[rowIndex].title.trim()) {
        addNewStoryForm();
      } else {
        moveToNextField(rowIndex, fieldName);
      }
    } else if (e.key === 'Tab') {
      if (fieldName === 'description') {
        // Allow normal tab behavior for description (textarea)
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      // Immediately focus the next field
      moveToNextField(rowIndex, fieldName);
    }
  };

  const handleSelectBlur = (rowIndex: number, fieldName: string) => {
    // Small delay to allow for any dropdown interactions
    setTimeout(() => {
      moveToNextField(rowIndex, fieldName);
    }, 100);
  };

  const handleSelectFocus = (rowIndex: number, fieldName: string) => {
    // Store the current field for potential tab navigation
    setFocusedField({ row: rowIndex, field: fieldName });
  };

  const moveToNextField = (currentRow: number, currentField: string) => {
    const fieldOrder = ['title', 'description', 'priority', 'type', 'size', 'weight', 'role', 'location', 'status', 'vision', 'project', 'dueDate', 'scheduledDate', 'goal'];
    const currentIndex = fieldOrder.indexOf(currentField);
    
    if (currentIndex < fieldOrder.length - 1) {
      // Move to next field in same row
      const nextField = fieldOrder[currentIndex + 1];
      const nextFieldRef = fieldRefs.current[`${currentRow}-${nextField}`];
      if (nextFieldRef) {
        nextFieldRef.focus();
      }
    } else {
      // Move to first field of next row, or create new row if at last row
      if (currentRow < storyForms.length - 1) {
        const nextRowRef = fieldRefs.current[`${currentRow + 1}-title`];
        if (nextRowRef) {
          nextRowRef.focus();
        }
      } else {
        // Create new row and focus on it
        addNewStoryForm();
      }
    }
  };

  const getFieldRef = (rowIndex: number, fieldName: string) => {
    const key = `${rowIndex}-${fieldName}`;
    return (ref: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => {
      fieldRefs.current[key] = ref;
    };
  };

  // Handle Ctrl+Enter keyboard shortcut and global tab navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (!isSubmitting && storyForms.some(form => form.title.trim() !== '')) {
          handleSubmit();
        }
      } else if (e.key === 'Tab') {
        // Check if we're currently focused on a Select component
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('[role="combobox"]')) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find which field we're on and move to the next one
          const fieldOrder = ['title', 'description', 'priority', 'type', 'size', 'weight', 'role', 'location', 'status', 'vision', 'project', 'dueDate', 'scheduledDate', 'goal'];
          
          // Try to determine which field we're on based on the active element
          let currentField = 'priority'; // default fallback
          if (activeElement.closest('[data-field="priority"]')) currentField = 'priority';
          else if (activeElement.closest('[data-field="type"]')) currentField = 'type';
          else if (activeElement.closest('[data-field="size"]')) currentField = 'size';
          else if (activeElement.closest('[data-field="weight"]')) currentField = 'weight';
          else if (activeElement.closest('[data-field="role"]')) currentField = 'role';
          else if (activeElement.closest('[data-field="status"]')) currentField = 'status';
          else if (activeElement.closest('[data-field="vision"]')) currentField = 'vision';
          else if (activeElement.closest('[data-field="project"]')) currentField = 'project';
          else if (activeElement.closest('[data-field="goal"]')) currentField = 'goal';
          
          // Find the row index
          const rowElement = activeElement.closest('tr');
          const rowIndex = rowElement ? Array.from(rowElement.parentNode?.children || []).indexOf(rowElement) - 1 : 0; // -1 because of header row
          
          if (rowIndex >= 0 && rowIndex < storyForms.length) {
            moveToNextField(rowIndex, currentField);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, storyForms]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const validStories = storyForms.filter(story => story.title.trim() !== '');
      
      for (const storyData of validStories) {
        const newStory: Omit<Story, 'id' | 'createdAt' | 'updatedAt'> = {
          title: storyData.title.trim(),
          description: storyData.description.trim(),
          priority: storyData.priority as any,
          type: storyData.type as any,
          size: storyData.size as any,
          weight: storyData.weight as 1 | 3 | 5 | 8 | 13 | 21,
          roleId: storyData.roleId,
          location: storyData.location?.trim() || undefined,
          sprintId: storyData.sprintId || (localSelectedSprintId === 'unassigned' ? undefined : (localSelectedSprintId || selectedSprintId)) || selectedSprint?.id,
          labels: storyData.labels,
          status: storyData.status as any,
          visionId: storyData.visionId,
          projectId: storyData.projectId,
          dueDate: storyData.dueDate,
          taskCategories: storyData.taskCategories,
          scheduled: storyData.scheduledDate,
          goalId: storyData.goalId,
          checklist: [],
        };
        
        const createdStory = await addStory(newStory);
        
        // Add to project if projectId is provided
        if (storyData.projectId && createdStory) {
          addStoryToProject(storyData.projectId, createdStory.id);
        }
      }
      
      // Reset forms
      setStoryForms([{ ...defaultStory }]);
      
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors = settings.priorityColors || {};
    return {
      backgroundColor: `${priorityColors[priority as keyof typeof priorityColors] || '#6B7280'}20`,
      color: priorityColors[priority as keyof typeof priorityColors] || '#6B7280',
      borderColor: `${priorityColors[priority as keyof typeof priorityColors] || '#6B7280'}40`
    };
  };

  const getStoryTypeColor = (type: string) => {
    const storyType = settings.storyTypes?.find(st => st.name === type);
    const typeColor = storyType?.color || '#6B7280';
    return {
      backgroundColor: `${typeColor}20`,
      color: typeColor,
      borderColor: `${typeColor}40`
    };
  };

  const getStorySizeColor = (size: string) => {
    const sizeConfig = settings.storySizes?.find(ss => ss.name === size);
    const sizeColor = sizeConfig?.color || '#6B7280';
    return {
      backgroundColor: `${sizeColor}20`,
      color: sizeColor,
      borderColor: `${sizeColor}40`
    };
  };

  return (
    <div className="space-y-2 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-2xl font-bold">Add Stories</h2>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Batch add multiple stories to your sprint
          </p>
        </div>
        
        <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={addNewStoryForm}
            size="sm"
            className="gap-1 sm:gap-2 flex-1 sm:flex-initial touch-target h-9 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm px-2 sm:px-4"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Add Story</span>
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || storyForms.every(form => form.title.trim() === '')}
            size="sm"
            className="gap-1 sm:gap-2 flex-1 sm:flex-initial touch-target h-9 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm px-2 sm:px-4"
            title="Add stories (Ctrl+Enter)"
          >
            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              {isSubmitting ? 'Adding...' : `Add ${storyForms.filter(f => f.title.trim()).length} Stories`}
            </span>
            <span className="sm:hidden">
              {isSubmitting ? 'Adding...' : `Add ${storyForms.filter(f => f.title.trim()).length}`}
            </span>
            <span className="hidden sm:inline text-xs opacity-70 ml-1">(Ctrl+Enter)</span>
          </Button>
        </div>
      </div>

      {/* Sprint Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sprint Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Select Sprint</label>
              <Select
                value={localSelectedSprintId}
                onValueChange={setLocalSelectedSprintId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a sprint..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned Sprint</SelectItem>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div className="font-medium">
                            Week {sprint.isoWeek} - {sprint.year}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {localSelectedSprintId === 'unassigned' ? (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Adding stories to: Unassigned Sprint
              </span>
              <span className="text-xs text-muted-foreground">
                (Stories will not be assigned to any specific sprint)
              </span>
            </div>
          ) : selectedSprint && (
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Adding stories to: Week {selectedSprint.isoWeek} - {selectedSprint.year}
              </span>
              <span className="text-xs text-muted-foreground">
                ({new Date(selectedSprint.startDate).toLocaleDateString()} - {new Date(selectedSprint.endDate).toLocaleDateString()})
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Default Options - Mobile */}
      <Card className="sm:hidden">
        <CardHeader>
          <CardTitle className="text-base">Default Options</CardTitle>
          <p className="text-xs text-muted-foreground">Set defaults for all new stories</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
              <Select
                value={defaultOptions.priority}
                onValueChange={(value) => handleDefaultOptionChange('priority', value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Set default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {storyPriorities.map((priority) => (
                    <SelectItem key={priority.id} value={priority.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded border"
                          style={{ backgroundColor: priority.color }}
                        />
                        {priority.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
              <Select
                value={defaultOptions.status}
                onValueChange={(value) => handleDefaultOptionChange('status', value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Set default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="icebox">Icebox</SelectItem>
                  <SelectItem value="backlog">Backlog</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
              <Select
                value={defaultOptions.type}
                onValueChange={(value) => handleDefaultOptionChange('type', value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Set default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {settings.storyTypes?.map((type) => (
                    <SelectItem key={type.name} value={type.name}>
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
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Size</label>
              <Select
                value={defaultOptions.size}
                onValueChange={(value) => handleDefaultOptionChange('size', value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Set default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {settings.storySizes?.map((size) => (
                    <SelectItem key={size.name} value={size.name}>
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
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Weight</label>
              <Select
                value={defaultOptions.weight}
                onValueChange={(value) => handleDefaultOptionChange('weight', value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Set default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((weight) => {
                    const gradientColor = getWeightGradientColor(weight, storySettings.weightBaseColor, 21);
                    return (
                      <SelectItem key={weight} value={weight.toString()}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded border"
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
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
              <Input
                placeholder="Set default location..."
                className="h-10 text-sm"
                value={defaultOptions.location || ''}
                onChange={(e) => handleDefaultOptionChange('location', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Story Forms - Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {storyForms.map((story, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
                  <Input
                    ref={getFieldRef(index, 'title')}
                    value={story.title}
                    onChange={(e) => updateStoryForm(index, 'title', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, 'title')}
                    placeholder="Enter story title..."
                    className="w-full text-sm min-h-[44px]"
                  />
                </div>
                {storyForms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeStoryForm(index)}
                    className="h-10 w-10 p-0 text-red-600 hover:text-red-700 flex-shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
                <Textarea
                  ref={getFieldRef(index, 'description')}
                  value={story.description}
                  onChange={(e) => updateStoryForm(index, 'description', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                  placeholder="Description (optional)..."
                  className="w-full text-sm min-h-[60px] resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                  <Select
                    value={story.priority}
                    onValueChange={(value) => updateStoryForm(index, 'priority', value)}
                    data-field="priority"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {storyPriorities.map((priority) => (
                        <SelectItem key={priority.id} value={priority.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: priority.color }}
                            />
                            {priority.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <Select
                    value={story.status}
                    onValueChange={(value) => updateStoryForm(index, 'status', value)}
                    data-field="status"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['icebox', 'backlog', 'todo', 'progress', 'review', 'done'].map((status) => (
                        <SelectItem key={status} value={status}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: settings.statusColors?.[status as keyof typeof settings.statusColors] || '#6B7280' }}
                            />
                            {status === 'icebox' ? 'Icebox' :
                             status === 'backlog' ? 'Backlog' :
                             status === 'todo' ? 'To Do' :
                             status === 'progress' ? 'In Progress' :
                             status === 'review' ? 'Review' :
                             status === 'done' ? 'Done' : status}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                  <Select
                    value={story.type === '' ? 'none' : story.type}
                    onValueChange={(value) => updateStoryForm(index, 'type', value === 'none' ? '' : value)}
                    data-field="type"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          None
                        </div>
                      </SelectItem>
                      {settings.storyTypes?.map((type) => (
                        <SelectItem key={type.name} value={type.name}>
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Size</label>
                  <Select
                    value={story.size === '' ? 'none' : story.size}
                    onValueChange={(value) => updateStoryForm(index, 'size', value === 'none' ? '' : value)}
                    data-field="size"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400" />
                          None
                        </div>
                      </SelectItem>
                      {settings.storySizes?.map((size) => (
                        <SelectItem key={size.name} value={size.name}>
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
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Weight</label>
                <Select
                  value={story.weight === 0 ? 'none' : story.weight.toString()}
                  onValueChange={(value) => updateStoryForm(index, 'weight', value === 'none' ? 0 : parseInt(value))}
                  data-field="weight"
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded border bg-gray-400" />
                        <Weight className="h-3 w-3" />
                        None
                      </div>
                    </SelectItem>
                    {[1, 3, 5, 8, 13, 21].map(weight => {
                      const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor, 21);
                      return (
                        <SelectItem key={weight} value={weight.toString()}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded border"
                              style={{ backgroundColor: gradientColor }}
                            />
                            <Weight className="h-3 w-3" />
                            {weight}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                  <Select
                    value={story.roleId || 'none'}
                    onValueChange={(value) => updateStoryForm(index, 'roleId', value === 'none' ? undefined : value)}
                    data-field="role"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Role</SelectItem>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Project</label>
                  <Select
                    value={story.projectId || 'none'}
                    onValueChange={(value) => updateStoryForm(index, 'projectId', value === 'none' ? undefined : value)}
                    data-field="project"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Project..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Project</SelectItem>
                      {projects.length === 0 ? (
                        <SelectItem value="no-projects" disabled>
                          No projects available
                        </SelectItem>
                      ) : (
                        projects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Location</label>
                <Input
                  ref={getFieldRef(index, 'location')}
                  value={story.location || ''}
                  onChange={(e) => updateStoryForm(index, 'location', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'location')}
                  placeholder="Location..."
                  className="w-full h-10 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
                  <Input
                    ref={getFieldRef(index, 'dueDate')}
                    type="date"
                    value={story.dueDate || ''}
                    onChange={(e) => updateStoryForm(index, 'dueDate', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, 'dueDate')}
                    className="w-full h-10 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Scheduled</label>
                  <Input
                    ref={getFieldRef(index, 'scheduledDate')}
                    type="date"
                    value={story.scheduledDate || ''}
                    onChange={(e) => updateStoryForm(index, 'scheduledDate', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, 'scheduledDate')}
                    className="w-full h-10 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Vision</label>
                <Select
                  value={story.visionId || 'none'}
                  onValueChange={(value) => updateStoryForm(index, 'visionId', value === 'none' ? undefined : value)}
                  data-field="vision"
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Vision..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Vision</SelectItem>
                    {visions.map((vision) => (
                      <SelectItem key={vision.id} value={vision.id}>
                        {vision.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Goal</label>
                <Select
                  value={story.goalId || 'none'}
                  onValueChange={(value) => updateStoryForm(index, 'goalId', value === 'none' ? undefined : value)}
                  data-field="goal"
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Goal..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Goal</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Labels</label>
                <div className="flex flex-wrap gap-1">
                  {labels.slice(0, 5).map((label) => (
                    <Badge
                      key={label.id}
                      variant={story.labels.includes(label.id) ? "default" : "outline"}
                      className="cursor-pointer text-xs min-h-[32px] px-2 py-1"
                      style={story.labels.includes(label.id) ? {
                        backgroundColor: label.color,
                        color: 'white',
                        borderColor: label.color
                      } : {
                        backgroundColor: `${label.color}20`,
                        color: label.color,
                        borderColor: label.color
                      }}
                      onClick={() => {
                        const newLabels = story.labels.includes(label.id)
                          ? story.labels.filter(id => id !== label.id)
                          : [...story.labels, label.id];
                        updateStoryForm(index, 'labels', newLabels);
                      }}
                    >
                      {label.name}
                    </Badge>
                  ))}
                  {labels.length > 5 && (
                    <span className="text-xs text-muted-foreground self-center">+{labels.length - 5}</span>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Story Forms - Desktop Table View */}
      <Card className="hidden sm:block">
        <CardHeader>
          <CardTitle className="text-lg">Stories to Add</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto mobile-scroll">
            <table className="w-full min-w-[800px]">
              <thead className="border-b">
                {/* Default Options Row */}
                <tr className="bg-muted/30">
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span>Title *</span>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span>Description</span>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Priority</span>
                      <Select
                        value={defaultOptions.priority}
                        onValueChange={(value) => handleDefaultOptionChange('priority', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {storyPriorities.map((priority) => (
                            <SelectItem key={priority.id} value={priority.name}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded border"
                                  style={{ backgroundColor: priority.color }}
                                />
                                {priority.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Type</span>
                      <Select
                        value={defaultOptions.type}
                        onValueChange={(value) => handleDefaultOptionChange('type', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {settings.storyTypes?.map((type) => (
                            <SelectItem key={type.name} value={type.name}>
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
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[80px]">
                    <div className="flex flex-col gap-1">
                      <span>Size</span>
                      <Select
                        value={defaultOptions.size}
                        onValueChange={(value) => handleDefaultOptionChange('size', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {settings.storySizes?.map((size) => (
                            <SelectItem key={size.name} value={size.name}>
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
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[80px]">
                    <div className="flex flex-col gap-1">
                      <span>Weight</span>
                      <Select
                        value={defaultOptions.weight}
                        onValueChange={(value) => handleDefaultOptionChange('weight', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {Array.from({ length: 10 }, (_, i) => i + 1).map((weight) => {
                            const gradientColor = getWeightGradientColor(weight, storySettings.weightBaseColor, 21);
                            return (
                              <SelectItem key={weight} value={weight.toString()}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded border"
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
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Role</span>
                      <Select
                        value={defaultOptions.roleId}
                        onValueChange={(value) => handleDefaultOptionChange('roleId', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Location</span>
                      <Input
                        placeholder="Set default location..."
                        className="h-8 text-xs"
                        value={defaultOptions.location || ''}
                        onChange={(e) => handleDefaultOptionChange('location', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Status</span>
                      <Select
                        value={defaultOptions.status}
                        onValueChange={(value) => handleDefaultOptionChange('status', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="icebox">Icebox</SelectItem>
                          <SelectItem value="backlog">Backlog</SelectItem>
                          <SelectItem value="todo">To Do</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="review">Review</SelectItem>
                          <SelectItem value="done">Done</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Vision</span>
                      <Select
                        value={defaultOptions.visionId}
                        onValueChange={(value) => handleDefaultOptionChange('visionId', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {visions.map((vision) => (
                            <SelectItem key={vision.id} value={vision.id}>
                              {vision.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Project</span>
                      <Select
                        value={defaultOptions.projectId}
                        onValueChange={(value) => handleDefaultOptionChange('projectId', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Due Date</span>
                      <Input
                        type="date"
                        placeholder="Set default due date..."
                        className="h-8 text-xs"
                        value={defaultOptions.dueDate || ''}
                        onChange={(e) => handleDefaultOptionChange('dueDate', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Scheduled</span>
                      <Input
                        type="date"
                        placeholder="Set default scheduled date..."
                        className="h-8 text-xs"
                        value={defaultOptions.scheduledDate || ''}
                        onChange={(e) => handleDefaultOptionChange('scheduledDate', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Goal</span>
                      <Select
                        value={defaultOptions.goalId}
                        onValueChange={(value) => handleDefaultOptionChange('goalId', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {goals.map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[120px]">Labels</th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {storyForms.map((story, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'title')}
                        value={story.title}
                        onChange={(e) => updateStoryForm(index, 'title', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'title')}
                        placeholder="Enter story title..."
                        className="w-full text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Textarea
                        ref={getFieldRef(index, 'description')}
                        value={story.description}
                        onChange={(e) => updateStoryForm(index, 'description', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                        placeholder="Description (optional)..."
                        className="w-full text-sm min-h-[40px] resize-none"
                        rows={2}
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.priority}
                        onValueChange={(value) => updateStoryForm(index, 'priority', value)}
                        data-field="priority"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'priority');
                            } else {
                              handleKeyDown(e, index, 'priority');
                            }
                          }}
                          onBlur={() => handleSelectBlur(index, 'priority')}
                          onFocus={() => handleSelectFocus(index, 'priority')}
                          tabIndex={0}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {storyPriorities.map((priority) => (
                            <SelectItem key={priority.id} value={priority.name}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: priority.color }}
                                />
                                {priority.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.type === '' ? 'none' : story.type}
                        onValueChange={(value) => updateStoryForm(index, 'type', value === 'none' ? '' : value)}
                        data-field="type"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'type');
                            } else {
                              handleKeyDown(e, index, 'type');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                              None
                            </div>
                          </SelectItem>
                          {settings.storyTypes?.map((type) => (
                            <SelectItem key={type.name} value={type.name}>
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
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.size === '' ? 'none' : story.size}
                        onValueChange={(value) => updateStoryForm(index, 'size', value === 'none' ? '' : value)}
                        data-field="size"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'size');
                            } else {
                              handleKeyDown(e, index, 'size');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400" />
                              None
                            </div>
                          </SelectItem>
                          {settings.storySizes?.map((size) => (
                            <SelectItem key={size.name} value={size.name}>
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
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.weight === 0 ? 'none' : story.weight.toString()}
                        onValueChange={(value) => updateStoryForm(index, 'weight', value === 'none' ? 0 : parseInt(value))}
                        data-field="weight"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'weight');
                            } else {
                              handleKeyDown(e, index, 'weight');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded border bg-gray-400" />
                              <Weight className="h-3 w-3" />
                              None
                            </div>
                          </SelectItem>
                          {[1, 3, 5, 8, 13, 21].map(weight => {
                            const gradientColor = getWeightGradientColor(weight, settings.weightBaseColor, 21);
                            return (
                              <SelectItem key={weight} value={weight.toString()}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded border"
                                    style={{ backgroundColor: gradientColor }}
                                  />
                                  <Weight className="h-3 w-3" />
                                  {weight}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.roleId || 'none'}
                        onValueChange={(value) => updateStoryForm(index, 'roleId', value === 'none' ? undefined : value)}
                        data-field="role"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'role');
                            } else {
                              handleKeyDown(e, index, 'role');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Role..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Role</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'location')}
                        value={story.location || ''}
                        onChange={(e) => updateStoryForm(index, 'location', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'location')}
                        placeholder="Location..."
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.status}
                        onValueChange={(value) => updateStoryForm(index, 'status', value)}
                        data-field="status"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'status');
                            } else {
                              handleKeyDown(e, index, 'status');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['icebox', 'backlog', 'todo', 'progress', 'review', 'done'].map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: settings.statusColors?.[status as keyof typeof settings.statusColors] || '#6B7280' }}
                                />
                                {status === 'icebox' ? 'Icebox' :
                                 status === 'backlog' ? 'Backlog' :
                                 status === 'todo' ? 'To Do' :
                                 status === 'progress' ? 'In Progress' :
                                 status === 'review' ? 'Review' :
                                 status === 'done' ? 'Done' : status}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.visionId || 'none'}
                        onValueChange={(value) => updateStoryForm(index, 'visionId', value === 'none' ? undefined : value)}
                        data-field="vision"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'vision');
                            } else {
                              handleKeyDown(e, index, 'vision');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Vision..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Vision</SelectItem>
                          {visions.map((vision) => (
                            <SelectItem key={vision.id} value={vision.id}>
                              {vision.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.projectId || 'none'}
                        onValueChange={(value) => updateStoryForm(index, 'projectId', value === 'none' ? undefined : value)}
                        data-field="project"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'project');
                            } else {
                              handleKeyDown(e, index, 'project');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Project..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Project</SelectItem>
                          {projects.length === 0 ? (
                            <SelectItem value="no-projects" disabled>
                              No projects available
                            </SelectItem>
                          ) : (
                            projects.map((project) => (
                              <SelectItem key={project.id} value={project.id}>
                                {project.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'dueDate')}
                        type="date"
                        value={story.dueDate || ''}
                        onChange={(e) => updateStoryForm(index, 'dueDate', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'dueDate')}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'scheduledDate')}
                        type="date"
                        value={story.scheduledDate || ''}
                        onChange={(e) => updateStoryForm(index, 'scheduledDate', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'scheduledDate')}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={story.goalId || 'none'}
                        onValueChange={(value) => updateStoryForm(index, 'goalId', value === 'none' ? undefined : value)}
                        data-field="goal"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'goal');
                            } else {
                              handleKeyDown(e, index, 'goal');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Goal..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Goal</SelectItem>
                          {goals.map((goal) => (
                            <SelectItem key={goal.id} value={goal.id}>
                              {goal.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {labels.slice(0, 3).map((label) => (
                          <Badge
                            key={label.id}
                            variant={story.labels.includes(label.id) ? "default" : "outline"}
                            className="cursor-pointer text-xs"
                            style={story.labels.includes(label.id) ? {
                              backgroundColor: label.color,
                              color: 'white',
                              borderColor: label.color
                            } : {
                              backgroundColor: `${label.color}20`,
                              color: label.color,
                              borderColor: label.color
                            }}
                            onClick={() => {
                              const newLabels = story.labels.includes(label.id)
                                ? story.labels.filter(id => id !== label.id)
                                : [...story.labels, label.id];
                              updateStoryForm(index, 'labels', newLabels);
                            }}
                          >
                            {label.name}
                          </Badge>
                        ))}
                        {labels.length > 3 && (
                          <span className="text-xs text-muted-foreground">+{labels.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3">
                      {storyForms.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStoryForm(index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {storyForms.length} story form{storyForms.length !== 1 ? 's' : ''} • {storyForms.filter(f => f.title.trim()).length} with titles
            </div>
            <div className="text-sm font-medium">
              Ready to add {storyForms.filter(f => f.title.trim()).length} stories
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
