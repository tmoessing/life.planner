import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, Repeat } from 'lucide-react';
import { useAtom } from 'jotai';
import { addAssignmentAtom, updateAssignmentAtom } from '@/stores/assignmentStore';
import type { Assignment, AssignmentType, AssignmentStatus, AssignmentRecurrencePattern } from '@/types';

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment?: Assignment | null;
  classId: string;
  mode: 'add' | 'edit';
}

export function AssignmentModal({ isOpen, onClose, assignment, classId, mode }: AssignmentModalProps) {
  const [, addAssignment] = useAtom(addAssignmentAtom);
  const [, updateAssignment] = useAtom(updateAssignmentAtom);

  const [formData, setFormData] = useState({
    title: '',
    type: 'homework' as AssignmentType,
    description: '',
    dueDate: '',
    dueTime: '',
    status: 'not-started' as AssignmentStatus,
    weight: 3 as 1 | 3 | 5 | 8 | 13 | 21,
    recurrencePattern: undefined as AssignmentRecurrencePattern | undefined,
    storyId: undefined as string | undefined
  });

  const [recurrenceType, setRecurrenceType] = useState<'none' | 'before-class' | 'weekly' | 'biweekly' | 'custom'>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceTime, setRecurrenceTime] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  useEffect(() => {
    if (mode === 'edit' && assignment) {
      setFormData({
        title: assignment.title,
        type: assignment.type,
        description: assignment.description || '',
        dueDate: assignment.dueDate || '',
        dueTime: assignment.dueTime || '',
        status: assignment.status,
        weight: assignment.weight || 3,
        recurrencePattern: assignment.recurrencePattern,
        storyId: assignment.storyId
      });

      if (assignment.recurrencePattern) {
        const patternType = assignment.recurrencePattern.type;
        setRecurrenceType(patternType === 'custom' ? 'none' : patternType);
        setRecurrenceDays(assignment.recurrencePattern.daysOfWeek || []);
        setRecurrenceTime(assignment.recurrencePattern.time || '');
        setRecurrenceEndDate(assignment.recurrencePattern.endDate || '');
      } else {
        setRecurrenceType('none');
        setRecurrenceDays([]);
        setRecurrenceTime('');
        setRecurrenceEndDate('');
      }
    } else {
      setFormData({
        title: '',
        type: 'homework',
        description: '',
        dueDate: '',
        dueTime: '',
        status: 'not-started',
        weight: 3,
        recurrencePattern: undefined,
        storyId: undefined
      });
      setRecurrenceType('none');
      setRecurrenceDays([]);
      setRecurrenceTime('');
      setRecurrenceEndDate('');
    }
  }, [mode, assignment, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let recurrencePattern: AssignmentRecurrencePattern | undefined = undefined;

    if (recurrenceType !== 'none') {
      recurrencePattern = {
        type: recurrenceType,
        daysOfWeek: recurrenceType === 'weekly' || recurrenceType === 'biweekly' ? recurrenceDays : undefined,
        time: recurrenceType === 'weekly' || recurrenceType === 'biweekly' ? recurrenceTime : undefined,
        endDate: recurrenceEndDate || undefined
      };
    }

    const submitData = {
      ...formData,
      recurrencePattern
    };

    if (mode === 'add') {
      addAssignment({
        ...submitData,
        classId
      });
    } else if (mode === 'edit' && assignment) {
      updateAssignment(assignment.id, submitData);
    }

    onClose();
  };

  const handleDayToggle = (day: number) => {
    setRecurrenceDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Create Assignment' : 'Edit Assignment'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Create a new assignment for this class.'
              : 'Edit the assignment details.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter assignment title"
              required
            />
          </div>

          {/* Type, Status, and Weight */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: AssignmentType) =>
                  setFormData(prev => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homework">Homework</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="paper">Paper</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="test">Test/Exam</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AssignmentStatus) =>
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">Not Started</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weight">Weight</Label>
              <Select
                value={formData.weight.toString()}
                onValueChange={(value) =>
                  setFormData(prev => ({ ...prev, weight: parseInt(value) as 1 | 3 | 5 | 8 | 13 | 21 }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="13">13</SelectItem>
                  <SelectItem value="21">21</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter assignment description or instructions"
              rows={3}
            />
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Due Time
              </Label>
              <Input
                id="dueTime"
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData(prev => ({ ...prev, dueTime: e.target.value }))}
              />
            </div>
          </div>

          {/* Recurrence Pattern */}
          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center gap-2">
              <Repeat className="h-4 w-4 text-muted-foreground" />
              <Label>Recurrence Pattern (Optional)</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Create a template for recurring assignments. You'll create instances manually.
            </p>

            <Select
              value={recurrenceType}
              onValueChange={(value: 'none' | 'before-class' | 'weekly' | 'biweekly') => {
                setRecurrenceType(value);
                if (value === 'none') {
                  setRecurrenceDays([]);
                  setRecurrenceTime('');
                  setRecurrenceEndDate('');
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Recurrence</SelectItem>
                <SelectItem value="before-class">Before Each Class</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="biweekly">Biweekly</SelectItem>
              </SelectContent>
            </Select>

            {recurrenceType === 'before-class' && (
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                This assignment will be due before each class meeting based on the class schedule.
              </div>
            )}

            {(recurrenceType === 'weekly' || recurrenceType === 'biweekly') && (
              <div className="space-y-3 border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                <div className="space-y-2">
                  <Label className="text-xs">Days of Week</Label>
                  <div className="flex flex-wrap gap-2">
                    {dayOptions.map(day => (
                      <label
                        key={day.value}
                        className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={recurrenceDays.includes(day.value)}
                          onChange={() => handleDayToggle(day.value)}
                          className="rounded"
                        />
                        <span className="text-xs font-medium">{day.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Time
                  </Label>
                  <Input
                    type="time"
                    value={recurrenceTime}
                    onChange={(e) => setRecurrenceTime(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    End Date (Optional)
                  </Label>
                  <Input
                    type="date"
                    value={recurrenceEndDate}
                    onChange={(e) => setRecurrenceEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto"
            >
              {mode === 'add' ? 'Create Assignment' : 'Update Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

