import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { 
  bucketlistAtom, 
  updateBucketlistItemAtom, 
  deleteBucketlistItemAtom,
  settingsAtom,
  rolesAtom,
  visionsAtom
} from '@/stores/appStore';
import { useBucketlistSettings } from '@/utils/settingsMirror';
import { formatLocationDisplay } from '@/utils/formatting';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Star, MapPin, Calendar, User, Target, Edit, Trash2, CheckCircle, Circle, Grid3X3, List, PieChart, GripVertical, Plus, Trophy, Map } from 'lucide-react';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { BucketlistModal } from '@/components/modals/BucketlistModal';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BucketlistItem, Priority } from '@/types';

type AttributeType = 'priority' | 'category' | 'type' | 'status';
type ViewMode = 'boards' | 'list' | 'chart';

// Droppable Group Component
interface DroppableGroupProps {
  groupValue: string;
  items: BucketlistItem[];
  color: string;
  selectedAttribute: AttributeType;
  onEdit: (item: BucketlistItem) => void;
  onDelete: (item: BucketlistItem) => void;
  onToggleComplete: (itemId: string, completed: boolean) => void;
  settings: any;
  roles: any[];
  visions: any[];
  bucketlistSettings: any;
  getPriorityColor: (priority: Priority) => any;
  getPriorityIcon: (priority: 'low' | 'medium' | 'high') => any;
  getPriorityLetter: (priority: string) => string;
  convertPriority: (priority: Priority) => 'low' | 'medium' | 'high';
  isCompact?: boolean;
}

function DroppableGroup({
  groupValue,
  items,
  color,
  selectedAttribute,
  onEdit,
  onDelete,
  onToggleComplete,
  settings,
  roles,
  visions,
  bucketlistSettings,
  getPriorityColor,
  getPriorityIcon,
  getPriorityLetter,
  convertPriority,
  isCompact = false
}: DroppableGroupProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `group-${groupValue}`,
    data: {
      type: 'group',
      attribute: selectedAttribute,
      value: groupValue,
    },
  });

  // Create background color with opacity
  const backgroundColor = `${color}15`; // 15% opacity
  const borderColor = `${color}30`; // 30% opacity for border
  
  return (
    <Card 
      ref={setNodeRef}
      className={`h-fit transition-colors ${
        isOver ? 'ring-2 ring-primary ring-opacity-50 bg-primary/5' : ''
      }`}
      style={{
        backgroundColor: isOver ? undefined : backgroundColor,
        borderColor: isOver ? undefined : borderColor,
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <CardTitle className="text-lg capitalize">
              {groupValue}
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <div 
            className={`text-center py-4 text-muted-foreground rounded-lg transition-colors ${
              isOver ? 'border-2 border-dashed border-primary/30 bg-primary/5' : ''
            }`}
            style={{
              backgroundColor: isOver ? undefined : `${color}08`, // Very subtle background
            }}
          >
            <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {isOver ? 'Drop here to assign to this group' : 'No items'}
            </p>
          </div>
        ) : (
          <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleComplete={onToggleComplete}
                  isCompact={isCompact}
                  selectedAttribute={selectedAttribute}
                  settings={settings}
                  roles={roles}
                  visions={visions}
                  bucketlistSettings={bucketlistSettings}
                  getPriorityColor={getPriorityColor}
                  getPriorityIcon={getPriorityIcon}
                  getPriorityLetter={getPriorityLetter}
                  convertPriority={convertPriority}
                />
              ))}
            </div>
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}

// Sortable Item Component
interface SortableItemProps {
  item: BucketlistItem;
  onEdit: (item: BucketlistItem) => void;
  onDelete: (item: BucketlistItem) => void;
  onToggleComplete: (itemId: string, completed: boolean) => void;
  isCompact?: boolean;
  selectedAttribute: AttributeType;
  settings: any;
  roles: any[];
  visions: any[];
  bucketlistSettings: any;
  getPriorityColor: (priority: Priority) => any;
  getPriorityIcon: (priority: 'low' | 'medium' | 'high') => any;
  getPriorityLetter: (priority: string) => string;
  convertPriority: (priority: Priority) => 'low' | 'medium' | 'high';
}

