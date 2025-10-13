import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { 
  addBucketlistItemAtom,
  updateBucketlistItemAtom,
  rolesAtom,
  settingsAtom,
  visionsAtom
} from '@/stores/appStore';
import { useBucketlistSettings } from '@/utils/settingsMirror';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getCitiesForState } from '@/utils/cityData';
import { getAllCountries, getRegionsForCountry } from '@/utils/countryData';
import { Plus, Save, X } from 'lucide-react';
import type { BucketlistItem } from '@/types';

interface BucketlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  bucketlistItem?: BucketlistItem | null;
}

interface BucketlistFormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  roleId: string;
  visionId: string;
  dueDate: string;
  bucketlistType: string;
  country: string;
  state: string;
  city: string;
  experienceCategory: string;
}

export function BucketlistModal({ isOpen, onClose, mode, bucketlistItem }: BucketlistModalProps) {
  // const [bucketlistItems] = useAtom(bucketlistAtom);
  const [, addBucketlistItem] = useAtom(addBucketlistItemAtom);
  const [, updateBucketlistItem] = useAtom(updateBucketlistItemAtom);
  const [roles] = useAtom(rolesAtom);
  const [settings] = useAtom(settingsAtom);
  const [visions] = useAtom(visionsAtom);

  // Use settings mirror system for bucketlist settings
  const bucketlistSettings = useBucketlistSettings();

  const [formData, setFormData] = useState<BucketlistFormData>({
    title: '',
    description: '',
    category: '',
    priority: '',
    status: 'in-progress',
    roleId: '',
    visionId: '',
    dueDate: '',
    bucketlistType: '',
    country: 'United States',
    state: 'Please Select',
    city: '',
    experienceCategory: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when modal opens or item changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && bucketlistItem) {
        setFormData({
          title: bucketlistItem.title,
          description: bucketlistItem.description || '',
          category: bucketlistItem.category || (bucketlistSettings.bucketlistCategories || [])[0]?.name || 'Adventure',
          priority: (bucketlistItem.priority === 'Q1' || bucketlistItem.priority === 'Q2' || bucketlistItem.priority === 'Q3' || bucketlistItem.priority === 'Q4') 
            ? 'high' : bucketlistItem.priority === 'high' ? 'high' : bucketlistItem.priority === 'medium' ? 'medium' : 'low',
          status: (bucketlistItem.status === 'in-progress' || bucketlistItem.status === 'completed' || bucketlistItem.status === 'not-started' || bucketlistItem.status === 'on-hold') 
            ? bucketlistItem.status : 'not-started',
          roleId: bucketlistItem.roleId || 'none',
          visionId: bucketlistItem.visionId || 'none',
          dueDate: bucketlistItem.dueDate || '',
          bucketlistType: bucketlistItem.bucketlistType || 'location',
          country: bucketlistItem.country || 'United States',
          state: bucketlistItem.state || 'none',
          city: bucketlistItem.city || '',
          experienceCategory: bucketlistItem.experienceCategory || ''
        });
      } else {
        // Reset form for add mode
        setFormData({
          title: '',
          description: '',
          category: '',
          priority: '',
          status: 'in-progress',
          roleId: '',
          visionId: '',
          dueDate: '',
          bucketlistType: '',
          country: 'United States',
          state: 'Please Select',
          city: '',
          experienceCategory: ''
        });
      }
    }
  }, [isOpen, mode, bucketlistItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.bucketlistType) return;
    
    // Validate location fields if bucketlist type is location
    if (formData.bucketlistType === 'location') {
      if (!formData.country || !formData.state || !formData.city) {
        alert('Country, State, and City are required for location items');
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const bucketlistData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: (formData.priority || 'medium') as 'high' | 'medium' | 'low',
        status: (formData.status || 'in-progress') as 'in-progress' | 'completed',
        roleId: formData.roleId === '' || formData.roleId === 'none' ? undefined : formData.roleId,
        visionId: formData.visionId === '' || formData.visionId === 'none' ? undefined : formData.visionId,
        dueDate: formData.dueDate || undefined,
        bucketlistType: (formData.bucketlistType || 'location') as 'location' | 'experience',
        country: formData.bucketlistType === 'location' ? formData.country : undefined,
        state: formData.bucketlistType === 'location' ? (formData.state === 'none' ? '' : formData.state) : undefined,
        city: formData.bucketlistType === 'location' ? formData.city : undefined,
        experienceCategory: formData.bucketlistType === 'experience' ? formData.experienceCategory : undefined,
        order: 0,
      };

      if (mode === 'add') {
        addBucketlistItem(bucketlistData);
      } else if (mode === 'edit' && bucketlistItem) {
        updateBucketlistItem(bucketlistItem.id, bucketlistData);
      }

      onClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-select Travel category when location bucketlist type is selected
      if (field === 'bucketlistType' && value === 'location') {
        newData.category = 'Travel';
      }
      
      // Clear state when country changes from US to something else
      if (field === 'country' && value !== 'United States') {
        newData.state = 'Please Select';
        newData.city = '';
      }
      
      // Clear city when state changes
      if (field === 'state') {
        newData.city = '';
      }
      
      return newData;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {mode === 'add' ? 'Add Bucketlist Item' : 'Edit Bucketlist Item'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' 
              ? 'Add a new item to your bucketlist' 
              : 'Update your bucketlist item'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Title *
            </label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter bucketlist item title..."
              required
              className="w-full min-h-[44px]"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description
            </label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe this bucketlist item..."
              className="w-full min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="bucketlistType" className="text-sm font-medium">
              Bucketlist Type *
            </label>
            <Select
              value={formData.bucketlistType}
              onValueChange={(value) => handleInputChange('bucketlistType', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bucketlist type..." />
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {(bucketlistSettings.bucketlistCategories || []).map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        {category.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="priority" className="text-sm font-medium">
                Priority
              </label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleInputChange('priority', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {[
                    { value: 'low', label: 'Low Priority', color: bucketlistSettings.getPriorityColor('low') },
                    { value: 'medium', label: 'Medium Priority', color: bucketlistSettings.getPriorityColor('medium') },
                    { value: 'high', label: 'High Priority', color: bucketlistSettings.getPriorityColor('high') }
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium">
                Status
              </label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {(bucketlistSettings.statusColors ? Object.keys(bucketlistSettings.statusColors) : ['not-started', 'in-progress', 'completed', 'on-hold']).map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: bucketlistSettings.getStatusColor(status) }}
                        />
                        {status}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="dueDate" className="text-sm font-medium">
                Due Date
              </label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="w-full min-h-[44px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium">
                Role
              </label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => handleInputChange('roleId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role..." />
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

            <div className="space-y-2">
              <label htmlFor="vision" className="text-sm font-medium">
                Vision
              </label>
              <Select
                value={formData.visionId}
                onValueChange={(value) => handleInputChange('visionId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vision..." />
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

          {/* Conditional fields based on bucketlist type */}
          {formData.bucketlistType === 'location' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                    placeholder="Type to search countries..."
                    options={getAllCountries().map((country) => ({
                      value: country,
                      label: country
                    }))}
                    className="w-full min-h-[44px]"
                  />
                </div>
                
                {formData.country === 'United States' && (
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                    State <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.state === 'none' ? '' : formData.state}
                    onValueChange={(value) => handleInputChange('state', value || 'none')}
                    placeholder="Type to search states..."
                    options={[
                      ...(bucketlistSettings.usStates?.map((state) => ({
                        value: state,
                        label: state
                      })) || []),
                      { value: 'DC', label: 'District of Columbia' }
                    ]}
                    className="w-full min-h-[44px]"
                  />
                </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City <span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={formData.city}
                    onValueChange={(value) => handleInputChange('city', value)}
                    placeholder="Type to search cities..."
                    options={getCitiesForState(formData.state === 'none' ? '' : formData.state).map((city) => ({
                      value: city,
                      label: city
                    }))}
                    className="w-full min-h-[44px]"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label htmlFor="experienceCategory" className="text-sm font-medium">
                Experience Category
              </label>
              <Input
                id="experienceCategory"
                value={formData.experienceCategory}
                onChange={(e) => handleInputChange('experienceCategory', e.target.value)}
                placeholder="e.g., Adventure, Learning, Achievement..."
                className="w-full min-h-[44px]"
              />
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.bucketlistType || 
                (formData.bucketlistType === 'location' && (!formData.country || !formData.state || !formData.city))}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Item' : 'Update Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
