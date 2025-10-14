import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  projectsAtom, 
  addProjectAtom, 
  rolesAtom, 
  visionsAtom 
} from '@/stores/appStore';
import { projectStatusesAtom } from '@/stores/statusStore';
import { useProjectSettings } from '@/utils/settingsMirror';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  FolderOpen,
  Save,
  X
} from 'lucide-react';
import type { Project } from '@/types';

interface ProjectFormData {
  name: string;
  description: string;
  status: 'Icebox' | 'Backlog' | 'To do' | 'In Progress' | 'Done';
  priority: 'high' | 'medium' | 'low';
  type?: string;
  size?: string;
  roleId?: string;
  visionId?: string;
  startDate?: string;
  endDate?: string;
}

const defaultProject: ProjectFormData = {
  name: '',
  description: '',
  status: 'Icebox',
  priority: 'medium',
  type: undefined,
  size: undefined,
  roleId: undefined,
  visionId: undefined,
  startDate: undefined,
  endDate: undefined
};

export function AddProjectsView() {
  const [projects] = useAtom(projectsAtom);
  const [, addProject] = useAtom(addProjectAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  const [projectStatuses] = useAtom(projectStatusesAtom);
  const projectSettings = useProjectSettings();
  
  const [projectForms, setProjectForms] = useState<ProjectFormData[]>([{ ...defaultProject }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<{row: number, field: string} | null>(null);
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null }>({});
  
  // Default options for bulk editing
  const [defaultOptions, setDefaultOptions] = useState({
    status: 'none' as 'none' | 'Icebox' | 'Backlog' | 'To do' | 'In Progress' | 'Done',
    priority: 'none' as 'none' | 'high' | 'medium' | 'low',
    type: 'none' as string,
    size: 'none' as string,
    roleId: 'none' as string,
    visionId: 'none' as string,
    startDate: '',
    endDate: ''
  });

  const addNewProjectForm = () => {
    // Create new project with default options applied
    const newProject = { ...defaultProject };
    
    // Apply default options if they're not 'none' (or empty for date fields)
    Object.entries(defaultOptions).forEach(([key, value]) => {
      if (key === 'startDate' || key === 'endDate') {
        // For date fields, apply if not empty
        if (value && value.trim() !== '') {
          (newProject as any)[key] = value;
        }
      } else if (value !== 'none') {
        // For other fields, apply if not 'none'
        (newProject as any)[key] = value;
      }
    });
    
    setProjectForms(prev => [...prev, newProject]);
    // Focus on the name field of the new row
    setTimeout(() => {
      const newRowIndex = projectForms.length;
      const nameField = fieldRefs.current[`${newRowIndex}-name`];
      if (nameField) {
        nameField.focus();
      }
    }, 100);
  };

  const removeProjectForm = (index: number) => {
    if (projectForms.length > 1) {
      setProjectForms(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateProjectForm = (index: number, field: keyof ProjectFormData, value: any) => {
    setProjectForms(prev => prev.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldName === 'name' && projectForms[rowIndex].name.trim()) {
        addNewProjectForm();
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
    const fieldOrder = ['name', 'description', 'status', 'priority', 'role', 'vision', 'startDate', 'endDate'];
    const currentIndex = fieldOrder.indexOf(currentField);
    
    if (currentIndex < fieldOrder.length - 1) {
      // Move to next field in same row
      const nextField = fieldOrder[currentIndex + 1];
      const nextFieldRef = fieldRefs.current[`${currentRow}-${nextField}`];
      if (nextFieldRef) {
        nextFieldRef.focus();
      }
    } else if (currentRow < projectForms.length - 1) {
      // Move to first field of next row
      const nextFieldRef = fieldRefs.current[`${currentRow + 1}-name`];
      if (nextFieldRef) {
        nextFieldRef.focus();
      }
    } else {
      // Add new row and focus on name
      addNewProjectForm();
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
        if (!isSubmitting && projectForms.some(form => form.name.trim() !== '')) {
          handleSubmit();
        }
      } else if (e.key === 'Tab') {
        // Check if we're currently focused on a Select component
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('[role="combobox"]')) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find which field we're on and move to the next one
          const fieldOrder = ['name', 'description', 'status', 'priority', 'role', 'vision', 'startDate', 'endDate'];
          
          // Try to determine which field we're on based on the active element
          let currentField = 'status'; // default fallback
          if (activeElement.closest('[data-field="status"]')) currentField = 'status';
          else if (activeElement.closest('[data-field="priority"]')) currentField = 'priority';
          else if (activeElement.closest('[data-field="role"]')) currentField = 'role';
          else if (activeElement.closest('[data-field="vision"]')) currentField = 'vision';
          
          // Find the row index
          const rowElement = activeElement.closest('tr');
          const rowIndex = rowElement ? Array.from(rowElement.parentNode?.children || []).indexOf(rowElement) - 1 : 0; // -1 because of header row
          
          if (rowIndex >= 0 && rowIndex < projectForms.length) {
            moveToNextField(rowIndex, currentField);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, projectForms]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const validProjects = projectForms.filter(project => project.name.trim() !== '');
      
      for (const projectData of validProjects) {
        const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
          name: projectData.name.trim(),
          description: projectData.description.trim(),
          status: projectData.status,
          priority: projectData.priority,
          type: projectData.type,
          size: projectData.size,
          roleId: projectData.roleId,
          visionId: projectData.visionId,
          startDate: projectData.startDate || '',
          endDate: projectData.endDate || '',
          order: 0,
          storyIds: [],
        };

        addProject(newProject);
      }
      
      // Reset forms
      setProjectForms([{ ...defaultProject }]);
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDefaultOptionChange = (field: keyof typeof defaultOptions, value: string) => {
    setDefaultOptions(prev => ({ ...prev, [field]: value }));
    
    // Apply the default to all existing projects
    if (field === 'startDate' || field === 'endDate') {
      // For date fields, apply the value directly
      setProjectForms(prev => prev.map(project => ({
        ...project,
        [field]: value
      })));
    } else if (value !== 'none') {
      // For other fields, only apply if not 'none'
      setProjectForms(prev => prev.map(project => ({
        ...project,
        [field]: value
      })));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Add Projects</h2>
          <p className="text-sm text-muted-foreground">
            Batch add multiple projects to organize your work
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addNewProjectForm}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || projectForms.every(form => form.name.trim() === '')}
            className="gap-2"
            title="Add projects (Ctrl+Enter)"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Adding...' : `Add ${projectForms.filter(f => f.name.trim()).length} Projects`}
            <span className="text-xs opacity-70 ml-1">(Ctrl+Enter)</span>
          </Button>
        </div>
      </div>

      {/* Project Forms - Table View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Projects to Add</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                {/* Default Options Row */}
                <tr className="bg-muted/30">
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span>Name *</span>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <span>Description</span>
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
                          {projectStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.id}>
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
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Type</span>
                      <Select
                        value={defaultOptions.type || 'none'}
                        onValueChange={(value) => handleDefaultOptionChange('type', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projectSettings.projectTypes.map((type) => (
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
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Size</span>
                      <Select
                        value={defaultOptions.size || 'none'}
                        onValueChange={(value) => handleDefaultOptionChange('size', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {projectSettings.projectSizes.map((size) => (
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
                      <span>Start Date</span>
                      <Input
                        type="date"
                        placeholder="Set default start date..."
                        className="h-8 text-xs"
                        value={defaultOptions.startDate || ''}
                        onChange={(e) => handleDefaultOptionChange('startDate', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>End Date</span>
                      <Input
                        type="date"
                        placeholder="Set default end date..."
                        className="h-8 text-xs"
                        value={defaultOptions.endDate || ''}
                        onChange={(e) => handleDefaultOptionChange('endDate', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {projectForms.map((project, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'name')}
                        value={project.name}
                        onChange={(e) => updateProjectForm(index, 'name', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'name')}
                        placeholder="Enter project name..."
                        className="w-full text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Textarea
                        ref={getFieldRef(index, 'description')}
                        value={project.description}
                        onChange={(e) => updateProjectForm(index, 'description', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                        placeholder="Description (optional)..."
                        className="w-full text-sm min-h-[40px] resize-none"
                        rows={2}
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={project.status}
                        onValueChange={(value) => updateProjectForm(index, 'status', value)}
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
                          {projectStatuses.map((status) => (
                            <SelectItem key={status.id} value={status.name}>
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
                    </td>
                    <td className="p-3">
                      <Select
                        value={project.priority}
                        onValueChange={(value) => updateProjectForm(index, 'priority', value)}
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['high', 'medium', 'low'].map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: projectSettings.priorityColors?.[priority as 'high' | 'medium' | 'low'] || '#6B7280' }}
                                />
                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={project.type || 'none'}
                        onValueChange={(value) => updateProjectForm(index, 'type', value === 'none' ? undefined : value)}
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
                          <SelectValue placeholder="Type..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Type</SelectItem>
                          {projectSettings.projectTypes.map((type) => (
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
                        value={project.size || 'none'}
                        onValueChange={(value) => updateProjectForm(index, 'size', value === 'none' ? undefined : value)}
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
                          <SelectValue placeholder="Size..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Size</SelectItem>
                          {projectSettings.projectSizes.map((size) => (
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
                        value={project.roleId || 'none'}
                        onValueChange={(value) => updateProjectForm(index, 'roleId', value === 'none' ? undefined : value)}
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
                        value={project.visionId || 'none'}
                        onValueChange={(value) => updateProjectForm(index, 'visionId', value === 'none' ? undefined : value)}
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
                      <Input
                        ref={getFieldRef(index, 'startDate')}
                        type="date"
                        value={project.startDate || ''}
                        onChange={(e) => updateProjectForm(index, 'startDate', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'startDate')}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'endDate')}
                        type="date"
                        value={project.endDate || ''}
                        onChange={(e) => updateProjectForm(index, 'endDate', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'endDate')}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProjectForm(index)}
                        disabled={projectForms.length === 1}
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
