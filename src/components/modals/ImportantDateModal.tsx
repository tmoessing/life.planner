import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Plus } from 'lucide-react';
import { importantDatesAtom } from '@/stores/appStore';
import type { ImportantDate } from '@/types';

interface ImportantDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  importantDate?: ImportantDate | null;
}

export function ImportantDateModal({ 
  isOpen, 
  onClose, 
  mode, 
  importantDate 
}: ImportantDateModalProps) {
  const [importantDates, setImportantDates] = useAtom(importantDatesAtom);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or when editing item changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && importantDate) {
        setTitle(importantDate.title);
        setDate(importantDate.date);
      } else {
        setTitle('');
        setDate('');
      }
    }
  }, [isOpen, mode, importantDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        const newImportantDate: ImportantDate = {
          id: `date-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.trim(),
          date: date,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setImportantDates(prev => [...prev, newImportantDate]);
      } else if (mode === 'edit' && importantDate) {
        setImportantDates(prev => 
          prev.map(item => 
            item.id === importantDate.id 
              ? { ...item, title: title.trim(), date: date, updatedAt: new Date().toISOString() }
              : item
          )
        );
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
            <Calendar className="h-5 w-5" />
            {mode === 'add' ? 'Add Important Date' : 'Edit Important Date'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add' ? 'Add a new important date to track' : 'Edit the selected important date'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter date title (e.g., Birthday, Anniversary, Deadline)"
              className="w-full"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
              required
            />
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
              disabled={!title.trim() || !date || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Saving...' : (mode === 'add' ? 'Add Date' : 'Save Changes')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