function SortableItem({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleComplete, 
  isCompact = false,
  selectedAttribute,
  settings,
  roles,
  visions,
  bucketlistSettings,
  getPriorityColor,
  getPriorityIcon,
  getPriorityLetter,
  convertPriority
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (isCompact) {
    return (
      <div 
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow ${
          item.completed ? 'opacity-75 bg-green-50' : ''
        } ${isDragging ? 'shadow-lg' : ''}`}
      >
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <Checkbox
          checked={item.completed}
          onCheckedChange={(checked) => onToggleComplete(item.id, !!checked)}
          className="flex-shrink-0"
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium text-sm break-words ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
            {item.title}
          </h3>
          {item.description && (
            <p className={`text-muted-foreground text-xs break-words mt-1 ${item.completed ? 'line-through' : ''}`}>
              {item.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-6 w-6 p-0"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item)}
            className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`hover:shadow-md transition-shadow ${
        item.completed ? 'opacity-75 bg-green-50' : ''
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0 mt-1">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>
          
          <Checkbox
            checked={item.completed}
            onCheckedChange={(checked) => onToggleComplete(item.id, !!checked)}
            className="mt-1 flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-sm break-words ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {item.title}
                </h3>
                {item.description && (
                  <p className={`text-muted-foreground mt-1 text-xs break-words ${item.completed ? 'line-through' : ''}`}>
                    {item.description}
                  </p>
                )}
                
                {/* Additional details based on item type */}
                {item.bucketlistType === 'location' && (item.country || item.state || item.city) && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">
                      {formatLocationDisplay(item.city, item.state, item.country)}
                    </span>
                  </div>
                )}
                
                {item.bucketlistType === 'experience' && item.experienceCategory && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Category: {item.experienceCategory}</span>
                  </div>
                )}
                
                {item.dueDate && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                
                {/* Role and Vision information */}
                {(item.roleId || item.visionId) && (
                  <div className="mt-2 flex flex-col gap-1 text-xs text-muted-foreground">
                    {item.roleId && (
                      <div className="flex items-center gap-1 min-w-0">
                        <User className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{roles.find(r => r.id === item.roleId)?.name || 'Unknown Role'}</span>
                      </div>
                    )}
                    {item.visionId && (
                      <div className="flex items-center gap-1 min-w-0">
                        <Target className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{visions.find(v => v.id === item.visionId)?.title || 'Unknown Vision'}</span>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex items-center gap-1 mt-2 flex-wrap">
                  {/* Show priority badge if not grouping by priority */}
                  {selectedAttribute !== 'priority' && (
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
                        <span className="hidden xs:inline">{getPriorityLetter(item.priority)}</span>
                        <span className="xs:hidden">{getPriorityLetter(item.priority)}</span>
                      </div>
                    </Badge>
                  )}
                  
                  {/* Show type badge if not grouping by type */}
                  {selectedAttribute !== 'type' && item.bucketlistType && (
                    <Badge 
                      variant="outline"
                      className="text-xs"
                      style={{
                        borderColor: settings.bucketlistTypes?.find((t: any) => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280',
                        color: settings.bucketlistTypes?.find((t: any) => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280'
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {item.bucketlistType === 'location' ? (
                          <Map className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: settings.bucketlistTypes?.find((t: any) => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280' }} />
                        ) : (
                          <Star className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: settings.bucketlistTypes?.find((t: any) => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280' }} />
                        )}
                      </div>
                    </Badge>
                  )}
                  
                  {/* Show category badge if not grouping by category */}
                  {selectedAttribute !== 'category' && item.category && (
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{
                        borderColor: bucketlistSettings.getCategoryColor(item.category),
                        color: bucketlistSettings.getCategoryColor(item.category)
                      }}
                    >
                      <span className="hidden xs:inline">{item.category}</span>
                      <span className="xs:hidden">{item.category.charAt(0).toUpperCase()}</span>
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
              
              <div className="flex items-center gap-1 mt-2 sm:mt-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(item)}
                  className="h-6 w-6 p-0 touch-manipulation"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(item)}
                  className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 touch-manipulation"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function BucketlistBoardsView() {
  const [bucketlistItems] = useAtom(bucketlistAtom);
  const [, updateBucketlistItem] = useAtom(updateBucketlistItemAtom);
  const [, deleteBucketlistItem] = useAtom(deleteBucketlistItemAtom);
  const [settings] = useAtom(settingsAtom);
  const [roles] = useAtom(rolesAtom);
  const [visions] = useAtom(visionsAtom);

  // Use settings mirror system for bucketlist settings
  const bucketlistSettings = useBucketlistSettings();

  const [selectedAttribute, setSelectedAttribute] = useState<AttributeType>('priority');
  const [viewMode, setViewMode] = useState<ViewMode>('boards');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingItem, setEditingItem] = useState<BucketlistItem | null>(null);
  
  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<BucketlistItem[]>([]);
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Delete confirmation modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BucketlistItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditItem = (item: BucketlistItem) => {
    setModalMode('edit');
    setEditingItem(item);
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

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;
    
    const activeItem = items.find(item => item.id === active.id);
    if (!activeItem) return;
    
    // Check if dropping on a group (cross-group drop)
    if (over.data.current?.type === 'group') {
      const targetGroup = over.data.current.value;
      const targetAttribute = over.data.current.attribute;
      
      // Update the item's attribute based on the target group
      let updateData: any = {};
      
      switch (targetAttribute) {
        case 'priority':
          // Map group values to priority values
          const priorityMap: Record<string, Priority> = {
            'high': 'high',
            'medium': 'medium', 
            'low': 'low'
          };
          updateData.priority = priorityMap[targetGroup] || activeItem.priority;
          break;
        case 'category':
          updateData.category = targetGroup === 'Uncategorized' ? undefined : targetGroup;
          break;
        case 'type':
          updateData.bucketlistType = targetGroup === 'Unknown' ? undefined : targetGroup;
          break;
        case 'status':
          updateData.status = targetGroup;
          if (targetGroup === 'completed') {
            updateData.completed = true;
            updateData.completedAt = new Date().toISOString();
          } else {
            updateData.completed = false;
            updateData.completedAt = undefined;
          }
          break;
      }
      
      // Update the item with the new attribute
      updateBucketlistItem(activeItem.id, updateData);
    } else {
      // Same group reordering
      if (active.id !== over.id) {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = [...items];
          const [movedItem] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, movedItem);
          
          setItems(newItems);
          
          // Update the order in the store
          newItems.forEach((item, index) => {
            updateBucketlistItem(item.id, { order: index });
          });
        }
      }
    }
    
    setActiveId(null);
  };

  // Update items when bucketlistItems changes
  React.useEffect(() => {
    setItems(bucketlistItems);
  }, [bucketlistItems]);

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

  const getPriorityIcon = (priority: 'low' | 'medium' | 'high') => {
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

  // Get all possible values for the selected attribute from settings
  const getAttributeValues = (attribute: AttributeType) => {
    switch (attribute) {
      case 'priority':
        // Get priority values from settings
        return ['high', 'medium', 'low'];
      case 'category':
        // Get categories from settings, plus 'Uncategorized' for items without category
        const categories = settings.bucketlistCategories?.map(cat => cat.name) || [];
        return [...categories, 'Uncategorized'];
      case 'type':
        // Get bucketlist types from settings
        const types = settings.bucketlistTypes?.map(type => type.name.toLowerCase()) || [];
        return [...types, 'Unknown'];
      case 'status':
        // Standard status values
        return ['in-progress', 'completed'];
      default:
        return [];
    }
  };

  // Get items for a specific attribute value
  const getItemsForAttributeValue = (attribute: AttributeType, value: string) => {
    return bucketlistItems.filter(item => {
      let itemValue: string;
      switch (attribute) {
        case 'priority':
          itemValue = convertPriority(item.priority);
          break;
        case 'category':
          itemValue = item.category || 'Uncategorized';
          break;
        case 'type':
          itemValue = item.bucketlistType || 'Unknown';
          break;
        case 'status':
          itemValue = item.status || (item.completed ? 'completed' : 'in-progress');
          break;
        default:
          itemValue = 'Unknown';
      }
      return itemValue === value;
    });
  };

  // Get color for attribute value
  const getAttributeValueColor = (attribute: AttributeType, value: string) => {
    switch (attribute) {
      case 'priority':
        const priorityColors = {
          low: bucketlistSettings.getPriorityColor('low'),
          medium: bucketlistSettings.getPriorityColor('medium'), 
          high: bucketlistSettings.getPriorityColor('high')
        };
        return priorityColors[value as keyof typeof priorityColors] || '#6B7280';
      case 'category':
        // Use a color from settings or generate one based on category name
        const categoryColors = settings.bucketlistCategories || [];
        const categoryConfig = categoryColors.find(c => c.name === value);
        if (value === 'Uncategorized') {
          return '#6B7280'; // Gray for uncategorized
        }
        return categoryConfig?.color || '#6B7280';
      case 'type':
        const typeColors = settings.bucketlistTypes || [];
        const typeConfig = typeColors.find(t => t.name.toLowerCase() === value);
        if (value === 'Unknown') {
          return '#6B7280'; // Gray for unknown
        }
        return typeConfig?.color || '#6B7280';
      case 'status':
        return bucketlistSettings.getStatusColor(value);
      default:
        return '#6B7280';
    }
  };

  const attributeValues = getAttributeValues(selectedAttribute);

  // Prepare chart data
  const getChartData = () => {
    return attributeValues.map(value => {
      const items = getItemsForAttributeValue(selectedAttribute, value);
      const color = getAttributeValueColor(selectedAttribute, value);
      return {
        name: value,
        value: items.length,
        color: color,
        items: items
      };
    });
  };

  const chartData = getChartData();

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value} {data.value === 1 ? 'item' : 'items'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Bucketlist Boards</h2>
            <p className="text-sm text-muted-foreground">
              View your bucketlist items organized by attribute
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                console.log('Navigating to bucketlist');
                if ((window as any).navigateToView) {
                  (window as any).navigateToView('bucketlist');
                } else {
                  console.error('Navigation function not available');
                }
              }}
              variant="outline"
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden xs:inline">Bucketlist View</span>
              <span className="xs:hidden">Bucketlist</span>
            </Button>
            <Button
              onClick={() => {
                setModalMode('add');
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="gap-2 w-full sm:w-auto"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add Item</span>
              <span className="xs:hidden">Add</span>
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Group by:</span>
            <Select value={selectedAttribute} onValueChange={(value) => setSelectedAttribute(value as AttributeType)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">View:</span>
            <div className="flex items-center bg-muted rounded-lg p-1">
              <button
                onClick={() => setViewMode('boards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'boards'
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Grid3X3 className="h-4 w-4" />
                Boards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="h-4 w-4" />
                List
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'chart'
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <PieChart className="h-4 w-4" />
                Chart
              </button>
            </div>
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

      {/* Content based on view mode */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {viewMode === 'chart' ? (
        <Card className="bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribution by {selectedAttribute.charAt(0).toUpperCase() + selectedAttribute.slice(1)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {attributeValues.map((value) => {
            const groupItems = getItemsForAttributeValue(selectedAttribute, value);
            const color = getAttributeValueColor(selectedAttribute, value);
            
            return (
              <DroppableGroup
                key={value}
                groupValue={value}
                items={groupItems}
                color={color}
                selectedAttribute={selectedAttribute}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onToggleComplete={handleToggleComplete}
                settings={settings}
                roles={roles}
                visions={visions}
                bucketlistSettings={bucketlistSettings}
                getPriorityColor={getPriorityColor}
                getPriorityIcon={getPriorityIcon}
                getPriorityLetter={getPriorityLetter}
                convertPriority={convertPriority}
                isCompact={true}
              />
            );
          })}
        </div>
      ) : (
        /* Boards view */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {attributeValues.map((value) => {
          const groupItems = getItemsForAttributeValue(selectedAttribute, value);
          const color = getAttributeValueColor(selectedAttribute, value);
          
          return (
            <DroppableGroup
              key={value}
              groupValue={value}
              items={groupItems}
              color={color}
              selectedAttribute={selectedAttribute}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onToggleComplete={handleToggleComplete}
              settings={settings}
              roles={roles}
              visions={visions}
              bucketlistSettings={bucketlistSettings}
              getPriorityColor={getPriorityColor}
              getPriorityIcon={getPriorityIcon}
              getPriorityLetter={getPriorityLetter}
              convertPriority={convertPriority}
              isCompact={false}
            />
          );
        })}
        </div>
      )}
      
      <DragOverlay>
        {activeId ? (
          <div className="bg-background border rounded-lg p-3 shadow-lg opacity-90">
            <p className="font-medium text-sm">
              {items.find(item => item.id === activeId)?.title}
            </p>
          </div>
        ) : null}
      </DragOverlay>
      </DndContext>
    </div>
  );
}
