import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';

const PROJECT_STATUSES = [
  { key: 'icebox', name: 'Icebox', defaultColor: '#6B7280' },
  { key: 'backlog', name: 'Backlog', defaultColor: '#3B82F6' },
  { key: 'todo', name: 'To Do', defaultColor: '#F59E0B' },
  { key: 'progress', name: 'In Progress', defaultColor: '#F97316' },
  { key: 'done', name: 'Done', defaultColor: '#10B981' }
];

export function ProjectStatusSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('#6B7280');

  const handleEdit = (statusKey: string) => {
    setEditingStatus(statusKey);
    setEditColor(settings.projectStatusColors?.[statusKey] || PROJECT_STATUSES.find(s => s.key === statusKey)?.defaultColor || '#6B7280');
  };

  const handleUpdate = (statusKey: string) => {
    setSettings({
      ...settings,
      projectStatusColors: {
        ...settings.projectStatusColors,
        [statusKey]: editColor
      }
    });
    setEditingStatus(null);
  };

  const handleCancel = () => {
    setEditingStatus(null);
  };

  const handleReset = (statusKey: string) => {
    const defaultColor = PROJECT_STATUSES.find(s => s.key === statusKey)?.defaultColor || '#6B7280';
    setSettings({
      ...settings,
      projectStatusColors: {
        ...settings.projectStatusColors,
        [statusKey]: defaultColor
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status Colors</CardTitle>
        <CardDescription>
          Customize the colors for project statuses in the kanban board.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {PROJECT_STATUSES.map((status) => (
          <div key={status.key} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full border-2 border-gray-300" 
                style={{ backgroundColor: settings.projectStatusColors?.[status.key] || status.defaultColor }}
              ></div>
              <span className="font-medium">{status.name}</span>
            </div>
            
            {editingStatus === status.key ? (
              <div className="flex items-center gap-2">
                <ColorPicker
                  value={editColor}
                  onChange={setEditColor}
                  className="flex-shrink-0"
                />
                <Button size="sm" onClick={() => handleUpdate(status.key)}>
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(status.key)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReset(status.key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
