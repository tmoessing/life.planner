import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';
import { useStorySettings, useGoalSettings, useProjectSettings } from '@/utils/settingsMirror';


interface TypesSettingsProps {
  category: 'stories' | 'goals' | 'projects' | 'visions';
}

export function TypesSettings({ category }: TypesSettingsProps) {
  // Use settings mirror system instead of hardcoded atoms
  const storySettings = useStorySettings();
  const goalSettings = useGoalSettings();
  const projectSettings = useProjectSettings();
  const [settings, setSettings] = useAtom(settingsAtom);

  const getTypes = () => {
    switch (category) {
      case 'stories': return storySettings.storyTypes;
      case 'goals': return goalSettings.goalTypes;
      case 'projects': return projectSettings.projectTypes;
      case 'visions': return settings.visionTypes;
      default: return [];
    }
  };

  const updateTypes = (newTypes: any[]) => {
    switch (category) {
      case 'stories': 
        setSettings({ ...settings, storyTypes: newTypes });
        break;
      case 'goals': 
        setSettings({ ...settings, goalTypes: newTypes });
        break;
      case 'projects': 
        setSettings({ ...settings, projectTypes: newTypes });
        break;
      case 'visions': 
        setSettings({ ...settings, visionTypes: newTypes });
        break;
    }
  };

  const types = getTypes();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newType, setNewType] = useState({ name: '', color: '#6B7280', description: '' });
  const [editType, setEditType] = useState({ name: '', color: '#6B7280', description: '' });

  const handleAdd = () => {
    if (newType.name.trim()) {
      const type = {
        name: newType.name.trim(),
        color: newType.color
      };
      updateTypes([...types, type]);
      setNewType({ name: '', color: '#6B7280', description: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (type: any) => {
    setEditingId(type.name);
    setEditType({ name: type.name, color: type.color, description: '' });
  };

  const handleUpdate = (typeName: string) => {
    if (editType.name.trim()) {
      const updatedTypes = types.map(t => 
        t.name === typeName 
          ? { name: editType.name.trim(), color: editType.color }
          : t
      );
      updateTypes(updatedTypes);
      setEditingId(null);
    }
  };

  const handleDelete = (typeName: string) => {
    const updatedTypes = types.filter(t => t.name !== typeName);
    updateTypes(updatedTypes);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditType({ name: '', color: '#6B7280', description: '' });
  };

  const getTitle = () => {
    switch (category) {
      case 'stories': return 'Story Types';
      case 'goals': return 'Goal Types';
      case 'projects': return 'Project Types';
      default: return 'Types';
    }
  };

  const getDescription = () => {
    switch (category) {
      case 'stories': return 'Manage types that can be assigned to stories for categorization.';
      case 'goals': return 'Manage types that can be assigned to goals for categorization.';
      case 'projects': return 'Manage types that can be assigned to projects for categorization.';
      default: return 'Manage types for categorization.';
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
        {/* Add New Type */}
        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Input
                placeholder="Type name (e.g., Spiritual)"
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
          {types.map((type) => (
            <div key={type.name} className="p-3 border rounded-lg">
              {editingId === type.name ? (
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
                    <Button size="sm" onClick={() => handleUpdate(type.name)}>
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
                    style={{ backgroundColor: type.color }}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{type.name}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(type)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(type.name)}>
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
