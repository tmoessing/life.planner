import { useRef, useState } from 'react';
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
import { bucketlistStatusesAtom } from '@/stores/statusStore';
import { formatLocationDisplay } from '@/utils/formatting';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { getCitiesForState } from '@/utils/cityData';
import { Plus, Edit, Trash2, CheckCircle, Circle, Star, Filter, MapPin, Map, Calendar, User, Target, LayoutGrid, Trophy, Plane, Sparkles, GraduationCap, Award, Mountain } from 'lucide-react';
import { BucketlistModal } from '@/components/modals/BucketlistModal';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import type { BucketlistItem, Priority } from '@/types';

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  const categoryLower = category.toLowerCase();
  if (categoryLower === 'travel') return Plane;
  if (categoryLower === 'experience') return Sparkles;
  if (categoryLower === 'adventure') return Mountain;
  if (categoryLower === 'learning' || categoryLower === 'learn') return GraduationCap;
  if (categoryLower === 'achievement') return Award;
  if (categoryLower === 'personal') return User;
  // Default fallback
  return Star;
};

export function BucketlistView() {
  const [bucketlistItems] = useAtom(bucketlistAtom);
  const [, addBucketlistItem] = useAtom(addBucketlistItemAtom);
  const [, updateBucketlistItem] = useAtom(updateBucketlistItemAtom);
  const [, deleteBucketlistItem] = useAtom(deleteBucketlistItemAtom);
  const { navigateToView } = useNavigation();
  const [settings] = useAtom(settingsAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);
  // Remove the Jotai atom usage since the main app uses local state

  // Use settings mirror system for bucketlist settings
  const bucketlistSettings = useBucketlistSettings();
  const [bucketlistStatuses] = useAtom(bucketlistStatusesAtom);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<BucketlistItem | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'in-progress' | 'on-hold'>('in-progress');
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BucketlistItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Horizontal section navigation (Experiences / Locations)
  const [activeSection, setActiveSection] = useState<'experience' | 'location'>('experience');
  const experienceSectionRef = useRef<HTMLDivElement | null>(null);
  const locationSectionRef = useRef<HTMLDivElement | null>(null);
  
  // Form state for inline editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    priority: '' as 'low' | 'medium' | 'high' | '',
    status: 'in-progress' as 'in-progress' | 'completed',
    bucketlistType: 'experience' as 'location' | 'experience',
    category: 'none',
    dueDate: '',
    roleId: 'none',
    visionId: 'none',
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
      status: 'in-progress',
      bucketlistType: 'experience' as 'location' | 'experience',
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
      status: (item.status === 'completed' ? 'completed' : 'in-progress') as 'in-progress' | 'completed',
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
      status: formData.status || 'in-progress' as 'in-progress' | 'completed'
    });
  };

  const handleCancel = () => {
    setFormData({
      title: '',
      description: '',
      type: '',
      priority: '',
      status: 'in-progress',
      bucketlistType: 'experience' as 'location' | 'experience',
      category: 'none',
      dueDate: '',
      roleId: 'none',
      visionId: 'none',
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
      status: completed ? 'completed' : 'in-progress',
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

  const getPriorityIcon = (_priority: 'low' | 'medium' | 'high') => {
    return <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />;
  };

  const getPriorityLetter = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'H';
      case 'medium': return 'M';
      case 'low': return 'L';
      default: return priority.charAt(0).toUpperCase();
    }
  };

  // Get primary color for card styling (priority > type > category)
  const getCardPrimaryColor = (item: BucketlistItem) => {
    // Priority color takes precedence
    const priorityColor = getPriorityColor(item.priority).color;
    if (priorityColor && priorityColor !== '#6B7280') {
      return priorityColor;
    }
    // Then type color
    const typeColor = settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color;
    if (typeColor) {
      return typeColor;
    }
    // Then category color
    if (item.category) {
      const categoryColor = bucketlistSettings.getCategoryColor(item.category);
      if (categoryColor && categoryColor !== '#6B7280') {
        return categoryColor;
      }
    }
    // Default
    return '#6B7280';
  };

  // Filter items based on current filter
  const filteredItems = bucketlistItems.filter(item => {
    if (filter === 'completed') return item.completed || item.status === 'completed';
    if (filter === 'pending') return !item.completed && item.status !== 'completed';
    if (filter === 'in-progress') return item.status === 'in-progress';
    return true; // 'all'
  });

  // Group items by bucketlistType and sort within each group
  const groupedItems: Record<string, typeof filteredItems> = filteredItems.reduce((groups, item) => {
    const type = item.bucketlistType || 'experience'; // Default to 'experience' if type is missing
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

  const experienceItems = groupedItems['experience'] || [];
  const locationItems = groupedItems['location'] || [];

  // For location items, create sub-groups by location (city, state)
  const getLocationKey = (item: BucketlistItem) => {
    if (item.bucketlistType !== 'location') return null;
    return formatLocationDisplay(item.city, item.state, item.country) || 'Unknown Location';
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

  const scrollToSection = (section: 'experience' | 'location') => {
    setActiveSection(section);

    const targetRef = section === 'experience' ? experienceSectionRef : locationSectionRef;
    if (targetRef.current) {
      targetRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground">
              Track your life experiences and dreams
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Filter Buttons */}
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setFilter('in-progress')}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === 'in-progress'
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Circle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">In Progress</span>
                  <span className="xs:hidden">In Progress</span>
                </div>
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === 'completed' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Completed</span>
                  <span className="xs:hidden">Completed</span>
                </div>
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  filter === 'all' 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">All</span>
                  <span className="xs:hidden">All</span>
                </div>
              </button>
            </div>
            
            {/* Boards and Add Buttons */}
            <Button
              onClick={() => navigateToView('bucketlist-boards')}
              variant="outline"
              className="gap-2 w-auto sm:w-auto"
              size="sm"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleAddItem}
              className="gap-2 w-auto sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Item</span>
            </Button>
          </div>
        </div>
        
      </div>

      {/* Experiences / Locations section nav + completion pill */}
      {totalCount > 0 && (
        <div className="mt-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center justify-start gap-1.5 pb-1 flex-1 min-w-0">
            <button
              onClick={() => scrollToSection('experience')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs whitespace-nowrap transition-colors ${
                activeSection === 'experience'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Experiences</span>
              <span className="text-[10px] sm:text-xs opacity-80">
                {experienceItems.length}
              </span>
            </button>

            <button
              onClick={() => scrollToSection('location')}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs sm:text-sm whitespace-nowrap transition-colors ${
                activeSection === 'location'
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Locations</span>
              <span className="text-[10px] sm:text-xs opacity-80">
                {locationItems.length}
              </span>
            </button>
          </div>

          <div className="text-[11px] sm:text-xs text-muted-foreground mt-1 sm:mt-0">
            <span className="text-[11px] sm:text-xs bg-muted px-2 py-1 rounded-full whitespace-nowrap">
              {Math.round((completedCount / totalCount) * 100)}% complete ({completedCount}/{totalCount})
            </span>
          </div>
        </div>
      )}


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
              <label className="text-sm font-medium">Bucketlist Type *</label>
              <Select
                value={formData.bucketlistType}
                onValueChange={(value) => setFormData(prev => ({ ...prev, bucketlistType: value as 'location' | 'experience' }))}
              >
                <SelectTrigger className="mt-1">
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
                    <SelectItem value="none">None</SelectItem>
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
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'in-progress' | 'completed' }))}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {bucketlistStatuses.map((status) => (
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
                    <SelectItem value="none">None</SelectItem>
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
                    <SelectItem value="none">None</SelectItem>
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
                    <SearchableSelect
                      value={formData.city}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
                      placeholder="Type to search cities..."
                      options={getCitiesForState(formData.state || '').map((city) => ({
                        value: city,
                        label: city
                      }))}
                      className="mt-1"
                      allowCustom={true}
                      customValueLabel="Add custom city"
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
                    category: formData.category === 'none' ? undefined : (formData.category || undefined),
                    priority: formData.priority || 'medium' as Priority,
                    status: formData.status || 'in-progress' as 'in-progress' | 'completed',
                    roleId: formData.roleId === 'none' ? undefined : (formData.roleId || undefined),
                    visionId: formData.visionId === 'none' ? undefined : (formData.visionId || undefined),
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
      <div className="space-y-4">
        {/* Experiences Section */}
        {groupedItems['experience'] && groupedItems['experience'].length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm sm:text-base font-semibold px-1 mb-2">Experiences</h2>
            {groupedItems['experience'].map((item) => {
              const cardColor = getCardPrimaryColor(item);
              const priorityColorObj = getPriorityColor(item.priority);
              return (
                <Card
                  key={item.id}
                  className="relative"
                  style={{
                    backgroundColor: item.completed
                      ? '#F0FDF4' 
                      : `${cardColor}08`,
                    borderColor: `${cardColor}30`
                  }}
                >
                  {/* Priority accent bar */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: priorityColorObj.color }}
                  />
                  {/* Mobile: Single row layout like Gmail */}
                  <div className="sm:hidden p-1.5 flex items-center gap-1.5 min-h-[44px]">
                    {/* Priority indicator */}
                    <div 
                      className="w-1 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: priorityColorObj.color }}
                    />
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(checked) => handleToggleComplete(item.id, !!checked)}
                      className="flex-shrink-0 h-4 w-4"
                    />
                    {/* Title - takes available space */}
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <span className={`text-xs font-medium truncate flex-1 min-w-0 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </span>
                      {item.dueDate && (
                        <div title="Due Date">
                          <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                    {/* Key badges and info - right aligned, compact */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {item.bucketlistType && (
                        <Badge 
                          variant="outline"
                          className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
                          style={{
                            borderColor: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280',
                            color: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280'
                          }}
                        >
                          {item.bucketlistType === 'location' ? 'Loc' : 'Exp'}
                        </Badge>
                      )}
                      {item.completed && (
                        <Badge 
                          style={{ 
                            backgroundColor: '#10B981',
                            color: 'white'
                          }}
                          className="text-[9px] px-1 py-0 h-4"
                        >
                          Done
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditItem(item)}
                        className="h-12 w-12 sm:h-8 sm:w-8 p-0 flex-shrink-0 touch-manipulation"
                      >
                        <Edit className="h-5 w-5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Desktop: Compact card layout */}
                  <div className="hidden sm:block">
                    <CardHeader className="pb-0.5">
                      <div className="flex items-start justify-between gap-1">
                        <div className="flex items-center gap-1 flex-1 min-w-0">
                          <CardTitle className={`text-xs font-medium line-clamp-1 flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {item.title}
                          </CardTitle>
                          {item.dueDate && (
                            <div title="Due Date">
                              <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-0.5 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 sm:h-5 sm:w-5 p-0 touch-manipulation"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditItem(item);
                            }}
                            title="Edit item"
                          >
                            <Edit className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 sm:h-5 sm:w-5 p-0 text-red-500 hover:text-red-700 touch-manipulation"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteItem(item);
                            }}
                            title="Delete item"
                          >
                            <Trash2 className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      {/* Description - optional, can be shown */}
                      {item.description && (
                        <p className={`text-[10px] text-muted-foreground mb-1 line-clamp-1 ${item.completed ? 'line-through' : ''}`}>
                          {item.description}
                        </p>
                      )}

                      {/* Priority, Type, Category, Status - All in one compact row */}
                      <div className="flex items-center gap-1 flex-wrap mb-1">
                        <Badge 
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                          style={getPriorityColor(item.priority)}
                        >
                          <div className="flex items-center gap-0.5">
                            {getPriorityIcon(convertPriority(item.priority))}
                            {getPriorityLetter(item.priority)}
                          </div>
                        </Badge>
                        
                        {item.bucketlistType && (() => {
                          const typeColor = settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280';
                          return (
                          <Badge 
                            variant="outline"
                            className="text-[10px] px-1 py-0"
                            style={{
                              backgroundColor: `${typeColor}20`,
                              borderColor: `${typeColor}40`,
                              color: typeColor
                            }}
                          >
                            <div className="flex items-center gap-0.5">
                              {item.bucketlistType === 'location' ? (
                                <Map className="h-2.5 w-2.5" />
                              ) : (
                                <Star className="h-2.5 w-2.5" />
                              )}
                            </div>
                          </Badge>
                          );
                        })()}
                        
                        {item.category && (() => {
                          const categoryColor = bucketlistSettings.getCategoryColor(item.category);
                          const IconComponent = getCategoryIcon(item.category);
                          return (
                          <Badge 
                            variant="outline"
                            className="text-[10px] px-1 py-0"
                            style={{
                              backgroundColor: `${categoryColor}20`,
                              borderColor: `${categoryColor}40`,
                              color: categoryColor
                            }}
                          >
                            <IconComponent className="h-2.5 w-2.5" />
                          </Badge>
                          );
                        })()}
                        
                        {item.completed && (
                          <Badge 
                            style={{ 
                              backgroundColor: '#10B981',
                              color: 'white'
                            }}
                            className="text-[10px] px-1 py-0"
                          >
                            Done
                          </Badge>
                        )}
                      </div>

                      {/* Location, Experience Category, Due Date - compact badges */}
                      {(item.bucketlistType === 'location' && (item.country || item.state || item.city)) || 
                       (item.bucketlistType === 'experience' && item.experienceCategory) ||
                       item.dueDate ? (
                        <div className="flex items-center gap-1 flex-wrap mb-1">
                          {item.bucketlistType === 'location' && (item.country || item.state || item.city) && (
                            <Badge 
                              variant="outline"
                              className="text-[10px] px-1 py-0 flex items-center gap-0.5"
                            >
                              <MapPin className="h-2.5 w-2.5" />
                              {[item.city, item.state, item.country].filter(Boolean).slice(0, 2).join(', ')}
                            </Badge>
                          )}
                          {item.bucketlistType === 'experience' && item.experienceCategory && (
                            <Badge 
                              variant="outline"
                              className="text-[10px] px-1 py-0 flex items-center gap-0.5"
                            >
                              <Star className="h-2.5 w-2.5" />
                              {item.experienceCategory.substring(0, 8)}
                            </Badge>
                          )}
                          {item.dueDate && (
                            <Badge 
                              variant="outline"
                              className="text-[10px] px-1 py-0 flex items-center gap-0.5"
                            >
                              <Calendar className="h-2.5 w-2.5" />
                              {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Badge>
                          )}
                        </div>
                      ) : null}

                      {/* Role, Vision - compact badges */}
                      {(item.roleId || item.visionId) && (
                        <div className="flex flex-wrap gap-0.5 mb-0.5">
                          {item.roleId && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 flex items-center gap-0.5">
                              <User className="h-2 w-2" />
                              {roles.find(r => r.id === item.roleId)?.name.substring(0, 8) || 'Role'}
                            </Badge>
                          )}
                          {item.visionId && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 flex items-center gap-0.5">
                              <Target className="h-2 w-2" />
                              {visions.find(v => v.id === item.visionId)?.title.substring(0, 8) || 'Vision'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Locations Section */}
        {Object.entries(groupedItems).map(([type, items]) => {
          if (type === 'location' && items.length > 0) {
            const locationSubGroups = getLocationSubGroups(items);
            return (
              <div key={type} className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold px-1 mb-2">Locations</h2>
                {Object.entries(locationSubGroups).map(([locationKey, locationItems]) => (
                  <div key={locationKey} className="space-y-2">
                    <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground px-1">
                      {locationKey}
                    </h3>
                {locationItems.map((item) => {
                  const cardColor = getCardPrimaryColor(item);
                  const priorityColorObj = getPriorityColor(item.priority);
                  return (
                    <Card
                      key={item.id}
                      className="relative"
                      style={{
                        backgroundColor: item.completed
                          ? '#F0FDF4' 
                          : `${cardColor}08`,
                        borderColor: `${cardColor}30`
                      }}
                    >
              {/* Priority accent bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ backgroundColor: priorityColorObj.color }}
              />
              {/* Mobile: Single row layout like Gmail */}
              <div className="sm:hidden p-1.5 flex items-center gap-1.5 min-h-[44px]">
                {/* Priority indicator */}
                <div 
                  className="w-1 h-6 rounded-full flex-shrink-0"
                  style={{ backgroundColor: priorityColorObj.color }}
                />
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={(checked) => handleToggleComplete(item.id, !!checked)}
                  className="flex-shrink-0 h-4 w-4"
                />
                {/* Title - takes available space */}
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className={`text-xs font-medium truncate flex-1 min-w-0 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {item.title}
                  </span>
                  {item.dueDate && (
                    <div title="Due Date">
                      <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    </div>
                  )}
                </div>
                {/* Key badges and info - right aligned, compact */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {item.bucketlistType && (
                    <Badge 
                      variant="outline"
                      className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
                      style={{
                        borderColor: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280',
                        color: settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280'
                      }}
                    >
                      {item.bucketlistType === 'location' ? 'Loc' : 'Exp'}
                    </Badge>
                  )}
                  {item.completed && (
                    <Badge 
                      style={{ 
                        backgroundColor: '#10B981',
                        color: 'white'
                      }}
                      className="text-[9px] px-1 py-0 h-4"
                    >
                      Done
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditItem(item)}
                    className="h-12 w-12 sm:h-8 sm:w-8 p-0 flex-shrink-0 touch-manipulation"
                  >
                    <Edit className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              </div>

              {/* Desktop: Compact card layout */}
              <div className="hidden sm:block">
                <CardHeader className="pb-0.5">
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex items-center gap-1 flex-1 min-w-0">
                      <CardTitle className={`text-xs font-medium line-clamp-1 flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {item.title}
                      </CardTitle>
                      {item.dueDate && (
                        <div title="Due Date">
                          <Calendar className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-0.5 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 sm:h-5 sm:w-5 p-0 touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditItem(item);
                        }}
                        title="Edit item"
                      >
                        <Edit className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 sm:h-5 sm:w-5 p-0 text-red-500 hover:text-red-700 touch-manipulation"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItem(item);
                        }}
                        title="Delete item"
                      >
                        <Trash2 className="h-3 w-3 sm:h-2.5 sm:w-2.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  {/* Description - optional, can be shown */}
                  {item.description && (
                    <p className={`text-[10px] text-muted-foreground mb-1 line-clamp-1 ${item.completed ? 'line-through' : ''}`}>
                      {item.description}
                    </p>
                  )}

                  {/* Priority, Type, Category, Status - All in one compact row */}
                  <div className="flex items-center gap-1 flex-wrap mb-1">
                    <Badge 
                      variant="outline"
                      className="text-[10px] px-1 py-0"
                      style={getPriorityColor(item.priority)}
                    >
                      <div className="flex items-center gap-0.5">
                        {getPriorityIcon(convertPriority(item.priority))}
                        {getPriorityLetter(item.priority)}
                      </div>
                    </Badge>
                    
                    {item.bucketlistType && (() => {
                      const typeColor = settings.bucketlistTypes?.find(t => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280';
                      return (
                      <Badge 
                        variant="outline"
                        className="text-[10px] px-1 py-0"
                        style={{
                          backgroundColor: `${typeColor}20`,
                          borderColor: `${typeColor}40`,
                          color: typeColor
                        }}
                      >
                        <div className="flex items-center gap-0.5">
                          {item.bucketlistType === 'location' ? (
                            <Map className="h-2.5 w-2.5" />
                          ) : (
                            <Star className="h-2.5 w-2.5" />
                          )}
                        </div>
                      </Badge>
                      );
                    })()}
                    
                    {item.category && (() => {
                      const categoryColor = bucketlistSettings.getCategoryColor(item.category);
                      const IconComponent = getCategoryIcon(item.category);
                      return (
                      <Badge 
                        variant="outline"
                        className="text-[10px] px-1 py-0"
                        style={{
                          backgroundColor: `${categoryColor}20`,
                          borderColor: `${categoryColor}40`,
                          color: categoryColor
                        }}
                      >
                        <IconComponent className="h-2.5 w-2.5" />
                      </Badge>
                      );
                    })()}
                    
                    {item.completed && (
                      <Badge 
                        style={{ 
                          backgroundColor: '#10B981',
                          color: 'white'
                        }}
                        className="text-[10px] px-1 py-0"
                      >
                        Done
                      </Badge>
                    )}
                  </div>

                  {/* Location, Experience Category, Due Date - compact badges */}
                  {(item.bucketlistType === 'location' && (item.country || item.state || item.city)) || 
                   (item.bucketlistType === 'experience' && item.experienceCategory) ||
                   item.dueDate ? (
                    <div className="flex items-center gap-1 flex-wrap mb-1">
                      {item.bucketlistType === 'location' && (item.country || item.state || item.city) && (
                        <Badge 
                          variant="outline"
                          className="text-[10px] px-1 py-0 flex items-center gap-0.5"
                        >
                          <MapPin className="h-2.5 w-2.5" />
                          {[item.city, item.state, item.country].filter(Boolean).slice(0, 2).join(', ')}
                        </Badge>
                      )}
                      {item.bucketlistType === 'experience' && item.experienceCategory && (
                        <Badge 
                          variant="outline"
                          className="text-[10px] px-1 py-0 flex items-center gap-0.5"
                        >
                          <Star className="h-2.5 w-2.5" />
                          {item.experienceCategory.substring(0, 8)}
                        </Badge>
                      )}
                      {item.dueDate && (
                        <Badge 
                          variant="outline"
                          className="text-[10px] px-1 py-0 flex items-center gap-0.5"
                        >
                          <Calendar className="h-2.5 w-2.5" />
                          {new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Badge>
                      )}
                    </div>
                  ) : null}

                  {/* Role, Vision - compact badges */}
                  {(item.roleId || item.visionId) && (
                    <div className="flex flex-wrap gap-0.5 mb-0.5">
                      {item.roleId && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 flex items-center gap-0.5">
                          <User className="h-2 w-2" />
                          {roles.find(r => r.id === item.roleId)?.name.substring(0, 8) || 'Role'}
                        </Badge>
                      )}
                      {item.visionId && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 flex items-center gap-0.5">
                          <Target className="h-2 w-2" />
                          {visions.find(v => v.id === item.visionId)?.title.substring(0, 8) || 'Vision'}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
                  );
                })}
              </div>
            ))}
              </div>
            );
          }
          return null;
        }).filter(Boolean)}
      </div>
    </div>
  );
}
