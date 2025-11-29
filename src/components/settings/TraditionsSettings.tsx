import { useState, useRef, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ColorPicker } from '@/components/ui/color-picker';
import { settingsAtom } from '@/stores/appStore';
import { useTraditionSettings } from '@/utils/settingsMirror';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';

export function TraditionsSettings() {
  const [settings, setSettings] = useAtom(settingsAtom);
  
  // Use settings mirror system for tradition settings
  useTraditionSettings();
  
  // Tradition Types state
  const [isAddingType, setIsAddingType] = useState(false);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [newType, setNewType] = useState({ name: '', color: '#6B7280' });
  const [editType, setEditType] = useState({ name: '', color: '#6B7280' });
  
  // Traditional Categories state
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6B7280' });
  const [editCategory, setEditCategory] = useState({ name: '', color: '#6B7280' });
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs for auto-focus
  const addTypeRef = useRef<HTMLInputElement>(null);
  const editTypeRef = useRef<HTMLInputElement>(null);
  const addCategoryRef = useRef<HTMLInputElement>(null);
  const editCategoryRef = useRef<HTMLInputElement>(null);

  // Auto-focus effects
  useEffect(() => {
    if (isAddingType && addTypeRef.current) {
      addTypeRef.current.focus();
    }
  }, [isAddingType]);

  useEffect(() => {
    if (editingTypeId && editTypeRef.current) {
      editTypeRef.current.focus();
    }
  }, [editingTypeId]);

  useEffect(() => {
    if (isAddingCategory && addCategoryRef.current) {
      addCategoryRef.current.focus();
    }
  }, [isAddingCategory]);

  useEffect(() => {
    if (editingCategoryId && editCategoryRef.current) {
      editCategoryRef.current.focus();
    }
  }, [editingCategoryId]);

  // Tradition Types handlers
  const handleAddType = async () => {
    if (!newType.name.trim()) return;
    
    setIsLoading(true);
    try {
      const newTraditionType = {
        name: newType.name.trim(),
        color: newType.color
      };
      setSettings({ ...settings, traditionTypes: [...settings.traditionTypes, newTraditionType] });
      setNewType({ name: '', color: '#6B7280' });
      setIsAddingType(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditType = (type: any) => {
    setEditingTypeId(type.name);
    setEditType({ name: type.name, color: type.color });
  };

  const handleUpdateType = (typeName: string) => {
    if (editType.name.trim()) {
      const updatedTypes = settings.traditionTypes.map(t => 
        t.name === typeName ? { name: editType.name.trim(), color: editType.color } : t
      );
      setSettings({ ...settings, traditionTypes: updatedTypes });
      setEditingTypeId(null);
    }
  };

  const handleDeleteType = (typeName: string) => {
    const filteredTypes = settings.traditionTypes.filter(t => t.name !== typeName);
    setSettings({ ...settings, traditionTypes: filteredTypes });
  };

  const handleCancelEditType = () => {
    setEditingTypeId(null);
    setEditType({ name: '', color: '#6B7280' });
  };

  // Traditional Categories handlers
  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const newTraditionalCategory = {
        name: newCategory.name.trim(),
        color: newCategory.color
      };
      setSettings({ ...settings, traditionalCategories: [...settings.traditionalCategories, newTraditionalCategory] });
      setNewCategory({ name: '', color: '#6B7280' });
      setIsAddingCategory(false);
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategoryId(category.name);
    setEditCategory({ name: category.name, color: category.color });
  };

  const handleUpdateCategory = (categoryName: string) => {
    if (editCategory.name.trim()) {
      const updatedCategories = settings.traditionalCategories.map(c => 
        c.name === categoryName ? { name: editCategory.name.trim(), color: editCategory.color } : c
      );
      setSettings({ ...settings, traditionalCategories: updatedCategories });
      setEditingCategoryId(null);
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    const filteredCategories = settings.traditionalCategories.filter(c => c.name !== categoryName);
    setSettings({ ...settings, traditionalCategories: filteredCategories });
  };

  const handleCancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditCategory({ name: '', color: '#6B7280' });
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  return (
    <div className="space-y-6">
      {/* Tradition Types Section */}
      <Card>
        <CardHeader>
          <CardTitle>Tradition Types</CardTitle>
          <CardDescription>
            Manage tradition types (life areas) that can be assigned to traditions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Tradition Type */}
          {isAddingType ? (
            <div className="space-y-3 p-3 border rounded-lg">
              <div className="space-y-2">
                <Input
                  ref={addTypeRef}
                  placeholder="Tradition type name (e.g., Spiritual, Physical)"
                  value={newType.name}
                  onChange={(e) => setNewType({ ...newType, name: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleAddType)}
                  className="w-full"
                  disabled={isLoading}
                />
                <div className="flex items-center gap-2">
                  <ColorPicker
                    value={newType.color}
                    onChange={(color) => setNewType({ ...newType, color })}
                  />
                  <span className="text-sm text-muted-foreground">Color</span>
                </div>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Button 
                  size="sm" 
                  onClick={handleAddType}
                  disabled={isLoading || !newType.name.trim()}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setIsAddingType(false)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="flex-1"></div>
              <Button onClick={() => setIsAddingType(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Tradition Type
              </Button>
            </div>
          )}

          {/* Tradition Types List */}
          <div className="space-y-2">
            {settings.traditionTypes.map((type) => (
              <div key={type.name} className="flex items-center gap-2 p-3 border rounded-lg">
                {editingTypeId === type.name ? (
                  <>
                    <Input
                      value={editType.name}
                      onChange={(e) => setEditType({ ...editType, name: e.target.value })}
                      className="flex-1"
                    />
                    <ColorPicker
                      value={editType.color}
                      onChange={(color) => setEditType({ ...editType, color })}
                      className="flex-shrink-0"
                    />
                    <Button size="sm" onClick={() => handleUpdateType(type.name)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEditType}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: type.color }}
                    />
                    <span className="flex-1">{type.name}</span>
                    <Button size="sm" variant="outline" onClick={() => handleEditType(type)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteType(type.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Traditional Categories Section */}
      <Card>
        <CardHeader>
          <CardTitle>Traditional Categories</CardTitle>
          <CardDescription>
            Manage traditional categories (occasions/events) that can be assigned to traditions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Traditional Category */}
          {isAddingCategory ? (
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Input
                placeholder="Traditional category name (e.g., Christmas, Birthday)"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                className="flex-1"
              />
              <ColorPicker
                value={newCategory.color}
                onChange={(color) => setNewCategory({ ...newCategory, color })}
                className="flex-shrink-0"
              />
              <Button size="sm" onClick={handleAddCategory}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAddingCategory(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <div className="flex-1"></div>
              <Button onClick={() => setIsAddingCategory(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Traditional Category
              </Button>
            </div>
          )}

          {/* Traditional Categories List */}
          <div className="space-y-2">
            {settings.traditionalCategories.map((category) => (
              <div key={category.name} className="flex items-center gap-2 p-3 border rounded-lg">
                {editingCategoryId === category.name ? (
                  <>
                    <Input
                      value={editCategory.name}
                      onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                      className="flex-1"
                    />
                    <ColorPicker
                      value={editCategory.color}
                      onChange={(color) => setEditCategory({ ...editCategory, color })}
                      className="flex-shrink-0"
                    />
                    <Button size="sm" onClick={() => handleUpdateCategory(category.name)}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelEditCategory}>
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div 
                      className="w-4 h-4 rounded border"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="flex-1">{category.name}</span>
                    <Button size="sm" variant="outline" onClick={() => handleEditCategory(category)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
