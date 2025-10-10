import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { settingsAtom } from '@/stores/settingsStore';
import type { StoryTypeConfig } from '@/types';

export function BucketlistCategoriesSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6B7280' });
  const [editCategory, setEditCategory] = useState({ name: '', color: '#6B7280' });

  const handleAdd = () => {
    if (newCategory.name.trim()) {
      const category: StoryTypeConfig = {
        name: newCategory.name.trim(),
        color: newCategory.color
      };
      setSettings({
        ...settings,
        bucketlistCategories: [...(settings.bucketlistCategories || []), category]
      });
      setNewCategory({ name: '', color: '#6B7280' });
      setIsAdding(false);
    }
  };

  const handleEdit = (index: number, category: StoryTypeConfig) => {
    setEditingIndex(index);
    setEditCategory({ name: category.name, color: category.color });
  };

  const handleUpdate = (index: number) => {
    if (editCategory.name.trim()) {
      const updatedCategories = [...(settings.bucketlistCategories || [])];
      updatedCategories[index] = { name: editCategory.name.trim(), color: editCategory.color };
      setSettings({ ...settings, bucketlistCategories: updatedCategories });
      setEditingIndex(null);
    }
  };

  const handleDelete = (index: number) => {
    const updatedCategories = (settings.bucketlistCategories || []).filter((_, i) => i !== index);
    setSettings({ ...settings, bucketlistCategories: updatedCategories });
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditCategory({ name: '', color: '#6B7280' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bucketlist Categories</CardTitle>
        <CardDescription>
          Manage categories for organizing bucketlist items. These appear in the bucketlist modal dropdown.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add New Category */}
        {isAdding ? (
          <div className="space-y-3 p-3 border rounded-lg">
            <div className="space-y-2">
              <Input
                placeholder="Category name (e.g., Adventure)"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="w-full"
              />
              <ColorPicker
                value={newCategory.color}
                onChange={(color) => setNewCategory({ ...newCategory, color })}
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
            Add Category
          </Button>
        )}

        {/* Categories List */}
        <div className="space-y-2">
          {(settings.bucketlistCategories || []).map((category, index) => (
            <div key={index} className="p-3 border rounded-lg">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Input
                      value={editCategory.name}
                      onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                      className="w-full"
                    />
                    <ColorPicker
                      value={editCategory.color}
                      onChange={(color) => setEditCategory({ ...editCategory, color })}
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
                      className="w-4 h-4 rounded-full border-2 border-gray-300" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(index, category)}
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
