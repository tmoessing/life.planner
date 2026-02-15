import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import {
  currentSprintAtom,
  addStoryAtom,
  addStoryToProjectAtom,
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
  Save,
  Copy,
  X
} from 'lucide-react';
import type { StoryFormData, Priority } from '@/types';
import { useRules } from '@/hooks/useRules';

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

interface AddStoriesViewRefactoredProps {
  onSuccess?: () => void;
}

export function AddStoriesViewRefactored({ onSuccess }: AddStoriesViewRefactoredProps) {
  const [, addStory] = useAtom(addStoryAtom);
  const [, addStoryToProject] = useAtom(addStoryToProjectAtom);
  const [storyPriorities] = useAtom(storyPrioritiesAtom);

  // Use settings mirror system
  const storySettings = useStorySettings();

  const [currentSprint] = useAtom(currentSprintAtom);

  const { evaluateRules } = useRules();

  // Form state
  const [storyForms, setStoryForms] = useState<StoryFormData[]>([{ ...defaultStory }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<{ row: number, field: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [templateMode, setTemplateMode] = useState(false);

  // Refs for auto-focus
  const titleRefs = useRef<(HTMLInputElement | null)[]>([]);
  const descriptionRefs = useRef<(HTMLTextAreaElement | null)[]>([]);

  // Templates
  const storyTemplates = [
    {
      id: 'daily-task',
      name: 'Daily Task',
      description: 'Simple daily task template',
      template: {
        ...defaultStory,
        priority: 'Q2',
        type: 'Intellectual',
        size: 'S',
        weight: 3,
        status: 'todo'
      }
    },
    {
      id: 'project-milestone',
      name: 'Project Milestone',
      description: 'Significant project milestone',
      template: {
        ...defaultStory,
        priority: 'Q1',
        type: 'Intellectual',
        size: 'L',
        weight: 8,
        status: 'backlog'
      }
    },
    {
      id: 'learning-goal',
      name: 'Learning Goal',
      description: 'Educational or skill development',
      template: {
        ...defaultStory,
        priority: 'Q2',
        type: 'Intellectual',
        size: 'M',
        weight: 5,
        status: 'backlog'
      }
    }
  ];

  // Auto-focus logic
  useEffect(() => {
    if (focusedField) {
      const { row, field } = focusedField;
      const refs = field === 'title' ? titleRefs : descriptionRefs;
      const element = refs.current[row];
      if (element) {
        element.focus();
        element.select();
      }
    }
  }, [focusedField]);

  // Add new story form
  const addStoryForm = () => {
    const newStory = { ...defaultStory };
    if (currentSprint) {
      newStory.sprintId = currentSprint.id;
    }

    // Apply rules
    const appliedActions = evaluateRules('story-create', newStory);
    if (appliedActions.length > 0) {
      appliedActions.forEach(action => {
        // @ts-ignore - dynamic field update
        newStory[action.field as keyof StoryFormData] = action.value;
      });
    }

    setStoryForms(prev => [...prev, newStory]);

    // Focus on the new form
    setTimeout(() => {
      const newIndex = storyForms.length;
      setFocusedField({ row: newIndex, field: 'title' });
    }, 100);
  };

  // Remove story form
  const removeStoryForm = (index: number) => {
    if (storyForms.length > 1) {
      setStoryForms(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Update story form
  const updateStoryForm = (index: number, field: keyof StoryFormData, value: any) => {
    setStoryForms(prev => prev.map((form, i) =>
      i === index ? { ...form, [field]: value } : form
    ));
  };

  // Duplicate story form
  const duplicateStoryForm = (index: number) => {
    const storyToDuplicate = storyForms[index];
    const duplicatedStory = { ...storyToDuplicate, title: `${storyToDuplicate.title} (Copy)` };
    setStoryForms(prev => [
      ...prev.slice(0, index + 1),
      duplicatedStory,
      ...prev.slice(index + 1)
    ]);
  };

  // Apply template
  const applyTemplate = (templateId: string) => {
    const template = storyTemplates.find(t => t.id === templateId);
    if (template) {
      setStoryForms(prev => prev.map(form => ({ ...form, ...template.template })));
    }
  };

  // Clear all forms
  const clearAllForms = () => {
    setStoryForms([{ ...defaultStory }]);
  };

  // Submit all stories
  const submitAllStories = async () => {
    setIsSubmitting(true);

    try {
      for (const form of storyForms) {
        if (form.title.trim()) {
          const storyData = {
            ...form,
            title: form.title.trim(),
            description: form.description.trim(),
            priority: form.priority as Priority,
            weight: form.weight as 1 | 3 | 5 | 8 | 13 | 21,
            size: form.size as "XS" | "S" | "M" | "L" | "XL",
            status: form.status as "icebox" | "backlog" | "todo" | "progress" | "review" | "done",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            checklist: []
          };

          if (form.projectId) {
            const addedStory = await addStory(storyData);
            await addStoryToProject(form.projectId, addedStory.id);
          } else {
            await addStory(storyData);
          }
        }
      }

      // Clear forms after successful submission
      setStoryForms([{ ...defaultStory }]);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting stories:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get form validation
  const getFormValidation = (form: StoryFormData) => {
    const errors: string[] = [];

    if (!form.title.trim()) {
      errors.push('Title is required');
    }

    if (form.weight <= 0) {
      errors.push('Weight must be greater than 0');
    }

    return errors;
  };

  // Get total stories count
  const totalStories = storyForms.length;
  const validStories = storyForms.filter(form => form.title.trim()).length;
  const invalidStories = totalStories - validStories;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Add Stories</h1>
          <p className="text-muted-foreground">
            Create multiple stories at once with batch operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setTemplateMode(!templateMode)}
          >
            <Copy className="h-4 w-4 mr-2" />
            Templates
          </Button>
          <Button
            variant="outline"
            onClick={clearAllForms}
            disabled={storyForms.length <= 1}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={submitAllStories}
            disabled={isSubmitting || validStories === 0}
            className="min-w-32"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit All ({validStories})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{totalStories}</div>
                <div className="text-sm text-muted-foreground">Total Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{validStories}</div>
                <div className="text-sm text-muted-foreground">Valid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{invalidStories}</div>
                <div className="text-sm text-muted-foreground">Invalid</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAdvanced(!showAdvanced)}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates */}
      {templateMode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Story Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {storyTemplates.map(template => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => applyTemplate(template.id)}
                        className="w-full"
                      >
                        Apply Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Forms */}
      <div className="space-y-4">
        {storyForms.map((form, index) => {
          const errors = getFormValidation(form);
          const hasErrors = errors.length > 0;

          return (
            <Card key={index} className={hasErrors ? 'border-red-200 bg-red-50' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Story {index + 1}
                    {hasErrors && (
                      <Badge variant="destructive" className="ml-2">
                        {errors.length} error{errors.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => duplicateStoryForm(index)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeStoryForm(index)}
                      disabled={storyForms.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Basic Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title *</label>
                    <Input
                      ref={el => { titleRefs.current[index] = el; }}
                      value={form.title}
                      onChange={(e) => updateStoryForm(index, 'title', e.target.value)}
                      placeholder="Enter story title"
                      className={hasErrors && !form.title.trim() ? 'border-red-500' : ''}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={form.priority}
                      onValueChange={(value) => updateStoryForm(index, 'priority', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {storyPriorities.map(priority => (
                          <SelectItem key={priority.id} value={priority.name}>
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    ref={el => { descriptionRefs.current[index] = el; }}
                    value={form.description}
                    onChange={(e) => updateStoryForm(index, 'description', e.target.value)}
                    placeholder="Enter story description"
                    rows={3}
                  />
                </div>

                {/* Advanced Fields */}
                {showAdvanced && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={form.type}
                        onValueChange={(value) => updateStoryForm(index, 'type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {storySettings.storyTypes?.map((type: any) => (
                            <SelectItem key={type.name} value={type.name}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Size</label>
                      <Select
                        value={form.size}
                        onValueChange={(value) => updateStoryForm(index, 'size', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {storySettings.storySizes?.map((size: any) => (
                            <SelectItem key={size.name} value={size.name}>
                              {size.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Weight</label>
                      <Select
                        value={form.weight.toString()}
                        onValueChange={(value) => updateStoryForm(index, 'weight', parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 3, 5, 8, 13, 21].map(weight => (
                            <SelectItem key={weight} value={weight.toString()}>
                              {weight}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Error Messages */}
                {hasErrors && (
                  <div className="space-y-1">
                    {errors.map((error, errorIndex) => (
                      <div key={errorIndex} className="text-sm text-red-600">
                        • {error}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Story Button */}
      <div className="flex justify-center">
        <Button onClick={addStoryForm} variant="outline" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Add Another Story
        </Button>
      </div>
    </div>
  );
}
