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
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Star, MapPin, Calendar, User, Target, Edit, Trash2, CheckCircle, Circle, Grid3X3, List, PieChart, GripVertical, Plus, Trophy, Map, Plane, Sparkles, GraduationCap, Award, Mountain, Flag, Tag, Layers } from 'lucide-react';
import { DeleteConfirmationModal } from '@/components/modals/DeleteConfirmationModal';
import { BucketlistModal } from '@/components/modals/BucketlistModal';
import { lazy, Suspense } from 'react';
import { Loader2 } from 'lucide-react';

// Lazy load chart component to reduce initial bundle size
const BucketlistPieChart = lazy(() => import('@/components/charts/BucketlistPieChart').then(m => ({ default: m.BucketlistPieChart })));
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BucketlistItem, Priority } from '@/types';

type AttributeType = 'priority' | 'category' | 'type' | 'status';
type ViewMode = 'boards' | 'list' | 'chart';

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

// Helper function to get attribute type icon
const getAttributeIcon = (attribute: AttributeType) => {
  switch (attribute) {
    case 'priority':
      return Flag;
    case 'category':
      return Tag;
    case 'type':
      return Star;
    case 'status':
      return Layers;
    default:
      return Target;
  }
};

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
  getCardPrimaryColor: (item: BucketlistItem) => string;
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
  getCardPrimaryColor,
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
                  getCardPrimaryColor={getCardPrimaryColor}
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
  getCardPrimaryColor: (item: BucketlistItem) => string;
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
  convertPriority,
  getCardPrimaryColor
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
    const cardColor = getCardPrimaryColor(item);
    const priorityColorObj = getPriorityColor(item.priority);
    return (
      <div 
        ref={setNodeRef}
        style={{
          ...style,
          backgroundColor: item.completed ? '#F0FDF4' : `${cardColor}08`,
          borderColor: `${cardColor}30`
        }}
        className={`sm:hidden flex items-center gap-1.5 p-1.5 rounded-lg border hover:shadow-sm transition-shadow min-h-[44px] relative overflow-hidden ${
          item.completed ? 'opacity-75' : ''
        } ${isDragging ? 'shadow-lg' : ''}`}
      >
        {/* Priority accent bar */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1"
          style={{ backgroundColor: priorityColorObj.color }}
        />
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        
        {/* Priority indicator */}
        <div 
          className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ backgroundColor: priorityColorObj.color }}
        />
        
        <Checkbox
          checked={item.completed}
          onCheckedChange={(checked) => onToggleComplete(item.id, !!checked)}
          className="flex-shrink-0 h-4 w-4"
        />
        
        <span className={`text-xs font-medium truncate flex-1 min-w-0 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
          {item.title}
        </span>
        
        <div className="flex items-center gap-1 flex-shrink-0">
          {selectedAttribute !== 'priority' && (
            <Badge 
              className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
              style={{
                backgroundColor: priorityColorObj.backgroundColor,
                color: priorityColorObj.color,
                borderColor: priorityColorObj.borderColor
              }}
            >
              {getPriorityLetter(item.priority)}
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
            className="h-11 w-11 sm:h-7 sm:w-7 p-0 flex-shrink-0"
          >
            <Edit className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  const cardColor = getCardPrimaryColor(item);
  const priorityColorObj = getPriorityColor(item.priority);
  
  return (
    <Card 
      ref={setNodeRef}
      style={{
        ...style,
        backgroundColor: item.completed ? '#F0FDF4' : `${cardColor}08`,
        borderColor: `${cardColor}30`
      }}
      className={`hover:shadow-md transition-shadow relative overflow-hidden ${
        item.completed ? 'opacity-75' : ''
      } ${isDragging ? 'shadow-lg' : ''}`}
    >
      {/* Priority accent bar */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ backgroundColor: priorityColorObj.color }}
      />
      {/* Mobile: Single row layout like Gmail */}
      <div className="sm:hidden p-1.5 flex items-center gap-1.5 min-h-[44px]">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        {/* Priority indicator */}
        <div 
          className="w-1 h-6 rounded-full flex-shrink-0"
          style={{ backgroundColor: priorityColorObj.color }}
        />
        <Checkbox
          checked={item.completed}
          onCheckedChange={(checked) => onToggleComplete(item.id, !!checked)}
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
          {selectedAttribute !== 'priority' && (
            <Badge 
              className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
              style={{
                backgroundColor: priorityColorObj.backgroundColor,
                color: priorityColorObj.color,
                borderColor: priorityColorObj.borderColor
              }}
            >
              {getPriorityLetter(item.priority)}
            </Badge>
          )}
          {selectedAttribute !== 'type' && item.bucketlistType && (() => {
            const typeColor = settings.bucketlistTypes?.find((t: any) => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280';
            return (
            <Badge 
              variant="outline"
              className="text-[9px] px-1 py-0 h-4 whitespace-nowrap"
              style={{
                backgroundColor: `${typeColor}20`,
                borderColor: `${typeColor}40`,
                color: typeColor
              }}
            >
              {item.bucketlistType === 'location' ? 'Loc' : 'Exp'}
            </Badge>
            );
          })()}
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
            onClick={() => onEdit(item)}
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
              <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing flex-shrink-0">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
              </div>
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
                  onEdit(item);
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
                  onDelete(item);
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
            {/* Show priority badge if not grouping by priority */}
            {selectedAttribute !== 'priority' && (
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
            )}
            
            {/* Show type badge if not grouping by type */}
            {selectedAttribute !== 'type' && item.bucketlistType && (() => {
              const typeColor = settings.bucketlistTypes?.find((t: any) => t.name.toLowerCase() === item.bucketlistType)?.color || '#6B7280';
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
            
            {/* Show category badge if not grouping by category */}
            {selectedAttribute !== 'category' && item.category && (() => {
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
                  {formatLocationDisplay(item.city, item.state, item.country).substring(0, 12)}
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
}

export function BucketlistBoardsView() {
  const [bucketlistItems] = useAtom(bucketlistAtom);
  const [, updateBucketlistItem] = useAtom(updateBucketlistItemAtom);
  const [, deleteBucketlistItem] = useAtom(deleteBucketlistItemAtom);
  const [settings] = useAtom(settingsAtom);
  const [roles] = useAtom(rolesAtom);
  const { navigateToView } = useNavigation();
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

  // Get primary color for card styling (priority > type > category)
  const getCardPrimaryColor = (item: BucketlistItem) => {
    // Priority color takes precedence
    const priorityColor = getPriorityColor(item.priority).color;
    if (priorityColor && priorityColor !== '#6B7280') {
      return priorityColor;
    }
    // Then type color
    const typeColor = settings.bucketlistTypes?.find((t: any) => t.name.toLowerCase() === item.bucketlistType)?.color;
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

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0 min-h-screen bg-gradient-to-br from-background via-background to-muted/5">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm text-muted-foreground">
              View your bucketlist items organized by attribute
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap justify-between w-full">
            {/* Group by selector */}
            <Select value={selectedAttribute} onValueChange={(value) => setSelectedAttribute(value as AttributeType)}>
              <SelectTrigger className="w-48">
                <div className="flex items-center gap-2">
                  {React.createElement(getAttributeIcon(selectedAttribute), { className: "h-4 w-4" })}
                  <SelectValue>
                    {selectedAttribute.charAt(0).toUpperCase() + selectedAttribute.slice(1)}
                  </SelectValue>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority" className="pl-12">
                  <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">
                    {React.createElement(Flag, { className: "h-4 w-4" })}
                  </span>
                  <span className="ml-6">Priority</span>
                </SelectItem>
                <SelectItem value="category" className="pl-12">
                  <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">
                    {React.createElement(Tag, { className: "h-4 w-4" })}
                  </span>
                  <span className="ml-6">Category</span>
                </SelectItem>
                <SelectItem value="type" className="pl-12">
                  <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">
                    {React.createElement(Star, { className: "h-4 w-4" })}
                  </span>
                  <span className="ml-6">Type</span>
                </SelectItem>
                <SelectItem value="status" className="pl-12">
                  <span className="absolute left-10 flex items-center pointer-events-none" aria-hidden="true">
                    {React.createElement(Layers, { className: "h-4 w-4" })}
                  </span>
                  <span className="ml-6">Status</span>
                </SelectItem>
              </SelectContent>
            </Select>
            
            {/* Back and Add Buttons - Right aligned */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                onClick={() => navigateToView('bucketlist')}
                variant="outline"
                className="gap-2 w-auto sm:w-auto"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  setModalMode('add');
                  setEditingItem(null);
                  setIsModalOpen(true);
                }}
                className="gap-2 w-auto sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Item</span>
              </Button>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
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
          <Suspense fallback={
            <Card>
              <CardContent className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </CardContent>
            </Card>
          }>
            <BucketlistPieChart chartData={chartData} selectedAttribute={selectedAttribute} />
          </Suspense>
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
                getCardPrimaryColor={getCardPrimaryColor}
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
              getCardPrimaryColor={getCardPrimaryColor}
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
