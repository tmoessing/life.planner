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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Plus, Save, X } from 'lucide-react';
import type { BucketlistItem } from '@/types';

interface BucketlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  bucketlistItem?: BucketlistItem | null;
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

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: (bucketlistSettings.bucketlistCategories || [])[0]?.name || 'Adventure',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: (bucketlistSettings.statusColors ? Object.keys(bucketlistSettings.statusColors)[0] : 'not-started') as string,
    roleId: 'none',
    visionId: 'none',
    dueDate: '',
    bucketlistType: 'location' as 'location' | 'experience',
    country: 'US',
    state: 'none',
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
          country: bucketlistItem.country || 'US',
          state: bucketlistItem.state || 'none',
          city: bucketlistItem.city || '',
          experienceCategory: bucketlistItem.experienceCategory || ''
        });
      } else {
        // Reset form for add mode
        setFormData({
          title: '',
          description: '',
          category: (bucketlistSettings.bucketlistCategories || [])[0]?.name || 'Adventure',
          priority: 'medium',
          status: (bucketlistSettings.statusColors ? Object.keys(bucketlistSettings.statusColors)[0] : 'not-started'),
          roleId: 'none',
          visionId: 'none',
          dueDate: '',
          bucketlistType: 'location',
          country: 'US',
        state: 'none',
          city: '',
          experienceCategory: ''
        });
      }
    }
  }, [isOpen, mode, bucketlistItem]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setIsSubmitting(true);
    
    try {
      const bucketlistData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority as 'high' | 'medium' | 'low',
        status: formData.status as 'in-progress' | 'completed' | 'not-started' | 'on-hold',
        roleId: formData.roleId === 'none' ? undefined : formData.roleId,
        visionId: formData.visionId === 'none' ? undefined : formData.visionId,
        dueDate: formData.dueDate || undefined,
        bucketlistType: formData.bucketlistType,
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
      
      // Clear state when country changes from US to something else
      if (field === 'country' && value !== 'US') {
        newData.state = 'none';
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
              Bucketlist Type
            </label>
            <Select
              value={formData.bucketlistType}
              onValueChange={(value) => handleInputChange('bucketlistType', value)}
            >
              <SelectTrigger>
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
                  <SelectValue />
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
                  <SelectValue />
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
                  <SelectValue />
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
                    Country
                  </label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                  >
                    <SelectTrigger>
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
                </div>
                
                {formData.country === 'US' && (
                <div className="space-y-2">
                  <label htmlFor="state" className="text-sm font-medium">
                      State
                  </label>
                    <Select
                    value={formData.state}
                      onValueChange={(value) => handleInputChange('state', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="AL">Alabama</SelectItem>
                        <SelectItem value="AK">Alaska</SelectItem>
                        <SelectItem value="AZ">Arizona</SelectItem>
                        <SelectItem value="AR">Arkansas</SelectItem>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="CO">Colorado</SelectItem>
                        <SelectItem value="CT">Connecticut</SelectItem>
                        <SelectItem value="DE">Delaware</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        <SelectItem value="GA">Georgia</SelectItem>
                        <SelectItem value="HI">Hawaii</SelectItem>
                        <SelectItem value="ID">Idaho</SelectItem>
                        <SelectItem value="IL">Illinois</SelectItem>
                        <SelectItem value="IN">Indiana</SelectItem>
                        <SelectItem value="IA">Iowa</SelectItem>
                        <SelectItem value="KS">Kansas</SelectItem>
                        <SelectItem value="KY">Kentucky</SelectItem>
                        <SelectItem value="LA">Louisiana</SelectItem>
                        <SelectItem value="ME">Maine</SelectItem>
                        <SelectItem value="MD">Maryland</SelectItem>
                        <SelectItem value="MA">Massachusetts</SelectItem>
                        <SelectItem value="MI">Michigan</SelectItem>
                        <SelectItem value="MN">Minnesota</SelectItem>
                        <SelectItem value="MS">Mississippi</SelectItem>
                        <SelectItem value="MO">Missouri</SelectItem>
                        <SelectItem value="MT">Montana</SelectItem>
                        <SelectItem value="NE">Nebraska</SelectItem>
                        <SelectItem value="NV">Nevada</SelectItem>
                        <SelectItem value="NH">New Hampshire</SelectItem>
                        <SelectItem value="NJ">New Jersey</SelectItem>
                        <SelectItem value="NM">New Mexico</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="NC">North Carolina</SelectItem>
                        <SelectItem value="ND">North Dakota</SelectItem>
                        <SelectItem value="OH">Ohio</SelectItem>
                        <SelectItem value="OK">Oklahoma</SelectItem>
                        <SelectItem value="OR">Oregon</SelectItem>
                        <SelectItem value="PA">Pennsylvania</SelectItem>
                        <SelectItem value="RI">Rhode Island</SelectItem>
                        <SelectItem value="SC">South Carolina</SelectItem>
                        <SelectItem value="SD">South Dakota</SelectItem>
                        <SelectItem value="TN">Tennessee</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="UT">Utah</SelectItem>
                        <SelectItem value="VT">Vermont</SelectItem>
                        <SelectItem value="VA">Virginia</SelectItem>
                        <SelectItem value="WA">Washington</SelectItem>
                        <SelectItem value="WV">West Virginia</SelectItem>
                        <SelectItem value="WI">Wisconsin</SelectItem>
                        <SelectItem value="WY">Wyoming</SelectItem>
                        <SelectItem value="DC">District of Columbia</SelectItem>
                      </SelectContent>
                    </Select>
                </div>
                )}
                
                <div className="space-y-2">
                  <label htmlFor="city" className="text-sm font-medium">
                    City
                  </label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
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
              disabled={isSubmitting || !formData.title.trim()}
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
