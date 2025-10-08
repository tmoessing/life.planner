import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  bucketlistAtom,
  addBucketlistItemAtom,
  rolesAtom,
  settingsAtom,
  visionsAtom
} from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Trash2, 
  List,
  Save,
  X
} from 'lucide-react';
import type { BucketlistItem } from '@/types';

interface BucketlistFormData {
  title: string;
  description: string;
  category: string;
  priority: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  status: 'not-started' | 'in-progress' | 'completed' | 'on-hold';
  roleId?: string;
  visionId?: string;
  dueDate?: string;
  bucketlistType: 'location' | 'experience';
  country?: string;
  state?: string;
  city?: string;
  experienceCategory?: string;
}

const defaultBucketlistItem: BucketlistFormData = {
  title: '',
  description: '',
  category: 'Adventure',
  priority: 'Q1',
  status: 'not-started',
  roleId: undefined,
  visionId: undefined,
  dueDate: undefined,
  bucketlistType: 'location',
  country: 'US',
  state: undefined,
  city: undefined,
  experienceCategory: undefined
};

export function AddBucketlistView() {
  const [bucketlistItems] = useAtom(bucketlistAtom);
  const [, addBucketlistItem] = useAtom(addBucketlistItemAtom);
  const [roles] = useAtom(rolesAtom);
  const [settings] = useAtom(settingsAtom);
  const [visions] = useAtom(visionsAtom);
  
  const [bucketlistForms, setBucketlistForms] = useState<BucketlistFormData[]>([{ ...defaultBucketlistItem }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<{row: number, field: string} | null>(null);
  const fieldRefs = useRef<{ [key: string]: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null }>({});
  
  // Default options for bulk editing
  const [defaultOptions, setDefaultOptions] = useState({
    category: 'none',
    priority: 'none',
    status: 'none',
    roleId: 'none',
    visionId: 'none',
    dueDate: '',
    bucketlistType: 'none',
    country: 'none',
    state: '',
    city: '',
    experienceCategory: ''
  });

  const addNewBucketlistForm = () => {
    // Create new bucketlist item with default options applied
    const newBucketlistItem = { ...defaultBucketlistItem };
    
    // Apply default options if they're not 'none' (or empty for text/date fields)
    Object.entries(defaultOptions).forEach(([key, value]) => {
      if (key === 'state' || key === 'city' || key === 'experienceCategory' || key === 'dueDate') {
        // For text/date fields, apply if not empty
        if (value && value.trim() !== '') {
          (newBucketlistItem as any)[key] = value;
        }
      } else if (value !== 'none') {
        // For other fields, apply if not 'none'
        (newBucketlistItem as any)[key] = value;
      }
    });
    
    setBucketlistForms(prev => [...prev, newBucketlistItem]);
    // Focus on the title field of the new row
    setTimeout(() => {
      const newRowIndex = bucketlistForms.length;
      const titleField = fieldRefs.current[`${newRowIndex}-title`];
      if (titleField) {
        titleField.focus();
      }
    }, 100);
  };

  const removeBucketlistForm = (index: number) => {
    if (bucketlistForms.length > 1) {
      setBucketlistForms(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateBucketlistForm = (index: number, field: keyof BucketlistFormData, value: any) => {
    setBucketlistForms(prev => prev.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, fieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (fieldName === 'title' && bucketlistForms[rowIndex].title.trim()) {
        addNewBucketlistForm();
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
    const fieldOrder = ['title', 'description', 'bucketlistType', 'category', 'priority', 'status', 'role', 'vision', 'dueDate', 'country', 'state', 'city', 'experienceCategory'];
    const currentIndex = fieldOrder.indexOf(currentField);
    
    if (currentIndex < fieldOrder.length - 1) {
      // Move to next field in same row
      const nextField = fieldOrder[currentIndex + 1];
      const nextFieldRef = fieldRefs.current[`${currentRow}-${nextField}`];
      if (nextFieldRef) {
        nextFieldRef.focus();
      }
    } else if (currentRow < bucketlistForms.length - 1) {
      // Move to first field of next row
      const nextFieldRef = fieldRefs.current[`${currentRow + 1}-title`];
      if (nextFieldRef) {
        nextFieldRef.focus();
      }
    } else {
      // Add new row and focus on title
      addNewBucketlistForm();
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
        if (!isSubmitting && bucketlistForms.some(form => form.title.trim() !== '')) {
          handleSubmit();
        }
      } else if (e.key === 'Tab') {
        // Check if we're currently focused on a Select component
        const activeElement = document.activeElement;
        if (activeElement && activeElement.closest('[role="combobox"]')) {
          e.preventDefault();
          e.stopPropagation();
          
          // Find which field we're on and move to the next one
          const fieldOrder = ['title', 'description', 'bucketlistType', 'category', 'priority', 'status', 'role', 'vision', 'dueDate', 'country', 'state', 'city', 'experienceCategory'];
          
          // Try to determine which field we're on based on the active element
          let currentField = 'bucketlistType'; // default fallback
          if (activeElement.closest('[data-field="bucketlistType"]')) currentField = 'bucketlistType';
          else if (activeElement.closest('[data-field="category"]')) currentField = 'category';
          else if (activeElement.closest('[data-field="priority"]')) currentField = 'priority';
          else if (activeElement.closest('[data-field="status"]')) currentField = 'status';
          else if (activeElement.closest('[data-field="role"]')) currentField = 'role';
          else if (activeElement.closest('[data-field="vision"]')) currentField = 'vision';
          else if (activeElement.closest('[data-field="country"]')) currentField = 'country';
          
          // Find the row index
          const rowElement = activeElement.closest('tr');
          const rowIndex = rowElement ? Array.from(rowElement.parentNode?.children || []).indexOf(rowElement) - 1 : 0; // -1 because of header row
          
          if (rowIndex >= 0 && rowIndex < bucketlistForms.length) {
            moveToNextField(rowIndex, currentField);
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSubmitting, bucketlistForms]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const validBucketlistItems = bucketlistForms.filter(item => item.title.trim() !== '');
      
      for (const bucketlistData of validBucketlistItems) {
        const newBucketlistItem: Omit<BucketlistItem, 'id' | 'createdAt' | 'updatedAt'> = {
          title: bucketlistData.title.trim(),
          description: bucketlistData.description.trim(),
          category: bucketlistData.category,
          priority: bucketlistData.priority,
          status: bucketlistData.status,
          roleId: bucketlistData.roleId,
          visionId: bucketlistData.visionId,
          dueDate: bucketlistData.dueDate,
          bucketlistType: bucketlistData.bucketlistType,
          country: bucketlistData.country,
          state: bucketlistData.state,
          city: bucketlistData.city,
          experienceCategory: bucketlistData.experienceCategory,
          order: 0,
          completed: false,
        };

        addBucketlistItem(newBucketlistItem);
      }
      
      // Reset forms
      setBucketlistForms([{ ...defaultBucketlistItem }]);
    } catch (error) {
      console.error('Error adding bucketlist items:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDefaultOptionChange = (field: keyof typeof defaultOptions, value: string) => {
    setDefaultOptions(prev => ({ ...prev, [field]: value }));
    
    // Apply the default to all existing bucketlist items
    if (field === 'state' || field === 'city' || field === 'experienceCategory' || field === 'dueDate') {
      // For text/date fields, apply the value directly
      setBucketlistForms(prev => prev.map(item => ({
        ...item,
        [field]: value
      })));
    } else if (value !== 'none') {
      // For other fields, only apply if not 'none'
      setBucketlistForms(prev => prev.map(item => ({
        ...item,
        [field]: value
      })));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Add Bucketlist Items</h2>
          <p className="text-sm text-muted-foreground">
            Batch add multiple bucketlist items to track your life experiences
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={addNewBucketlistForm}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
          
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || bucketlistForms.every(form => form.title.trim() === '')}
            className="gap-2"
            title="Add bucketlist items (Ctrl+Enter)"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Adding...' : `Add ${bucketlistForms.filter(f => f.title.trim()).length} Items`}
            <span className="text-xs opacity-70 ml-1">(Ctrl+Enter)</span>
          </Button>
        </div>
      </div>

      {/* Bucketlist Forms - Table View */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bucketlist Items to Add</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                      <span>Type</span>
                      <Select
                        value={defaultOptions.bucketlistType}
                        onValueChange={(value) => handleDefaultOptionChange('bucketlistType', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {settings.bucketlistTypes?.map((type) => (
                            <SelectItem key={type.name} value={type.name.toLowerCase()}>
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
                          <SelectItem value="Adventure">Adventure</SelectItem>
                          <SelectItem value="Travel">Travel</SelectItem>
                          <SelectItem value="Learning">Learning</SelectItem>
                          <SelectItem value="Experience">Experience</SelectItem>
                          <SelectItem value="Achievement">Achievement</SelectItem>
                          <SelectItem value="Personal">Personal</SelectItem>
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
                          <SelectItem value="Q1">Q1</SelectItem>
                          <SelectItem value="Q2">Q2</SelectItem>
                          <SelectItem value="Q3">Q3</SelectItem>
                          <SelectItem value="Q4">Q4</SelectItem>
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
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
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
                      <span>Country</span>
                      <Select
                        value={defaultOptions.country}
                        onValueChange={(value) => handleDefaultOptionChange('country', value)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Set default" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="IT">Italy</SelectItem>
                          <SelectItem value="ES">Spain</SelectItem>
                          <SelectItem value="JP">Japan</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="BR">Brazil</SelectItem>
                          <SelectItem value="IN">India</SelectItem>
                          <SelectItem value="CN">China</SelectItem>
                          <SelectItem value="RU">Russia</SelectItem>
                          <SelectItem value="ZA">South Africa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>State</span>
                      <Input
                        placeholder="Set default state..."
                        className="h-8 text-xs"
                        value={defaultOptions.state || ''}
                        onChange={(e) => handleDefaultOptionChange('state', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>City</span>
                      <Input
                        placeholder="Set default city..."
                        className="h-8 text-xs"
                        value={defaultOptions.city || ''}
                        onChange={(e) => handleDefaultOptionChange('city', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[100px]">
                    <div className="flex flex-col gap-1">
                      <span>Experience</span>
                      <Input
                        placeholder="Set default experience..."
                        className="h-8 text-xs"
                        value={defaultOptions.experienceCategory || ''}
                        onChange={(e) => handleDefaultOptionChange('experienceCategory', e.target.value)}
                      />
                    </div>
                  </th>
                  <th className="p-3 text-xs font-medium text-muted-foreground min-w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {bucketlistForms.map((item, index) => (
                  <tr key={index} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'title')}
                        value={item.title}
                        onChange={(e) => updateBucketlistForm(index, 'title', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'title')}
                        placeholder="Enter bucketlist item title..."
                        className="w-full text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Textarea
                        ref={getFieldRef(index, 'description')}
                        value={item.description}
                        onChange={(e) => updateBucketlistForm(index, 'description', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'description')}
                        placeholder="Description (optional)..."
                        className="w-full text-sm min-h-[40px] resize-none"
                        rows={2}
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={item.bucketlistType}
                        onValueChange={(value) => updateBucketlistForm(index, 'bucketlistType', value)}
                        data-field="bucketlistType"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'bucketlistType');
                            } else {
                              handleKeyDown(e, index, 'bucketlistType');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {settings.bucketlistTypes?.map((type) => (
                            <SelectItem key={type.name} value={type.name.toLowerCase()}>
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
                        value={item.category}
                        onValueChange={(value) => updateBucketlistForm(index, 'category', value)}
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
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {['Adventure', 'Travel', 'Learning', 'Experience', 'Achievement', 'Personal'].map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={item.priority}
                        onValueChange={(value) => updateBucketlistForm(index, 'priority', value)}
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
                          {['Q1', 'Q2', 'Q3', 'Q4'].map((priority) => (
                            <SelectItem key={priority} value={priority}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: settings.priorityColors?.[priority as keyof typeof settings.priorityColors] || '#6B7280' }}
                                />
                                {priority}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={item.status}
                        onValueChange={(value) => updateBucketlistForm(index, 'status', value)}
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
                          {['not-started', 'in-progress', 'completed', 'on-hold'].map((status) => (
                            <SelectItem key={status} value={status}>
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: settings.statusColors?.[status as keyof typeof settings.statusColors] || '#6B7280' }}
                                />
                                {status}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Select
                        value={item.roleId || 'none'}
                        onValueChange={(value) => updateBucketlistForm(index, 'roleId', value === 'none' ? undefined : value)}
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
                        value={item.visionId || 'none'}
                        onValueChange={(value) => updateBucketlistForm(index, 'visionId', value === 'none' ? undefined : value)}
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
                        ref={getFieldRef(index, 'dueDate')}
                        type="date"
                        value={item.dueDate || ''}
                        onChange={(e) => updateBucketlistForm(index, 'dueDate', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'dueDate')}
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Select
                        value={item.country || 'US'}
                        onValueChange={(value) => updateBucketlistForm(index, 'country', value)}
                        data-field="country"
                      >
                        <SelectTrigger 
                          className="w-full h-8"
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              e.stopPropagation();
                              moveToNextField(index, 'country');
                            } else {
                              handleKeyDown(e, index, 'country');
                            }
                          }}
                          tabIndex={0}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="US">United States</SelectItem>
                          <SelectItem value="CA">Canada</SelectItem>
                          <SelectItem value="MX">Mexico</SelectItem>
                          <SelectItem value="GB">United Kingdom</SelectItem>
                          <SelectItem value="FR">France</SelectItem>
                          <SelectItem value="DE">Germany</SelectItem>
                          <SelectItem value="IT">Italy</SelectItem>
                          <SelectItem value="ES">Spain</SelectItem>
                          <SelectItem value="JP">Japan</SelectItem>
                          <SelectItem value="AU">Australia</SelectItem>
                          <SelectItem value="BR">Brazil</SelectItem>
                          <SelectItem value="IN">India</SelectItem>
                          <SelectItem value="CN">China</SelectItem>
                          <SelectItem value="RU">Russia</SelectItem>
                          <SelectItem value="ZA">South Africa</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'state')}
                        value={item.state || ''}
                        onChange={(e) => updateBucketlistForm(index, 'state', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'state')}
                        placeholder="State..."
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'city')}
                        value={item.city || ''}
                        onChange={(e) => updateBucketlistForm(index, 'city', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'city')}
                        placeholder="City..."
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        ref={getFieldRef(index, 'experienceCategory')}
                        value={item.experienceCategory || ''}
                        onChange={(e) => updateBucketlistForm(index, 'experienceCategory', e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index, 'experienceCategory')}
                        placeholder="Experience..."
                        className="w-full h-8 text-sm"
                      />
                    </td>
                    <td className="p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBucketlistForm(index)}
                        disabled={bucketlistForms.length === 1}
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
