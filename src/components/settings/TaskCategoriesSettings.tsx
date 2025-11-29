import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';

export function TaskCategoriesSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('#6B7280');
  const [editName, setEditName] = useState('');
  const [, setIsAdding] = useState(false);
  const [newType, setNewType] = useState({ name: '', color: '#6B7280' });

  // Ensure defaults are loaded if taskCategories is empty
  const taskCategories = settings.taskCategories || [
    { name: 'Decisions', color: '#8B5CF6' },
    { name: 'Actions', color: '#10B981' },
    { name: 'Involve Others', color: '#F59E0B' },
    { name: 'Buying', color: '#EF4444' },
    { name: 'Travel', color: '#3B82F6' }
  ];

  // Initialize defaults if taskCategories is empty
  useEffect(() => {
    if (!settings.taskCategories || settings.taskCategories.length === 0) {
      setSettings({
        ...settings,
        taskCategories: [
          { name: 'Decisions', color: '#8B5CF6' },
          { name: 'Actions', color: '#10B981' },
          { name: 'Involve Others', color: '#F59E0B' },
          { name: 'Buying', color: '#EF4444' },
          { name: 'Travel', color: '#3B82F6' }
        ]
      });
    }
  }, [settings.taskCategories, setSettings]);

  const handleEdit = (typeName: string) => {
    setEditingType(typeName);
    const type = taskCategories.find(t => t.name === typeName);
    setEditColor(type?.color || '#6B7280');
    setEditName(typeName);
  };

  const handleUpdate = () => {
    if (editName.trim()) {
      const updatedTypes = taskCategories.map(type =>
        type.name === editingType
          ? { name: editName.trim(), color: editColor }
          : type
      );
      setSettings({ ...settings, taskCategories: updatedTypes });
      setEditingType(null);
      setEditName('');
    }
  };

  const handleCancel = () => {
    setEditingType(null);
    setEditName('');
    setIsAdding(false);
    setNewType({ name: '', color: '#6B7280' });
  };

  const handleDelete = (typeName: string) => {
    const updatedTypes = taskCategories.filter(type => type.name !== typeName);
    setSettings({ ...settings, taskCategories: updatedTypes });
  };

  const handleAdd = () => {
    if (newType.name.trim()) {
      const type = {
        name: newType.name.trim(),
        color: newType.color
      };
      setSettings({ ...settings, taskCategories: [...taskCategories, type] });
      setNewType({ name: '', color: '#6B7280' });
      setIsAdding(false);
    }
  };

  const handleReset = () => {
    setSettings({
      ...settings,
      taskCategories: [
        { name: 'Decisions', color: '#8B5CF6' },
        { name: 'Actions', color: '#10B981' },
        { name: 'Involve Others', color: '#F59E0B' },
        { name: 'Buying', color: '#EF4444' },
        { name: 'Travel', color: '#3B82F6' }
      ]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Categories</CardTitle>
        <CardDescription>
          Manage task categories with colors for visual identification. These categories help organize your stories by type of work.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Category */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <Input
            placeholder="Category name (e.g., Research, Planning)"
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
            className="flex-1"
          />
          <ColorPicker
            value={newType.color}
            onChange={(color) => setNewType({ ...newType, color })}
          />
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Existing Categories */}
        <div className="space-y-2">
          {taskCategories.map((type) => (
            <div key={type.name} className="flex items-center gap-2 p-3 border rounded-lg">
              {editingType === type.name ? (
                <>
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1"
                  />
                  <ColorPicker
                    value={editColor}
                    onChange={setEditColor}
                  />
                  <Button onClick={handleUpdate} size="sm" variant="outline">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div 
                    className="w-4 h-4 rounded-full border" 
                    style={{ backgroundColor: type.color }}
                  />
                  <span className="flex-1 font-medium">{type.name}</span>
                  <Button 
                    onClick={() => handleEdit(type.name)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(type.name)} 
                    size="sm" 
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t">
          <Button onClick={handleReset} variant="outline" size="sm">
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
