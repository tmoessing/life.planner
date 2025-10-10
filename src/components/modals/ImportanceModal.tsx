import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Target, Plus } from 'lucide-react';
import { visionsAtom, addVisionAtom, updateVisionAtom, settingsAtom } from '@/stores/appStore';
import { useStorySettings } from '@/utils/settingsMirror';
import type { Vision } from '@/types';

interface ImportanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  vision?: Vision | null;
}

export function ImportanceModal({ 
  isOpen, 
  onClose, 
  mode, 
  vision 
}: ImportanceModalProps) {
  const [visions] = useAtom(visionsAtom);
  const [, addVision] = useAtom(addVisionAtom);
  const [, updateVision] = useAtom(updateVisionAtom);

  // Use settings for vision types
  const [settings] = useAtom(settingsAtom);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Intellectual');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use vision types from settings
  const visionTypes = settings.visionTypes;

  // Reset form when modal opens/closes or when editing item changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && vision) {
        setTitle(vision.title);
        setDescription(vision.description || '');
        setType(vision.type);
      } else {
        setTitle('');
        setDescription('');
        setType('Intellectual');
      }
    }
  }, [isOpen, mode, vision]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        addVision({
          title: title.trim(),
          description: description.trim(),
          type: type,
          order: visions.length
        });
      } else if (mode === 'edit' && vision) {
        updateVision(vision.id, {
          title: title.trim(),
          description: description.trim(),
          type: type
        });
      }
      onClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {mode === 'add' ? 'Add New Importance' : 'Edit Importance'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new importance item to your vision list' : 'Edit the selected importance item'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter importance title..."
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)..."
              className="w-full resize-none"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Select vision type..." />
              </SelectTrigger>
              <SelectContent>
                {visionTypes.map(typeOption => (
                  <SelectItem key={typeOption.name} value={typeOption.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: typeOption.color }}
                      />
                      {typeOption.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : (mode === 'add' ? 'Add Importance' : 'Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
