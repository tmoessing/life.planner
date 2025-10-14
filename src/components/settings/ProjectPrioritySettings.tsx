import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Check, X, RotateCcw } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';

export function ProjectPrioritySettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [editingPriority, setEditingPriority] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('#6B7280');
  const [editName, setEditName] = useState('');

  // Ensure defaults are loaded if projectPriorityColors is empty
  const projectPriorityColors = settings.projectPriorityColors || {
    'high': '#EF4444',
    'medium': '#F59E0B',
    'low': '#6B7280'
  };

  // Initialize defaults if projectPriorityColors is empty
  useEffect(() => {
    if (!settings.projectPriorityColors || Object.keys(settings.projectPriorityColors).length === 0) {
      setSettings({
        ...settings,
        projectPriorityColors: {
          'high': '#EF4444',
          'medium': '#F59E0B',
          'low': '#6B7280'
        }
      });
    }
  }, [settings.projectPriorityColors, setSettings]);

  const handleEdit = (priorityName: string) => {
    setEditingPriority(priorityName);
    setEditColor(projectPriorityColors[priorityName] || '#6B7280');
    setEditName(priorityName);
  };

  const handleUpdate = () => {
    if (editingPriority && editName.trim()) {
      const newColors = { ...projectPriorityColors };
      // If name changed, remove old key and add new one
      if (editingPriority !== editName.trim()) {
        delete newColors[editingPriority];
        newColors[editName.trim()] = editColor;
      } else {
        newColors[editName.trim()] = editColor;
      }
      
      setSettings({
        ...settings,
        projectPriorityColors: newColors
      });
      setEditingPriority(null);
      setEditName('');
      setEditColor('#6B7280');
    }
  };

  const handleCancel = () => {
    setEditingPriority(null);
    setEditName('');
    setEditColor('#6B7280');
  };

  const handleAdd = () => {
    if (editName.trim() && !projectPriorityColors[editName.trim()]) {
      setSettings({
        ...settings,
        projectPriorityColors: {
          ...projectPriorityColors,
          [editName.trim()]: editColor
        }
      });
      setEditName('');
      setEditColor('#6B7280');
    }
  };

  const handleDelete = (priorityName: string) => {
    const newColors = { ...projectPriorityColors };
    delete newColors[priorityName];
    setSettings({
      ...settings,
      projectPriorityColors: newColors
    });
  };

  const handleReset = () => {
    setSettings({
      ...settings,
      projectPriorityColors: {
        'high': '#EF4444',
        'medium': '#F59E0B',
        'low': '#6B7280'
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Priority Colors</CardTitle>
        <CardDescription>
          Manage project priority levels and their colors for visual identification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Priority */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <Input
            placeholder="Priority name (e.g., critical)"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            className="flex-1"
          />
          <ColorPicker
            value={editColor}
            onChange={setEditColor}
          />
          <Button onClick={handleAdd} size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Existing Priorities */}
        <div className="space-y-2">
          {Object.entries(projectPriorityColors).map(([priorityName, color]) => (
            <div key={priorityName} className="flex items-center gap-2 p-3 border rounded-lg">
              {editingPriority === priorityName ? (
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
                  <div className="flex items-center gap-2 flex-1">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color }}
                    />
                    <span className="font-medium capitalize">{priorityName}</span>
                  </div>
                  <Button onClick={() => handleEdit(priorityName)} size="sm" variant="outline">
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(priorityName)} 
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
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
