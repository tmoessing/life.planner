import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';

export function ProjectSizesSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [editingSize, setEditingSize] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('#6B7280');
  const [editName, setEditName] = useState('');

  // Ensure defaults are loaded if projectSizes is empty
  const projectSizes = settings.projectSizes || [
    { name: 'XS', color: '#10B981' },
    { name: 'S', color: '#3B82F6' },
    { name: 'M', color: '#F59E0B' },
    { name: 'L', color: '#EF4444' },
    { name: 'XL', color: '#8B5CF6' }
  ];

  // Initialize defaults if projectSizes is empty
  useEffect(() => {
    if (!settings.projectSizes || settings.projectSizes.length === 0) {
      setSettings({
        ...settings,
        projectSizes: [
          { name: 'XS', color: '#10B981' },
          { name: 'S', color: '#3B82F6' },
          { name: 'M', color: '#F59E0B' },
          { name: 'L', color: '#EF4444' },
          { name: 'XL', color: '#8B5CF6' }
        ]
      });
    }
  }, [settings.projectSizes, setSettings]);

  const handleEdit = (sizeName: string) => {
    setEditingSize(sizeName);
    const size = projectSizes.find(s => s.name === sizeName);
    setEditColor(size?.color || '#6B7280');
    setEditName(sizeName);
  };

  const handleUpdate = () => {
    if (!editName.trim()) return;
    
    setSettings({
      ...settings,
      projectSizes: (settings.projectSizes || []).map(size => 
        size.name === editingSize 
          ? { ...size, name: editName.trim(), color: editColor }
          : size
      )
    });
    setEditingSize(null);
    setEditName('');
  };

  const handleCancel = () => {
    setEditingSize(null);
    setEditName('');
  };

  const handleAdd = () => {
    if (!editName.trim()) return;
    
    const newSize = {
      name: editName.trim(),
      color: editColor
    };
    
    setSettings({
      ...settings,
      projectSizes: [...(settings.projectSizes || []), newSize]
    });
    setEditName('');
    setEditColor('#6B7280');
  };

  const handleDelete = (sizeName: string) => {
    setSettings({
      ...settings,
      projectSizes: (settings.projectSizes || []).filter(size => size.name !== sizeName)
    });
  };

  const handleReset = () => {
    setSettings({
      ...settings,
      projectSizes: [
        { name: 'XS', color: '#10B981' },
        { name: 'S', color: '#3B82F6' },
        { name: 'M', color: '#F59E0B' },
        { name: 'L', color: '#EF4444' },
        { name: 'XL', color: '#8B5CF6' }
      ]
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Sizes</CardTitle>
        <CardDescription>
          Manage project sizes (XS, S, M, L, XL) with colors for visual identification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Size */}
        <div className="flex items-center gap-2 p-3 border rounded-lg">
          <Input
            placeholder="Size name (e.g., XXL)"
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

        {/* Existing Sizes */}
        <div className="space-y-2">
          {projectSizes.map((size) => (
            <div key={size.name} className="flex items-center gap-2 p-3 border rounded-lg">
              {editingSize === size.name ? (
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
                  <div className="flex-1 flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: size.color }}
                    />
                    <span className="font-medium">{size.name}</span>
                  </div>
                  <Button 
                    onClick={() => handleEdit(size.name)} 
                    size="sm" 
                    variant="outline"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => handleDelete(size.name)} 
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
