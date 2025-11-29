import { useState } from 'react';
import { useAtom } from 'jotai';
import { visionsAtom, reorderVisionsAtom, updateVisionAtom, deleteVisionAtom, settingsAtom } from '@/stores/appStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit2, Trash2, Check, X } from 'lucide-react';
import { ImportanceModal } from '@/components/modals/ImportanceModal';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableVision({ 
  vision, 
  index, 
  onDelete, 
  onUpdate, 
  visionTypes 
}: { 
  vision: any; 
  index: number;
  onDelete: (visionId: string) => void;
  onUpdate: (visionId: string, updates: any) => void;
  visionTypes: any[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(vision.title);
  const [editDescription, setEditDescription] = useState(vision.description || '');
  const [editType, setEditType] = useState(vision.type);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: vision.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () => {
    if (editTitle.trim()) {
      onUpdate(vision.id, { 
        title: editTitle.trim(), 
        description: editDescription.trim(),
        type: editType 
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(vision.title);
    setEditDescription(vision.description || '');
    setEditType(vision.type);
    setIsEditing(false);
  };

  const getVisionTypeColor = (type: string) => {
    const visionType = visionTypes.find(vt => vt.name === type);
    return visionType?.color || '#6B7280';
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Combined Drag Handle and Ranking Number */}
          <div
            {...attributes}
            {...listeners}
            className={`cursor-grab active:cursor-grabbing touch-manipulation select-none flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full text-white text-xs sm:text-sm font-bold hover:opacity-80 active:opacity-70 ${
              vision.type === 'Spiritual' ? 'bg-purple-600' :
              vision.type === 'Physical' ? 'bg-red-600' :
              vision.type === 'Intellectual' ? 'bg-blue-600' :
              vision.type === 'Social' ? 'bg-green-600' :
              'bg-gray-600'
            }`}
            style={{ touchAction: 'none' }}
          >
            {index + 1}
          </div>

          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editTitle}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTitle(e.target.value)}
                  className="text-sm"
                  placeholder="Vision title..."
                />
                <Textarea
                  value={editDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditDescription(e.target.value)}
                  className="text-sm resize-none"
                  placeholder="Short description (optional)..."
                  rows={2}
                />
                <Select value={editType} onValueChange={setEditType}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visionTypes.map(type => (
                      <SelectItem key={type.name} value={type.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex gap-1">
                  <Button size="sm" onClick={handleSave} className="h-6 px-2">
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel} className="h-6 px-2">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-sm sm:text-base">{vision.title}</h3>
                {vision.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{vision.description}</p>
                )}
                <Badge 
                  variant="outline" 
                  className="mt-1 text-xs"
                  style={{ 
                    borderColor: getVisionTypeColor(vision.type),
                    color: getVisionTypeColor(vision.type)
                  }}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: getVisionTypeColor(vision.type) }}
                  />
                  {vision.type}
                </Badge>
              </div>
            )}
          </div>

          {!isEditing && (
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(vision.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function ImportanceView() {
  const [visions, setVisions] = useAtom(visionsAtom);
  const [, reorderVisions] = useAtom(reorderVisionsAtom);
  const [, updateVision] = useAtom(updateVisionAtom);
  const [, deleteVision] = useAtom(deleteVisionAtom);
  const [settings] = useAtom(settingsAtom);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingVision, setEditingVision] = useState<any>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = visions.findIndex((item) => item.id === active.id);
      const newIndex = visions.findIndex((item) => item.id === over.id);

      const reorderedVisions = arrayMove(visions, oldIndex, newIndex);
      setVisions(reorderedVisions);
      reorderVisions(reorderedVisions.map(v => v.id));
    }
  };

  const handleAddVision = () => {
    setModalMode('add');
    setEditingVision(null);
    setIsModalOpen(true);
  };

  const handleEditVision = (vision: any) => {
    setModalMode('edit');
    setEditingVision(vision);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVision(null);
  };

  const handleUpdateVision = (visionId: string, updates: any) => {
    updateVision(visionId, updates);
  };

  const handleDeleteVision = (visionId: string) => {
    deleteVision(visionId);
  };

  const visionTypes = settings.visionTypes || [
    { name: 'Spiritual', color: '#8B5CF6' },
    { name: 'Physical', color: '#EF4444' },
    { name: 'Intellectual', color: '#3B82F6' },
    { name: 'Social', color: '#10B981' }
  ];

  return (
    <div className="space-y-3 sm:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleAddVision}
              className="gap-2 w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add New Importance</span>
            </Button>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <span className="sm:hidden">Importances</span>
            <span className="hidden sm:inline">Your Importances</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={visions.map(v => v.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1.5 sm:space-y-2">
                {visions
                  .sort((a, b) => a.order - b.order)
                  .map((vision, index) => (
                    <SortableVision 
                      key={vision.id} 
                      vision={vision} 
                      index={index}
                      onDelete={handleDeleteVision}
                      onUpdate={handleUpdateVision}
                      visionTypes={visionTypes}
                    />
                  ))}
                
                {/* Add New Importance Button - styled like an importance item */}
                <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                      
                      <div className="flex-1">
                        <Button
                          variant="ghost"
                          onClick={handleAddVision}
                          className="w-full justify-start p-0 h-auto text-left hover:bg-transparent"
                        >
                          <div className="text-gray-500 hover:text-gray-700">
                            <h3 className="font-medium">
                              <span className="sm:hidden">Add</span>
                              <span className="hidden sm:inline">Add New Importance</span>
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 hidden sm:block">Click to add a new importance to your list</p>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </SortableContext>
          </DndContext>

        </CardContent>
      </Card>

      {/* Importance Modal */}
      <ImportanceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        mode={modalMode}
        vision={editingVision}
      />
    </div>
  );
}
