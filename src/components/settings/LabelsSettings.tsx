import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { settingsAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import type { Label } from '@/types';

export function LabelsSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  
  // Use settings mirror system for labels
  const storySettings = useStorySettings();
  
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState({ name: '', color: '#6B7280' });
  const [editLabel, setEditLabel] = useState({ name: '', color: '#6B7280' });

  const handleAdd = () => {
    if (newLabel.name.trim()) {
      const newLabelItem = {
        id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newLabel.name.trim(),
        color: newLabel.color
      };
      setSettings({ ...settings, labels: [...settings.labels, newLabelItem] });
      setNewLabel({ name: '', color: '#6B7280' });
      setIsAdding(false);
    }
  };

  const handleEdit = (label: any) => {
    setEditingId(label.name);
    setEditLabel({ name: label.name, color: label.color });
  };

  const handleUpdate = (labelName: string) => {
    if (editLabel.name.trim()) {
      const updatedLabels = settings.labels.map(l => 
        l.name === labelName ? { ...l, name: editLabel.name.trim(), color: editLabel.color } : l
      );
      setSettings({ ...settings, labels: updatedLabels });
      setEditingId(null);
    }
  };

  const handleDelete = (labelName: string) => {
    const filteredLabels = settings.labels.filter(l => l.name !== labelName);
    setSettings({ ...settings, labels: filteredLabels });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditLabel({ name: '', color: '#6B7280' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Labels</CardTitle>
        <CardDescription>
          Manage labels that can be assigned to stories and other items for categorization.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Label */}
        {isAdding ? (
          <div className="flex items-center gap-2 p-3 border rounded-lg">
            <Input
              placeholder="Label name"
              value={newLabel.name}
              onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
              className="flex-1"
            />
            <ColorPicker
              value={newLabel.color}
              onChange={(color) => setNewLabel({ ...newLabel, color })}
              className="flex-shrink-0"
            />
            <Button size="sm" onClick={handleAdd}>
              <Check className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Label
          </Button>
        )}

        {/* Labels List */}
        <div className="space-y-2">
          {settings.labels.map((label) => (
            <div key={label.name} className="flex items-center gap-2 p-3 border rounded-lg">
              {editingId === label.name ? (
                <>
                  <Input
                    value={editLabel.name}
                    onChange={(e) => setEditLabel({ ...editLabel, name: e.target.value })}
                    className="flex-1"
                  />
                  <ColorPicker
                    value={editLabel.color}
                    onChange={(color) => setEditLabel({ ...editLabel, color })}
                    className="flex-shrink-0"
                  />
                  <Button size="sm" onClick={() => handleUpdate(label.name)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: label.color }}
                  />
                  <span className="flex-1">{label.name}</span>
                  <Button size="sm" variant="outline" onClick={() => handleEdit(label)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(label.name)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
