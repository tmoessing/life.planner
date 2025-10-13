import { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  bucketlistAtom, 
  addBucketlistItemAtom, 
  updateBucketlistItemAtom, 
  deleteBucketlistItemAtom,
  settingsAtom,
  rolesAtom,
  visionsAtom
} from '@/stores/appStore';
import { useBucketlistSettings } from '@/utils/settingsMirror';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, CheckCircle, Circle, Star, Filter, MapPin, Calendar, User, Target } from 'lucide-react';
import { BucketlistModal } from '@/components/modals/BucketlistModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import type { BucketlistItem, Priority } from '@/types';

export function BucketlistView() {
  const [bucketlistItems] = useAtom(bucketlistAtom);
  const [, addBucketlistItem] = useAtom(addBucketlistItemAtom);
  const [, updateBucketlistItem] = useAtom(updateBucketlistItemAtom);
  const [, deleteBucketlistItem] = useAtom(deleteBucketlistItemAtom);
  const [settings] = useAtom(settingsAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);

  // Use settings mirror system for bucketlist settings
  const bucketlistSettings = useBucketlistSettings();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<BucketlistItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'in-progress' | 'on-hold'>('all');
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BucketlistItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form state for inline editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '' as 'low' | 'medium' | 'high' | '',
    status: '' as 'not-started' | 'in-progress' | 'completed' | 'on-hold' | '',
    bucketlistType: '',
    category: '',
    dueDate: '',
    roleId: '',
    visionId: '',
    country: '',
    state: '',
    city: '',
    experienceCategory: ''
  });

  const handleAddItem = () => {
    setModalMode('add');
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      type: '',
      priority: '',
      status: '',
      bucketlistType: '',
      category: '',
      dueDate: '',
      roleId: '',
      visionId: '',
      country: '',
      state: '',
      city: '',
      experienceCategory: ''
    });
    setIsModalOpen(true);
  };

  const handleEditItem = (item: BucketlistItem) => {
    setModalMode('edit');
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      type: '',
      priority: (item.priority === 'Q1' || item.priority === 'Q2' || item.priority === 'Q3' || item.priority === 'Q4') ? '' : (item.priority || ''),
      status: item.status || '',
      bucketlistType: item.bucketlistType || '',
      category: item.category || '',
      dueDate: item.dueDate || '',
      roleId: item.roleId || '',
      visionId: item.visionId || '',
      country: item.country || '',
      state: item.state || '',
      city: item.city || '',
      experienceCategory: item.experienceCategory || ''
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (item: BucketlistItem) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      deleteBucketlistItem(itemToDelete.id);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateItem = (item: BucketlistItem) => {
    updateBucketlistItem(item.id, {
      title: formData.title,
      description: formData.description,
      priority: formData.priority || 'medium' as Priority,
      status: formData.status || 'not-started' as 'not-started' | 'in-progress' | 'completed' | 'on-hold'
    });
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      priority: '',
      status: '',
      bucketlistType: '',
      category: '',
      dueDate: '',
      roleId: '',
      visionId: '',
      country: '',
      state: '',
      city: '',
      experienceCategory: ''
    });
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleToggleComplete = (itemId: string, completed: boolean) => {
    updateBucketlistItem(itemId, { 
      completed,
      completedAt: completed ? new Date().toISOString() : undefined
    });
  };


  const getPriorityColor = (priority: Priority) => {
    // Map Q1-Q4 priorities to bucketlist priority format
    const priorityMap: Record<Priority, string> = {
      'Q1': 'high',
      'Q2': 'medium', 
      'Q3': 'low',
      'Q4': 'low',
      'high': 'high',
      'medium': 'medium',
      'low': 'low'
    };
    
    const mappedPriority = priorityMap[priority] || 'low';
    const priorityColors = {
      low: bucketlistSettings.getPriorityColor('low'),
      medium: bucketlistSettings.getPriorityColor('medium'), 
      high: bucketlistSettings.getPriorityColor('high')
    };
    const color = priorityColors[mappedPriority as keyof typeof priorityColors] || '#6B7280';
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`
    };
  };

  const convertPriority = (priority: Priority): 'low' | 'medium' | 'high' => {
    if (priority === 'Q1' || priority === 'high') return 'high';
    if (priority === 'Q2' || priority === 'medium') return 'medium';
    return 'low';
  };

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return <Star className="h-3 w-3 fill-current" />;
      case 'medium':
        return <Star className="h-3 w-3" />;
      case 'low':
        return null;
      default:
        return null;
    }
  };

  // Filter items based on current filter
  const filteredItems = bucketlistItems.filter(item => {
    if (filter === 'completed') return item.completed || item.status === 'completed';
    if (filter === 'pending') return !item.completed && item.status !== 'completed';
    if (filter === 'in-progress') return item.status === 'in-progress';
    if (filter === 'on-hold') return item.status === 'on-hold';
    return true; // 'all'
  });

  // Group items by bucketlistType and sort within each group
  const groupedItems = filteredItems.reduce((groups, item) => {
    const type = item.bucketlistType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(item);
    return groups;
  }, {} as Record<string, typeof filteredItems>);

  // Sort items within each group: completed last, then by priority, then by location (for locations), then by title
  Object.keys(groupedItems).forEach(type => {
    groupedItems[type].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // pending first
      }
      
      const priorityOrder = { 
        'Q1': 4, 'Q2': 3, 'Q3': 2, 'Q4': 1,
        'high': 3, 'medium': 2, 'low': 1 
      };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // high priority first
      }
      
      // For location items, sort by state then city
      if (type === 'location') {
        const aState = a.state || '';
        const bState = b.state || '';
        const aCity = a.city || '';
        const bCity = b.city || '';
        
        if (aState !== bState) {
          return aState.localeCompare(bState);
        }
        if (aCity !== bCity) {
          return aCity.localeCompare(bCity);
        }
      }
      
      return a.title.localeCompare(b.title);
    });
  });

  // For location items, create sub-groups by location (city, state)
  const getLocationKey = (item: BucketlistItem) => {
    if (item.bucketlistType !== 'location') return null;
    const city = item.city || 'Unknown City';
    const state = item.state || 'Unknown State';
    return `${city}, ${state}`;
  };

  const getLocationSubGroups = (items: typeof filteredItems) => {
    const subGroups: Record<string, typeof filteredItems> = {};
    
    items.forEach(item => {
      const locationKey = getLocationKey(item);
      if (locationKey) {
        if (!subGroups[locationKey]) {
          subGroups[locationKey] = [];
        }
        subGroups[locationKey].push(item);
      }
    });
    
    return subGroups;
  };

  const completedCount = bucketlistItems.filter(item => item.completed).length;
  const totalCount = bucketlistItems.length;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Bucketlist</h2>
            <p className="text-sm text-muted-foreground">
              Track your life experiences and dreams
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddItem}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Item</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* View Toggle - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <div className="flex items-center bg-muted rounded-lg p-1 w-full sm:w-auto">
              <button
                onClick={() => setFilter('in-progress')}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === 'in-progress'
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
                  <Circle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">In Progress</span>
                  <span className="xs:hidden">Active</span>
                </div>
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === 'completed' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Completed</span>
                  <span className="xs:hidden">Done</span>
                </div>
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`flex-1 sm:flex-none px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === 'all' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5 justify-center">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">All</span>
                  <span className="xs:hidden">All</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            {filter === 'pending' && `${totalCount - completedCount} in progress items`}
            {filter === 'completed' && `${completedCount} completed items`}
            {filter === 'all' && `${totalCount} total items`}
            {totalCount > 0 && (
              <div className="mt-1 sm:mt-0 sm:ml-2 inline-block">
                <span className="text-xs bg-muted px-2 py-1 rounded-full">
                  {Math.round((completedCount / totalCount) * 100)}% complete ({completedCount}/{totalCount})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Bucketlist Modal */}
      <BucketlistModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        bucketlistItem={editingItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Bucketlist Item"
        description="This will permanently remove the item from your bucketlist."
        itemName={itemToDelete?.title}
        isDeleting={isDeleting}
      />

      {/* Add/Edit Form - REMOVED - Now using modal */}
      {false && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Bucketlist Item' : 'Add New Bucketlist Item'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter bucketlist item..."
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter description..."
                className="mt-1"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bucketlist Type</label>
              <Select
                value={formData.bucketlistType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bucketlistType: value as 'location' | 'experience' }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select bucketlist type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
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
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {['Adventure', 'Travel', 'Learning', 'Experience', 'Achievement', 'Personal'].map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'low' | 'medium' | 'high' }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {['low', 'medium', 'high'].map((priority) => (
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'not-started' | 'in-progress' | 'completed' | 'on-hold' }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
              </div>

              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select
                  value={formData.roleId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, roleId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Vision</label>
                <Select
                  value={formData.visionId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visionId: value }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select vision..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
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
                <h4 className="text-sm font-medium">Location Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger className="mt-1">
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
                  
                  <div>
                    <label className="text-sm font-medium">State/Province</label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      placeholder="State or Province"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">City</label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium">Experience Category</label>
                <Input
                  value={formData.experienceCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, experienceCategory: e.target.value }))}
                  placeholder="e.g., Adventure, Learning, Achievement..."
                  className="mt-1"
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={editingItem ? () => editingItem && handleUpdateItem(editingItem) : () => {
                  if (!formData.title.trim()) return;
                  
                  const newItem = {
                    title: formData.title.trim(),
                    description: formData.description.trim(),
                    category: formData.category || undefined,
                    priority: formData.priority || 'medium' as Priority,
                    status: formData.status || 'not-started' as 'not-started' | 'in-progress' | 'completed' | 'on-hold',
                    roleId: formData.roleId || undefined,
                    visionId: formData.visionId || undefined,
                    dueDate: formData.dueDate || undefined,
                    bucketlistType: formData.bucketlistType as 'location' | 'experience',
                    country: formData.bucketlistType === 'location' ? formData.country || undefined : undefined,
                    state: formData.bucketlistType === 'location' ? formData.state || undefined : undefined,
                    city: formData.bucketlistType === 'location' ? formData.city || undefined : undefined,
                    experienceCategory: formData.bucketlistType === 'experience' ? formData.experienceCategory || undefined : undefined,
                    order: 0,
                    completed: false,
                  };
                  
                  addBucketlistItem(newItem);
                  handleCancel();
                }}
                disabled={!formData.title.trim()}
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bucketlist Items */}
      <div className="space-y-6">
        {filteredItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8 sm:py-12">
              <div className="text-muted-foreground mb-4">
                <Circle className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">No Bucketlist Items Yet</h3>
                <p className="text-sm sm:text-base">Start by adding your first bucketlist item</p>
              </div>
              <Button onClick={handleAddItem} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          // Render grouped items with headers - Experiences first, then Locations
          ['experience', 'location'].map((type) => {
            const items = groupedItems[type] || [];
            if (items.length === 0) return null;
            
            return (
            <div key={type} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full"
                    style={{ 
                      backgroundColor: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === type)?.color || '#6B7280' 
                    }}
                  />
                  <h3 className="text-base sm:text-lg font-semibold capitalize">
                    {type === 'location' ? 'Locations' : 'Experiences'}
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs sm:text-sm">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              
              {/* Items in this group */}
              <div className="space-y-4">
                {type === 'location' ? (
                  // For location items, show sub-groups by location
                  Object.entries(getLocationSubGroups(items)).map(([locationKey, locationItems]) => (
                    <div key={locationKey} className="space-y-3">
                      {/* Location sub-header */}
                      <div className="flex items-center gap-2 ml-2 sm:ml-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <h4 className="text-sm sm:text-md font-medium text-muted-foreground truncate">
                            {locationKey}
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {locationItems.length} {locationItems.length === 1 ? 'item' : 'items'}
                        </Badge>
                      </div>
                      
                      {/* Items in this location */}
                      <div className="space-y-3 ml-2 sm:ml-8">
                        {locationItems.map((item) => (
            <Card key={item.id} className={`hover:shadow-md transition-shadow ${
              item.completed ? 'opacity-75 bg-green-50' : ''
            }`}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => handleToggleComplete(item.id, !!checked)}
                    className="mt-1 flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold text-base sm:text-lg break-words ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className={`text-muted-foreground mt-1 text-sm break-words ${item.completed ? 'line-through' : ''}`}>
                            {item.description}
                          </p>
                        )}
                        
                        {/* Additional details based on item type */}
                        {item.bucketlistType === 'location' && (item.country || item.state || item.city) && (
                          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">
                              {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {item.bucketlistType === 'experience' && item.experienceCategory && (
                          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">Category: {item.experienceCategory}</span>
                          </div>
                        )}
                        
                        {item.dueDate && (
                          <div className="mt-2 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                            <span className="truncate">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {/* Role and Vision information */}
                        {(item.roleId || item.visionId) && (
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                            {item.roleId && (
                              <div className="flex items-center gap-1 min-w-0">
                                <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{roles.find(r => r.id === item.roleId)?.name || 'Unknown Role'}</span>
                              </div>
                            )}
                            {item.visionId && (
                              <div className="flex items-center gap-1 min-w-0">
                                <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                                <span className="truncate">{visions.find(v => v.id === item.visionId)?.title || 'Unknown Vision'}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        
                        <div className="flex items-center gap-1 sm:gap-2 mt-2 flex-wrap">
                          <Badge 
                            className="text-xs"
                            style={{
                              backgroundColor: getPriorityColor(item.priority).backgroundColor,
                              color: getPriorityColor(item.priority).color,
                              borderColor: getPriorityColor(item.priority).borderColor
                            }}
                          >
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(convertPriority(item.priority))}
                              <span className="hidden xs:inline">{item.priority}</span>
                              <span className="xs:hidden">{item.priority.charAt(0).toUpperCase()}</span>
                            </div>
                          </Badge>
                          
                          {item.bucketlistType && (
                            <Badge 
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280',
                                color: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280'
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                                  style={{ backgroundColor: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280' }}
                                />
                                <span className="hidden xs:inline">{item.bucketlistType === 'location' ? 'Location' : 'Experience'}</span>
                                <span className="xs:hidden">{item.bucketlistType === 'location' ? 'L' : 'E'}</span>
                              </div>
                            </Badge>
                          )}
                          
                          {item.category && (
                            <Badge variant="outline" className="text-xs">
                              <span className="hidden xs:inline">{item.category}</span>
                              <span className="xs:hidden">{item.category.charAt(0).toUpperCase()}</span>
                            </Badge>
                          )}


                          {item.status && item.status !== 'not-started' && (
                            <Badge 
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: settings.statusColors?.[item.status] || '#6B7280',
                                color: settings.statusColors?.[item.status] || '#6B7280'
                              }}
                            >
                              <span className="hidden xs:inline">{item.status}</span>
                              <span className="xs:hidden">{item.status.charAt(0).toUpperCase()}</span>
                            </Badge>
                          )}

                          {item.completed && item.completedAt && (
                            <Badge variant="outline" className="text-green-600 border-green-200 text-xs">
                              <span className="hidden xs:inline">Completed {new Date(item.completedAt).toLocaleDateString()}</span>
                              <span className="xs:hidden">✓ {new Date(item.completedAt).toLocaleDateString()}</span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-1 mt-2 sm:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="h-8 w-8 p-0 touch-manipulation"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  // For experience items, show directly without sub-groups
                  items.map((item) => (
            <Card key={item.id} className={`hover:shadow-md transition-shadow ${
              item.completed ? 'opacity-75 bg-green-50' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => handleToggleComplete(item.id, !!checked)}
                    className="mt-1"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`font-semibold text-lg ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className={`text-muted-foreground mt-1 ${item.completed ? 'line-through' : ''}`}>
                            {item.description}
                          </p>
                        )}
                        
                        {/* Additional details based on item type */}
                        {item.bucketlistType === 'location' && (item.country || item.state || item.city) && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                        
                        {item.bucketlistType === 'experience' && item.experienceCategory && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4" />
                            <span>Category: {item.experienceCategory}</span>
                          </div>
                        )}
                        
                        {item.dueDate && (
                          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        
                        {/* Role and Vision information */}
                        {(item.roleId || item.visionId) && (
                          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                            {item.roleId && (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{roles.find(r => r.id === item.roleId)?.name || 'Unknown Role'}</span>
                              </div>
                            )}
                            {item.visionId && (
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span>{visions.find(v => v.id === item.visionId)?.title || 'Unknown Vision'}</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge 
                            style={{
                              backgroundColor: getPriorityColor(item.priority).backgroundColor,
                              color: getPriorityColor(item.priority).color,
                              borderColor: getPriorityColor(item.priority).borderColor
                            }}
                          >
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(convertPriority(item.priority))}
                              {item.priority}
                            </div>
                          </Badge>
                          
                          {item.bucketlistType && (
                            <Badge 
                              variant="outline"
                              style={{
                                borderColor: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280',
                                color: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280'
                              }}
                            >
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280' }}
                                />
                                {item.bucketlistType === 'location' ? 'Location' : 'Experience'}
                              </div>
                            </Badge>
                          )}
                          
                          {item.category && (
                            <Badge variant="outline">
                              {item.category}
                            </Badge>
                          )}

                          {item.status && item.status !== 'not-started' && (
                            <Badge 
                              variant="outline"
                              style={{
                                borderColor: settings.statusColors?.[item.status] || '#6B7280',
                                color: settings.statusColors?.[item.status] || '#6B7280'
                              }}
                            >
                              {item.status}
                            </Badge>
                          )}

                          {item.completed && item.completedAt && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              Completed {new Date(item.completedAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 sm:gap-1 mt-2 sm:mt-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="h-8 w-8 p-0 touch-manipulation"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
                  ))
                )}
              </div>
            </div>
            );
          }).filter(Boolean)
        )}
      </div>
    </div>
  );
}
