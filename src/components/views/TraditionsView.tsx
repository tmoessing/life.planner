import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Plus, Trash2, Edit2, Sparkles } from 'lucide-react';
import { traditionsAtom, traditionTypesAtom, traditionalCategoriesAtom } from '@/stores/appStore';
import { useTraditionSettings } from '@/utils/settingsMirror';
import { EditTraditionModal } from '@/components/modals/EditTraditionModal';
import type { Tradition } from '@/types';

export function TraditionsView() {
  const [traditions, setTraditions] = useAtom(traditionsAtom);
  const [traditionTypes] = useAtom(traditionTypesAtom);
  const [traditionalCategories] = useAtom(traditionalCategoriesAtom);
  
  // Use settings mirror system for tradition settings
  const traditionSettings = useTraditionSettings();
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTraditionType, setNewTraditionType] = useState<string>('none');
  const [newTraditionalCategory, setNewTraditionalCategory] = useState<string>('none');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTradition, setEditingTradition] = useState<Tradition | null>(null);

  const handleAddTradition = () => {
    if (!newTitle.trim()) return;

    const newTradition: Tradition = {
      id: `tradition-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newTitle.trim(),
      description: newDescription.trim() || '',
      traditionType: newTraditionType === 'none' ? '' : newTraditionType,
      traditionalCategory: newTraditionalCategory === 'none' ? '' : newTraditionalCategory,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTraditions(prev => [...prev, newTradition]);
    setNewTitle('');
    setNewDescription('');
    setNewTraditionType('none');
    setNewTraditionalCategory('none');
    setIsAddModalOpen(false);
  };

  const handleDeleteTradition = (id: string) => {
    setTraditions(prev => prev.filter(tradition => tradition.id !== id));
  };

  const handleEditTradition = (tradition: Tradition) => {
    setEditingTradition(tradition);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedTradition: Omit<Tradition, 'id' | 'createdAt'>) => {
    if (!editingTradition) return;

    setTraditions(prev => 
      prev.map(tradition => 
        tradition.id === editingTradition.id 
          ? { 
              ...tradition, 
              ...updatedTradition
            }
          : tradition
      )
    );

    setEditingTradition(null);
    setIsEditModalOpen(false);
  };

  const getTypeInfo = (traditionType: string, traditionalCategory: string) => {
    const typeInfo = traditionTypes.find(t => t.name === traditionType);
    const categoryInfo = traditionalCategories.find(t => t.name === traditionalCategory);
    
    return {
      traditionType: typeInfo ? {
        name: typeInfo.name,
        color: typeInfo.color,
        icon: '●'
      } : {
        name: 'Not selected',
        color: traditionSettings.getTypeColor('default'),
        icon: '○'
      },
      traditionalCategory: categoryInfo ? {
        name: categoryInfo.name,
        color: categoryInfo.color,
        icon: '●'
      } : {
        name: 'Not selected',
        color: traditionSettings.getCategoryColor('default'),
        icon: '○'
      }
    };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Manage your traditions and build meaningful habits
          </p>
        </div>
        
        {/* Add Tradition Button */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Tradition
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Tradition</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Tradition title..."
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Description (optional)..."
                  className="w-full"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tradition Type</label>
                <Select value={newTraditionType} onValueChange={(value: any) => setNewTraditionType(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        None
                      </div>
                    </SelectItem>
                    {traditionTypes.map((type) => (
                      <SelectItem key={type.name} value={type.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: type.color }}
                          />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Traditional Category</label>
                <Select value={newTraditionalCategory} onValueChange={(value: any) => setNewTraditionalCategory(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        None
                      </div>
                    </SelectItem>
                    {traditionalCategories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddTradition}
                  disabled={!newTitle.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tradition
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content */}
      {traditions.length === 0 ? (
        <Card className="h-96 flex items-center justify-center">
          <CardContent className="text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Traditions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building meaningful traditions in your life
            </p>
            <p className="text-sm text-muted-foreground">
              Click "Add Tradition" to create your first tradition
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Traditions List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {traditions.map((tradition) => {
            const typeInfo = getTypeInfo(tradition.traditionType, tradition.traditionalCategory);
            return (
              <Card key={tradition.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: typeInfo.traditionType.color }}
                        />
                        <div>
                          <h3 className="font-semibold text-lg">{tradition.title}</h3>
                          <div className="flex gap-2">
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${typeInfo.traditionType.color}20`,
                                color: typeInfo.traditionType.color,
                                borderColor: `${typeInfo.traditionType.color}40`
                              }}
                            >
                              {typeInfo.traditionType.name}
                            </Badge>
                            <Badge 
                              variant="outline" 
                              className="text-xs"
                              style={{ 
                                backgroundColor: `${typeInfo.traditionalCategory.color}20`,
                                color: typeInfo.traditionalCategory.color,
                                borderColor: `${typeInfo.traditionalCategory.color}40`
                              }}
                            >
                              {typeInfo.traditionalCategory.name}
                            </Badge>
                          </div>
                        </div>
                      </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTradition(tradition)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTradition(tradition.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {tradition.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {tradition.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Tradition Modal */}
      <EditTraditionModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTradition(null);
        }}
        tradition={editingTradition}
        onSave={handleSaveEdit}
        traditionTypes={traditionTypes}
        traditionalCategories={traditionalCategories}
      />

    </div>
  );
}
