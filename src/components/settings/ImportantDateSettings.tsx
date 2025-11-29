import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';

export function ImportantDateSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('#6B7280');
  const [editName, setEditName] = useState('');
  const [, setIsAdding] = useState(false);
  const [newType, setNewType] = useState({ name: '', color: '#6B7280' });

  // Ensure defaults are loaded if importantDateTypes is empty
  const importantDateTypes = settings.importantDateTypes || [
    { name: 'School', color: '#3B82F6' },
    { name: 'Work', color: '#EF4444' },
    { name: 'Other', color: '#6B7280' }
  ];

  // Initialize defaults if importantDateTypes is empty
  useEffect(() => {
    if (!settings.importantDateTypes || settings.importantDateTypes.length === 0) {
      setSettings({
        ...settings,
        importantDateTypes: [
          { name: 'School', color: '#3B82F6' },
          { name: 'Work', color: '#EF4444' },
          { name: 'Other', color: '#6B7280' }
        ]
      });
    }
  }, [settings.importantDateTypes, setSettings]);

  const handleEdit = (typeName: string) => {
    setEditingType(typeName);
    const type = importantDateTypes.find(t => t.name === typeName);
    setEditColor(type?.color || '#6B7280');
    setEditName(typeName);
  };

  const handleUpdate = () => {
    if (editName.trim()) {
      const updatedTypes = importantDateTypes.map(type =>
        type.name === editingType
          ? { name: editName.trim(), color: editColor }
          : type
      );
      setSettings({ ...settings, importantDateTypes: updatedTypes });
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
    const updatedTypes = importantDateTypes.filter(type => type.name !== typeName);
    setSettings({ ...settings, importantDateTypes: updatedTypes });
  };

  const handleAdd = () => {
    if (newType.name.trim()) {
      const type = {
        name: newType.name.trim(),
        color: newType.color
      };
      setSettings({ ...settings, importantDateTypes: [...importantDateTypes, type] });
      setNewType({ name: '', color: '#6B7280' });
      setIsAdding(false);
    }
  };

  const handleReset = () => {
    setSettings({
      ...settings,
      importantDateTypes: [
        { name: 'School', color: '#3B82F6' },
        { name: 'Work', color: '#EF4444' },
        { name: 'Other', color: '#6B7280' }
      ]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Important Date Categories</CardTitle>
        <CardDescription>
          Manage important date categories with colors for visual identification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Category */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <Input
            placeholder="Category name (e.g., Personal, Health)"
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
          {importantDateTypes.map((type) => (
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
