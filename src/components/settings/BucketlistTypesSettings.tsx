import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';
import type { BucketlistTypeConfig } from '@/types';

export function BucketlistTypesSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newType, setNewType] = useState({ name: '', color: '#6B7280' });
  const [editType, setEditType] = useState({ name: '', color: '#6B7280' });

  const handleAdd = () => {
    if (newType.name.trim()) {
      const type: BucketlistTypeConfig = {
        name: newType.name.trim(),
        color: newType.color
      };
      setSettings({
        ...settings,
        bucketlistTypes: [...(settings.bucketlistTypes || []), type]
      });
      setNewType({ name: '', color: '#6B7280' });
      setIsAdding(false);
    }
  };

  const handleEdit = (index: number, type: BucketlistTypeConfig) => {
    setEditingIndex(index);
    setEditType({ name: type.name, color: type.color });
  };

  const handleUpdate = (index: number) => {
    if (editType.name.trim()) {
      const updatedTypes = [...(settings.bucketlistTypes || [])];
      updatedTypes[index] = { name: editType.name.trim(), color: editType.color };
      setSettings({ ...settings, bucketlistTypes: updatedTypes });
      setEditingIndex(null);
    }
  };

  const handleDelete = (index: number) => {
    const updatedTypes = (settings.bucketlistTypes || []).filter((_, i) => i !== index);
    setSettings({ ...settings, bucketlistTypes: updatedTypes });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditType({ name: '', color: '#6B7280' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bucketlist Types</CardTitle>
        <CardDescription>
          Manage types for organizing bucketlist items. These appear in the bucketlist modal dropdown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Type */}
        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Input
                placeholder="Type name (e.g., Location, Experience)"
                value={newType.name}
                onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                className="w-full"
              />
              <ColorPicker
                value={newType.color}
                onChange={(color) => setNewType({ ...newType, color })}
                className="w-full"
              />
            </div>
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
            Add Type
          </Button>
        )}

        {/* Types List */}
        <div className="space-y-2">
          {(settings.bucketlistTypes || []).map((type, index) => (
            <div key={index} className="p-3 border rounded-lg">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Input
                      value={editType.name}
                      onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                      className="w-full"
                    />
                    <ColorPicker
                      value={editType.color}
                      onChange={(color) => setEditType({ ...editType, color })}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(index)}>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" 
                      style={{ backgroundColor: type.color }}
                    ></div>
                    <span className="font-medium">{type.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(index, type)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(index)}
                    >
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
