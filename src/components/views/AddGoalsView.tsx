import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  goalsAtom,
  addGoalAtom,
  rolesAtom,
  settingsAtom,
  visionsAtom,
  projectsAtom
} from '@/stores/appStore';
import { useGoalSettings } from '@/utils/settingsMirror';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  Target,
  Save,
  X
} from 'lucide-react';
import type { Goal } from '@/types';

interface GoalFormData {
  title: string;
  description: string;
  category: 'target' | 'lifestyle-value' | undefined;
  goalType: string | undefined;
  goalCategory: string | undefined;
  priority: 'low' | 'medium' | 'high' | undefined;
  status: 'not-started' | 'in-progress' | 'completed' | 'paused' | 'cancelled' | undefined;
  roleId?: string;
  visionId?: string;
  projectId?: string;
}

const defaultGoal: GoalFormData = {
  title: '',
  description: '',
  category: undefined,
  goalType: undefined,
  goalCategory: undefined,
  priority: undefined,
  status: undefined,
  roleId: undefined,
  visionId: undefined,
  projectId: undefined
};

export function AddGoalsView() {
  const [goals] = useAtom(goalsAtom);
  const [, addGoal] = useAtom(addGoalAtom);
  const [roles] = useAtom(rolesAtom);
  const [settings] = useAtom(settingsAtom);
  const [visions] = useAtom(visionsAtom);
  const [projects] = useAtom(projectsAtom);

  // Use settings mirror system for goal settings
  const goalSettings = useGoalSettings();
  
  // Debug: Log settings to see what's available
  
  const [goalForms, setGoalForms] = useState<GoalFormData[]>([{ ...defaultGoal }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<{row: number, field: string} | null>(null);
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null }>({});
  
  // Default options for bulk editing
  const [defaultOptions, setDefaultOptions] = useState({
    category: 'none',
    goalType: 'none',
    goalCategory: 'none',
    priority: 'none',
    status: 'none',
    roleId: 'none',
    visionId: 'none',
    projectId: 'none'
  });

  const addNewGoalForm = () => {
    // Create new goal with default options applied
    const newGoal = { ...defaultGoal };
    
    // Apply default options if they're not 'none'
    Object.entries(defaultOptions).forEach(([key, value]) => {
      if (value !== 'none') {
        (newGoal as any)[key] = value;
      }
    });
    
    setGoalForms(prev => [...prev, newGoal]);
    // Focus on the title field of the new row
    setTimeout(() => {
      const newRowIndex = goalForms.length;
      const titleField = fieldRefs.current[`${newRowIndex}-title`];
      if (titleField) {
        titleField.focus();
      }
    }, 100);
  };

  const removeGoalForm = (index: number) => {
    if (goalForms.length > 1) {
      setGoalForms(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateGoalForm = (index: number, field: keyof GoalFormData, value: any) => {
    setGoalForms(prev => prev.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldName === 'title' && goalForms[rowIndex].title.trim()) {
        addNewGoalForm();
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

  const moveToNextField = (currentRow: number, currentField: string) => {
    const fieldOrder = ['title', 'description', 'category', 'goalType', 'priority', 'status', 'role', 'vision', 'project'];
    const currentIndex = fieldOrder.indexOf(currentField);
    
    if (currentIndex < fieldOrder.length - 1) {
      // Move to next field in same row
      const nextField = fieldOrder[currentIndex + 1];
      const nextFieldRef = fieldRefs.current[`${currentRow}-${nextField}`];
      if (nextFieldRef) {
        nextFieldRef.focus();
      }
    } else if (currentRow < goalForms.length - 1) {
      // Move to first field of next row
      const nextFieldRef = fieldRefs.current[`${currentRow + 1}-title`];
      if (nextFieldRef) {
        nextFieldRef.focus();
      }
    } else {
      // Add new row and focus on title
      addNewGoalForm();
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
        if (!isSubmitting && goalForms.some(form => form.title.trim() !== '')) {
          handleSubmit();
        }
      } else if (e.key === 'Tab') {
        // Check if we're currently focused on a Select component
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('[role="combobox"]')) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find which field we're on and move to the next one
          const fieldOrder = ['title', 'description', 'category', 'goalType', 'goalCategory', 'priority', 'status', 'role', 'vision', 'project'];
          
          // Try to determine which field we're on based on the active element
          let currentField = 'category'; // default fallback
          if (activeElement.closest('[data-field="category"]')) currentField = 'category';
          else if (activeElement.closest('[data-field="goalType"]')) currentField = 'goalType';
          else if (activeElement.closest('[data-field="goalCategory"]')) currentField = 'goalCategory';
          else if (activeElement.closest('[data-field="priority"]')) currentField = 'priority';
          else if (activeElement.closest('[data-field="status"]')) currentField = 'status';
          else if (activeElement.closest('[data-field="role"]')) currentField = 'role';
          else if (activeElement.closest('[data-field="vision"]')) currentField = 'vision';
          else if (activeElement.closest('[data-field="project"]')) currentField = 'project';
          
          // Find the row index
          const rowElement = activeElement.closest('tr');
          const rowIndex = rowElement ? Array.from(rowElement.parentNode?.children || []).indexOf(rowElement) - 1 : 0; // -1 because of header row
          
          if (rowIndex >= 0 && rowIndex < goalForms.length) {
            moveToNextField(rowIndex, currentField);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, goalForms]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const validGoals = goalForms.filter(goal => 
        goal.title.trim() !== '' && 
        goal.category && 
        goal.goalType && 
        goal.priority && 
        goal.status
      );
      
      for (const goalData of validGoals) {
        const newGoal: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'> = {
          title: goalData.title.trim(),
          name: goalData.title.trim(), // alias for title
          description: goalData.description.trim(),
          category: goalData.category as 'target' | 'lifestyle-value',
          goalType: goalData.goalType!,
          priority: goalData.priority!,
          status: goalData.status === 'completed' ? 'done' : 
                 goalData.status === 'not-started' ? 'icebox' :
                 goalData.status === 'in-progress' ? 'in-progress' :
                 goalData.status === 'paused' ? 'backlog' :
                 goalData.status === 'cancelled' ? 'icebox' : 'icebox',
          roleId: goalData.roleId,
          visionId: goalData.visionId,
          projectId: goalData.projectId,
          order: 0,
          storyIds: [],
          completed: false,
        };

        addGoal(newGoal);
      }
      
      // Reset forms
      setGoalForms([{ ...defaultGoal }]);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDefaultOptionChange = (field: keyof typeof defaultOptions, value: string) => {
    setDefaultOptions(prev => ({ ...prev, [field]: value }));
    
    // Apply the default to all existing goals
    if (value !== 'none') {
      setGoalForms(prev => prev.map(goal => ({
        ...goal,
        [field]: value
      })));
    }
  };

  return (
    <div className="space-y-2 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h2 className="text-base sm:text-2xl font-bold">Add Goals</h2>
          <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
            Batch add multiple goals to track your progress
          </p>
        </div>
        
        <div className="flex flex-row gap-1.5 sm:gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={addNewGoalForm}
            size="sm"
            className="gap-1 sm:gap-2 flex-1 sm:flex-initial touch-target h-9 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm px-2 sm:px-4"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline">Add Goal</span>
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || goalForms.every(form => form.title.trim() === '')}
            size="sm"
            className="gap-1 sm:gap-2 flex-1 sm:flex-initial touch-target h-9 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm px-2 sm:px-4"
            title="Add goals (Ctrl+Enter)"
          >
            <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">
              {isSubmitting ? 'Adding...' : `Add ${goalForms.filter(f => f.title.trim()).length} Goals`}
            </span>
            <span className="sm:hidden">
              {isSubmitting ? 'Adding...' : `Add ${goalForms.filter(f => f.title.trim()).length}`}
            </span>
            <span className="hidden sm:inline text-xs opacity-70 ml-1">(Ctrl+Enter)</span>
          </Button>
        </div>
      </div>

      {/* Default Options - Mobile */}
      <Card className="sm:hidden">
        <CardHeader>
          <CardTitle className="text-base">Default Options</CardTitle>
          <p className="text-xs text-muted-foreground">Set defaults for all new goals</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <Select
                value={defaultOptions.category}
                onValueChange={(value) => handleDefaultOptionChange('category', value)}
              >
                <SelectTrigger className="h-10 text-sm">
                  <SelectValue placeholder="Set default" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {settings.goalCategories?.map((category) => (
                    <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
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
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
              <Select
                value={defaultOptions.roleId}
                onValueChange={(value) => handleDefaultOptionChange('roleId', value)}
              >
                <SelectTrigger className="h-10 text-sm">
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
          </div>
        </CardContent>
      </Card>

      {/* Goal Forms - Mobile Card View */}
      <div className="sm:hidden space-y-3">
        {goalForms.map((goal, index) => (
          <Card key={index} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
                  <Input
                    ref={getFieldRef(index, 'title')}
                    value={goal.title}
                    onChange={(e) => updateGoalForm(index, 'title', e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index, 'title')}
                    placeholder="Enter goal title..."
                    className="w-full text-sm min-h-[44px]"
                  />
                </div>
                {goalForms.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeGoalForm(index)}
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
                  value={goal.description}
                  onChange={(e) => updateGoalForm(index, 'description', e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                  placeholder="Description (optional)..."
                  className="w-full text-sm min-h-[60px] resize-none"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
                  <Select
                    value={goal.category}
                    onValueChange={(value) => updateGoalForm(index, 'category', value)}
                    data-field="category"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalSettings.goalTypes?.map((goalType) => (
                        <SelectItem key={goalType.name} value={goalType.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: goalType.color }}
                            />
                            {goalType.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Goal Type</label>
                  <Select
                    value={goal.goalType}
                    onValueChange={(value) => updateGoalForm(index, 'goalType', value)}
                    data-field="goalType"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Select Goal Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.goalCategories?.map((category) => (
                        <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Goal Category</label>
                <Select
                  value={goal.goalCategory}
                  onValueChange={(value) => updateGoalForm(index, 'goalCategory', value)}
                  data-field="goalCategory"
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Select Goal Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.goalCategories?.map((category) => (
                      <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                  <Select
                    value={goal.priority}
                    onValueChange={(value) => updateGoalForm(index, 'priority', value)}
                    data-field="priority"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Select Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        { value: 'low', label: 'Low', color: goalSettings.getPriorityColor('low') },
                        { value: 'medium', label: 'Medium', color: goalSettings.getPriorityColor('medium') },
                        { value: 'high', label: 'High', color: goalSettings.getPriorityColor('high') }
                      ].map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: priority.color }}
                            />
                            {priority.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Status</label>
                  <Select
                    value={goal.status}
                    onValueChange={(value) => updateGoalForm(index, 'status', value)}
                    data-field="status"
                  >
                    <SelectTrigger className="w-full h-10 text-sm">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.goalStatuses?.map((status) => {
                        const statusId = status.name.toLowerCase().replace(' ', '-');
                        return (
                          <SelectItem key={statusId} value={statusId}>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: status.color }}
                              />
                              {status.name}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Role</label>
                  <Select
                    value={goal.roleId || 'none'}
                    onValueChange={(value) => updateGoalForm(index, 'roleId', value === 'none' ? undefined : value)}
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
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Vision</label>
                  <Select
                    value={goal.visionId || 'none'}
                    onValueChange={(value) => updateGoalForm(index, 'visionId', value === 'none' ? undefined : value)}
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
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Project</label>
                <Select
                  value={goal.projectId || 'none'}
                  onValueChange={(value) => updateGoalForm(index, 'projectId', value === 'none' ? undefined : value)}
                  data-field="project"
                >
                  <SelectTrigger className="w-full h-10 text-sm">
                    <SelectValue placeholder="Project..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Goal Forms - Desktop Table View */}
      <Card className="hidden sm:block">
        <CardHeader>
          <CardTitle className="text-lg">Goals to Add</CardTitle>
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
                      <span>Category</span>
                      <Select
                        value={defaultOptions.category}
                        onValueChange={(value) => handleDefaultOptionChange('category', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {settings.goalCategories?.map((category) => (
                            <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Goal Type</span>
                      <Select
                        value={defaultOptions.goalType}
                        onValueChange={(value) => handleDefaultOptionChange('goalType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {goalSettings.goalTypes?.map((goalType) => (
                            <SelectItem key={goalType.name} value={goalType.name}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: goalType.color }}
                                />
                                {goalType.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Goal Category</span>
                      <Select
                        value={defaultOptions.goalCategory}
                        onValueChange={(value) => handleDefaultOptionChange('goalCategory', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {settings.goalCategories?.map((category) => (
                            <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full" 
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
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
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {goalForms.map((goal, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'title')}
                        value={goal.title}
                        onChange={(e) => updateGoalForm(index, 'title', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'title')}
                        placeholder="Enter goal title..."
                        className="w-full text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Textarea
                        ref={getFieldRef(index, 'description')}
                        value={goal.description}
                        onChange={(e) => updateGoalForm(index, 'description', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                        placeholder="Description (optional)..."
                        className="w-full text-sm min-h-[40px] resize-none"
                        rows={2}
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={goal.category}
                        onValueChange={(value) => updateGoalForm(index, 'category', value)}
                        data-field="category"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'category');
                            } else {
                              handleKeyDown(e, index, 'category');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.goalCategories?.map((category) => (
                            <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={goal.goalType}
                        onValueChange={(value) => updateGoalForm(index, 'goalType', value)}
                        data-field="goalType"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'goalType');
                            } else {
                              handleKeyDown(e, index, 'goalType');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Select Goal Type" />
                        </SelectTrigger>
                        <SelectContent>
                          {goalSettings.goalTypes?.map((goalType) => (
                            <SelectItem key={goalType.name} value={goalType.name}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: goalType.color }}
                                />
                                {goalType.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={goal.goalCategory}
                        onValueChange={(value) => updateGoalForm(index, 'goalCategory', value)}
                        data-field="goalCategory"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'goalCategory');
                            } else {
                              handleKeyDown(e, index, 'goalCategory');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Select Goal Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.goalCategories?.map((category) => (
                            <SelectItem key={category.name} value={category.name.toLowerCase().replace('/', '-')}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: category.color }}
                                />
                                {category.name}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={goal.priority}
                        onValueChange={(value) => updateGoalForm(index, 'priority', value)}
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
                          tabIndex={0}
                        >
                          <SelectValue placeholder="Select Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          {[
                            { value: 'low', label: 'Low', color: goalSettings.getPriorityColor('low') },
                            { value: 'medium', label: 'Medium', color: goalSettings.getPriorityColor('medium') },
                            { value: 'high', label: 'High', color: goalSettings.getPriorityColor('high') }
                          ].map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: priority.color }}
                                />
                                {priority.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={goal.status}
                        onValueChange={(value) => updateGoalForm(index, 'status', value)}
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
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.goalStatuses?.map((status) => {
                            const statusId = status.name.toLowerCase().replace(' ', '-');
                            return (
                              <SelectItem key={statusId} value={statusId}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: status.color }}
                                  />
                                  {status.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={goal.roleId || 'none'}
                        onValueChange={(value) => updateGoalForm(index, 'roleId', value === 'none' ? undefined : value)}
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
                      <Select
                        value={goal.visionId || 'none'}
                        onValueChange={(value) => updateGoalForm(index, 'visionId', value === 'none' ? undefined : value)}
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
                        value={goal.projectId || 'none'}
                        onValueChange={(value) => updateGoalForm(index, 'projectId', value === 'none' ? undefined : value)}
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
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              {project.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoalForm(index)}
                        disabled={goalForms.length === 1}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
