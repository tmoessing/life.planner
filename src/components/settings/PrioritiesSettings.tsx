import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { 
  storyPrioritiesAtom, 
  goalPrioritiesAtom, 
  bucketlistPrioritiesAtom,
  updateStoryPrioritiesAtom,
  updateGoalPrioritiesAtom,
  updateBucketlistPrioritiesAtom
} from '@/stores/appStore';


interface PrioritiesSettingsProps {
  category: 'stories' | 'goals' | 'bucketlist';
}

export function PrioritiesSettings({ category }: PrioritiesSettingsProps) {
  const [storyPriorities] = useAtom(storyPrioritiesAtom);
  const [goalPriorities] = useAtom(goalPrioritiesAtom);
  const [bucketlistPriorities] = useAtom(bucketlistPrioritiesAtom);
  const [, updateStoryPriorities] = useAtom(updateStoryPrioritiesAtom);
  const [, updateGoalPriorities] = useAtom(updateGoalPrioritiesAtom);
  const [, updateBucketlistPriorities] = useAtom(updateBucketlistPrioritiesAtom);

  const getPriorities = () => {
    switch (category) {
      case 'stories': return storyPriorities;
      case 'goals': return goalPriorities;
      case 'bucketlist': return bucketlistPriorities;
      default: return [];
    }
  };

  const getUpdateFunction = () => {
    switch (category) {
      case 'stories': return updateStoryPriorities;
      case 'goals': return updateGoalPriorities;
      case 'bucketlist': return updateBucketlistPriorities;
      default: return () => {};
    }
  };

  const priorities = getPriorities();
  const updatePriorities = getUpdateFunction();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPriority, setNewPriority] = useState({ name: '', color: '#6B7280', description: '' });
  const [editPriority, setEditPriority] = useState({ name: '', color: '#6B7280', description: '' });

  const handleAdd = () => {
    if (newPriority.name.trim()) {
      const priority = {
        id: Math.random().toString(36).substr(2, 9),
        name: newPriority.name.trim(),
        color: newPriority.color,
        description: newPriority.description.trim()
      };
      updatePriorities([...priorities, priority]);
      setNewPriority({ name: '', color: '#6B7280', description: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (priority: any) => {
    setEditingId(priority.id);
    setEditPriority({ name: priority.name, color: priority.color, description: priority.description });
  };

  const handleUpdate = (priorityId: string) => {
    if (editPriority.name.trim()) {
      const updatedPriorities = priorities.map(p => 
        p.id === priorityId 
          ? { ...p, name: editPriority.name.trim(), color: editPriority.color, description: editPriority.description.trim() }
          : p
      );
      updatePriorities(updatedPriorities);
      setEditingId(null);
    }
  };

  const handleDelete = (priorityId: string) => {
    const updatedPriorities = priorities.filter(p => p.id !== priorityId);
    updatePriorities(updatedPriorities);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditPriority({ name: '', color: '#6B7280', description: '' });
  };

  const getTitle = () => {
    switch (category) {
      case 'stories': return 'Story Priorities (Quadrants)';
      case 'goals': return 'Goal Priorities';
      case 'bucketlist': return 'Bucketlist Priorities';
      default: return 'Priorities';
    }
  };

  const getDescription = () => {
    switch (category) {
      case 'stories': return 'Manage priority quadrants for stories (Q1, Q2, Q3, Q4).';
      case 'goals': return 'Manage priority levels for goals (High, Medium, Low).';
      case 'bucketlist': return 'Manage priority levels for bucketlist items (High, Medium, Low).';
      default: return 'Manage priority levels.';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{getTitle()}</CardTitle>
        <CardDescription>
          {getDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Priority */}
        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Priority name (e.g., Q1)"
                value={newPriority.name}
                onChange={(e) => setNewPriority({ ...newPriority, name: e.target.value })}
                className="flex-1"
              />
              <ColorPicker
                value={newPriority.color}
                onChange={(color) => setNewPriority({ ...newPriority, color })}
                className="flex-shrink-0"
              />
            </div>
            <Input
              placeholder="Description (e.g., Critical - Do first)"
              value={newPriority.description}
              onChange={(e) => setNewPriority({ ...newPriority, description: e.target.value })}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd}>
                <Check className="h-4 w-4" />
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Priority
          </Button>
        )}

        {/* Priorities List */}
        <div className="space-y-2">
          {priorities.map((priority) => (
            <div key={priority.id} className="p-3 border rounded-lg">
              {editingId === priority.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editPriority.name}
                      onChange={(e) => setEditPriority({ ...editPriority, name: e.target.value })}
                      className="flex-1"
                    />
                    <ColorPicker
                      value={editPriority.color}
                      onChange={(color) => setEditPriority({ ...editPriority, color })}
                      className="flex-shrink-0"
                    />
                  </div>
                  <Input
                    value={editPriority.description}
                    onChange={(e) => setEditPriority({ ...editPriority, description: e.target.value })}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(priority.id)}>
                      <Check className="h-4 w-4" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: priority.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{priority.name}</div>
                    {priority.description && (
                      <div className="text-sm text-muted-foreground">{priority.description}</div>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(priority)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(priority.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
