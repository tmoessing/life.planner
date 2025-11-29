import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2 } from 'lucide-react';
import type { Tradition } from '@/types';

interface EditTraditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradition: Tradition | null;
  onSave: (updatedTradition: Omit<Tradition, 'id' | 'createdAt'>) => void;
  traditionTypes: Array<{ name: string; color: string }>;
  traditionalCategories: Array<{ name: string; color: string }>;
}

export function EditTraditionModal({ 
  isOpen, 
  onClose, 
  tradition, 
  onSave, 
  traditionTypes,
  traditionalCategories
}: EditTraditionModalProps) {
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editTraditionType, setEditTraditionType] = useState<string>('none');
  const [editTraditionalCategory, setEditTraditionalCategory] = useState<string>('none');

  useEffect(() => {
    if (tradition) {
      setEditTitle(tradition.title);
      setEditDescription(tradition.description);
      setEditTraditionType(tradition.traditionType || 'none');
      setEditTraditionalCategory(tradition.traditionalCategory || 'none');
    }
  }, [tradition]);

  const handleSave = () => {
    if (!editTitle.trim()) return;

    onSave({
      title: editTitle.trim(),
      description: editDescription.trim(),
      traditionType: editTraditionType === 'none' ? '' : editTraditionType,
      traditionalCategory: editTraditionalCategory === 'none' ? '' : editTraditionalCategory,
      updatedAt: new Date().toISOString()
    });
    
    onClose();
  };

  const handleClose = () => {
    setEditTitle('');
    setEditDescription('');
    setEditTraditionType('none');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-5 w-5" />
            Edit Tradition
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title *</label>
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Tradition title..."
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Description (optional)..."
              className="w-full"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tradition Type</label>
            <Select value={editTraditionType} onValueChange={(value: any) => setEditTraditionType(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                    None
                  </div>
                </SelectItem>
                {traditionTypes?.map((type) => (
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
            <Select value={editTraditionalCategory} onValueChange={(value: any) => setEditTraditionalCategory(value)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500" />
                    None
                  </div>
                </SelectItem>
                {traditionalCategories?.map((category) => (
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
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!editTitle.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
