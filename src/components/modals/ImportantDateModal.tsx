import React, { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Plus } from 'lucide-react';
import { importantDatesAtom } from '@/stores/appStore';
import { useImportantDateSettings } from '@/utils/settingsMirror';
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
  const importantDateSettings = useImportantDateSettings();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isOptional, setIsOptional] = useState(false);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens/closes or when editing item changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && importantDate) {
        setTitle(importantDate.title);
        setDate(importantDate.date);
        setEndDate(importantDate.endDate || '');
        setIsOptional(importantDate.isRequired === false);
        setCategory(importantDate.category || '');
      } else {
        setTitle('');
        setDate('');
        setEndDate('');
        setIsOptional(false);
        setCategory('');
      }
    }
  }, [isOpen, mode, importantDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;
    
    // Validate date range if end date is provided
    if (endDate && new Date(endDate) < new Date(date)) {
      return; // End date cannot be before start date
    }

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        const newImportantDate: ImportantDate = {
          id: `date-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          title: title.trim(),
          date: date,
          endDate: endDate ? endDate : undefined,
          isRequired: !isOptional,
          category: category || undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setImportantDates(prev => [...prev, newImportantDate]);
      } else if (mode === 'edit' && importantDate) {
        setImportantDates(prev => 
          prev.map(item => 
            item.id === importantDate.id 
              ? { 
                  ...item, 
                  title: title.trim(), 
                  date: date, 
                  endDate: endDate ? endDate : undefined,
                  isRequired: !isOptional,
                  category: category || undefined,
                  updatedAt: new Date().toISOString() 
                }
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
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {importantDateSettings.importantDateTypes.map((type) => (
                  <SelectItem key={type.name} value={type.name}>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Start Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
                min={date}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isOptional"
              checked={isOptional}
              onCheckedChange={(checked) => setIsOptional(checked as boolean)}
            />
            <Label htmlFor="isOptional" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Optional
            </Label>
          </div>
          
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!title.trim() || !date || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto touch-target min-h-[44px] sm:min-h-0"
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

