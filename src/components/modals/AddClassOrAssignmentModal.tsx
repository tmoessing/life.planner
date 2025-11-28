import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GraduationCap, FileText } from 'lucide-react';
import { useAtom } from 'jotai';
import { classesAtom } from '@/stores/classStore';
import type { Class } from '@/types';

interface AddClassOrAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClass: () => void;
  onSelectAssignment: (classId: string) => void;
}

export function AddClassOrAssignmentModal({ 
  isOpen, 
  onClose, 
  onSelectClass, 
  onSelectAssignment 
}: AddClassOrAssignmentModalProps) {
  const [classes] = useAtom(classesAtom);
  const [type, setType] = useState<'class' | 'assignment'>('assignment');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  const handleContinue = () => {
    if (type === 'class') {
      onSelectClass();
      onClose();
    } else if (type === 'assignment') {
      if (selectedClassId) {
        onSelectAssignment(selectedClassId);
        onClose();
      }
    }
  };

  const handleClose = () => {
    setType('assignment');
    setSelectedClassId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Type Toggle */}
          <div className="space-y-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === 'assignment' ? 'default' : 'outline'}
                onClick={() => setType('assignment')}
                className="flex-1 gap-2"
              >
                <FileText className="h-4 w-4" />
                Assignment
              </Button>
              <Button
                type="button"
                variant={type === 'class' ? 'default' : 'outline'}
                onClick={() => setType('class')}
                className="flex-1 gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Class
              </Button>
            </div>
          </div>

          {/* Class Selector (only for assignments) */}
          {type === 'assignment' && (
            <div className="space-y-2">
              <Label htmlFor="classSelect">Class *</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger id="classSelect">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.length === 0 ? (
                    <SelectItem value="no-classes" disabled>No classes available</SelectItem>
                  ) : (
                    classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.classCode || classItem.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {classes.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Create a class first before adding assignments
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleContinue}
              disabled={type === 'assignment' && !selectedClassId}
            >
              Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

