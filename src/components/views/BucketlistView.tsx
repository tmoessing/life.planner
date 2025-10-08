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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, CheckCircle, Circle, Star, Filter } from 'lucide-react';
import type { BucketlistItem } from '@/types';

export function BucketlistView() {
  const [bucketlistItems] = useAtom(bucketlistAtom);
  const [, addBucketlistItem] = useAtom(addBucketlistItemAtom);
  const [, updateBucketlistItem] = useAtom(updateBucketlistItemAtom);
  const [, deleteBucketlistItem] = useAtom(deleteBucketlistItemAtom);
  const [settings] = useAtom(settingsAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);

  const [editingItem, setEditingItem] = useState<BucketlistItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Adventure',
    priority: 'Q1' as 'Q1' | 'Q2' | 'Q3' | 'Q4',
    status: 'not-started' as 'not-started' | 'in-progress' | 'completed' | 'on-hold',
    roleId: 'none',
    visionId: 'none',
    dueDate: '',
    bucketlistType: 'location' as 'location' | 'experience',
    country: 'US',
    state: '',
    city: '',
    experienceCategory: ''
  });

  const handleAddItem = () => {
    if (formData.title.trim()) {
      addBucketlistItem({
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        roleId: formData.roleId === 'none' ? undefined : formData.roleId,
        visionId: formData.visionId === 'none' ? undefined : formData.visionId,
        dueDate: formData.dueDate || undefined,
        bucketlistType: formData.bucketlistType,
        country: formData.bucketlistType === 'location' ? formData.country : undefined,
        state: formData.bucketlistType === 'location' ? formData.state : undefined,
        city: formData.bucketlistType === 'location' ? formData.city : undefined,
        experienceCategory: formData.bucketlistType === 'experience' ? formData.experienceCategory : undefined,
        completed: false,
        order: 0
      });
      setFormData({ 
        title: '', 
        description: '', 
        category: 'Adventure', 
        priority: 'Q1',
        status: 'not-started',
        roleId: 'none',
        visionId: 'none',
        dueDate: '',
        bucketlistType: 'location',
        country: 'US',
        state: '',
        city: '',
        experienceCategory: ''
      });
      setIsAddingNew(false);
    }
  };

  const handleEditItem = (item: BucketlistItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || 'Adventure',
      priority: item.priority || 'Q1',
      status: item.status || 'not-started',
      roleId: item.roleId || 'none',
      visionId: item.visionId || 'none',
      dueDate: item.dueDate || '',
      bucketlistType: item.bucketlistType || 'location',
      country: item.country || 'US',
      state: item.state || '',
      city: item.city || '',
      experienceCategory: item.experienceCategory || ''
    });
  };

  const handleUpdateItem = () => {
    if (editingItem && formData.title.trim()) {
      updateBucketlistItem(editingItem.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        status: formData.status,
        roleId: formData.roleId === 'none' ? undefined : formData.roleId,
        visionId: formData.visionId === 'none' ? undefined : formData.visionId,
        dueDate: formData.dueDate || undefined,
        bucketlistType: formData.bucketlistType,
        country: formData.bucketlistType === 'location' ? formData.country : undefined,
        state: formData.bucketlistType === 'location' ? formData.state : undefined,
        city: formData.bucketlistType === 'location' ? formData.city : undefined,
        experienceCategory: formData.bucketlistType === 'experience' ? formData.experienceCategory : undefined
      });
      setEditingItem(null);
      setFormData({ 
        title: '', 
        description: '', 
        category: 'Adventure', 
        priority: 'Q1',
        status: 'not-started',
        roleId: 'none',
        visionId: 'none',
        dueDate: '',
        bucketlistType: 'location',
        country: 'US',
        state: '',
        city: '',
        experienceCategory: ''
      });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to delete this bucketlist item?')) {
      deleteBucketlistItem(itemId);
    }
  };

  const handleToggleComplete = (itemId: string, completed: boolean) => {
    updateBucketlistItem(itemId, { 
      completed,
      completedAt: completed ? new Date().toISOString() : undefined
    });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setIsAddingNew(false);
    setFormData({ 
      title: '', 
      description: '', 
      category: 'Adventure', 
      priority: 'Q1',
      status: 'not-started',
      roleId: 'none',
      visionId: 'none',
      dueDate: '',
      bucketlistType: 'location',
      country: 'US',
      state: '',
      city: '',
      experienceCategory: ''
    });
  };

  const getPriorityColor = (priority: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    const priorityColors = settings.priorityColors || {};
    const color = priorityColors[priority] || '#6B7280';
    return {
      backgroundColor: `${color}20`,
      color: color,
      borderColor: `${color}40`
    };
  };

  const getPriorityIcon = (priority: 'Q1' | 'Q2' | 'Q3' | 'Q4') => {
    switch (priority) {
      case 'Q1':
        return <Star className="h-3 w-3 fill-current" />;
      case 'Q2':
        return <Star className="h-3 w-3" />;
      case 'Q3':
        return <Star className="h-3 w-3" />;
      case 'Q4':
        return null;
      default:
        return null;
    }
  };

  // Filter items based on current filter
  const filteredItems = bucketlistItems.filter(item => {
    if (filter === 'completed') return item.completed;
    if (filter === 'pending') return !item.completed;
    return true; // 'all'
  });

  // Sort items: completed last, then by priority (high to low), then by title
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1; // pending first
    }
    
    const priorityOrder = { Q1: 4, Q2: 3, Q3: 2, Q4: 1 };
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority; // high priority first
    }
    
    return a.title.localeCompare(b.title);
  });

  const completedCount = bucketlistItems.filter(item => item.completed).length;
  const totalCount = bucketlistItems.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold">Bucketlist</h2>
          <p className="text-sm text-muted-foreground">
            Track your life experiences and dreams
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsAddingNew(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Items</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <p className="text-2xl font-bold mt-1">{completedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Remaining</span>
            </div>
            <p className="text-2xl font-bold mt-1">{totalCount - completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Select value={filter} onValueChange={(value: 'all' | 'completed' | 'pending') => setFilter(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Items</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingItem) && (
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
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="mt-1">
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
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'Q1' | 'Q2' | 'Q3' | 'Q4' }))}
                >
                  <SelectTrigger className="mt-1">
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
                <label className="text-sm font-medium">Vision</label>
                <Select
                  value={formData.visionId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visionId: value }))}
                >
                  <SelectTrigger className="mt-1">
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
                onClick={editingItem ? handleUpdateItem : handleAddItem}
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
        {sortedItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Circle className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bucketlist Items Yet</h3>
                <p>Start by adding your first bucketlist item</p>
              </div>
              <Button onClick={() => setIsAddingNew(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Item
              </Button>
            </CardContent>
          </Card>
        ) : (
          sortedItems.map((item) => (
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
                        
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <Badge 
                            style={{
                              backgroundColor: getPriorityColor(item.priority).backgroundColor,
                              color: getPriorityColor(item.priority).color,
                              borderColor: getPriorityColor(item.priority).borderColor
                            }}
                          >
                            <div className="flex items-center gap-1">
                              {getPriorityIcon(item.priority)}
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

                          {item.bucketlistType === 'location' && (item.country || item.state || item.city) && (
                            <Badge variant="outline" className="text-blue-600 border-blue-200">
                              {[item.city, item.state, item.country].filter(Boolean).join(', ')}
                            </Badge>
                          )}

                          {item.bucketlistType === 'experience' && item.experienceCategory && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              {item.experienceCategory}
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
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
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
}
