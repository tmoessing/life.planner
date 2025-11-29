import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Clock } from 'lucide-react';
import { useAtom } from 'jotai';
import { addClassAtom, updateClassAtom, deleteClassAtom } from '@/stores/classStore';
import type { Class } from '@/types';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem?: Class | null;
  mode: 'add' | 'edit';
}

export function ClassModal({ isOpen, onClose, classItem, mode }: ClassModalProps) {
  const [, addClass] = useAtom(addClassAtom);
  const [, updateClass] = useAtom(updateClassAtom);
  const [, deleteClass] = useAtom(deleteClassAtom);

  const [formData, setFormData] = useState({
    title: '',
    classCode: '',
    semester: 'Fall' as Class['semester'],
    year: new Date().getFullYear(),
    creditHours: 3,
    classType: 'Major' as Class['classType'],
    schedule: [] as Array<{ time: string; endTime?: string; days: string[]; startDate?: string; endDate?: string }>
  });

  useEffect(() => {
    if (mode === 'edit' && classItem) {
      setFormData({
        title: classItem.title,
        classCode: classItem.classCode,
        semester: classItem.semester,
        year: classItem.year,
        creditHours: classItem.creditHours || 3,
        classType: classItem.classType || 'Major',
        schedule: classItem.schedule || []
      });
    } else {
      setFormData({
        title: '',
        classCode: '',
        semester: 'Fall',
        year: new Date().getFullYear(),
        creditHours: 3,
        classType: 'Major',
        schedule: []
      });
    }
  }, [mode, classItem, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'add') {
      addClass(formData);
    } else if (mode === 'edit' && classItem) {
      updateClass(classItem.id, formData);
    }

    onClose();
  };

  const handleDelete = () => {
    if (mode === 'edit' && classItem) {
      if (confirm(`Are you sure you want to delete "${classItem.title}"? This action cannot be undone.`)) {
        deleteClass(classItem.id);
        onClose();
      }
    }
  };

  const handleAddSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', endTime: '', days: [], startDate: '', endDate: '' }]
    }));
  };

  const handleRemoveSchedule = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleScheduleTimeChange = (index: number, time: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, time } : item
      )
    }));
  };

  const handleScheduleEndTimeChange = (index: number, endTime: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, endTime } : item
      )
    }));
  };

  const handleScheduleDateChange = (index: number, field: 'startDate' | 'endDate', value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleScheduleDayToggle = (index: number, day: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              days: item.days.includes(day)
                ? item.days.filter(d => d !== day)
                : [...item.days, day]
            }
          : item
      )
    }));
  };

  const dayOptions = [
    { value: 'M', label: 'Monday' },
    { value: 'T', label: 'Tuesday' },
    { value: 'W', label: 'Wednesday' },
    { value: 'TH', label: 'Thursday' },
    { value: 'F', label: 'Friday' },
    { value: 'S', label: 'Saturday' },
    { value: 'SU', label: 'Sunday' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader className="pb-1 sm:pb-4">
          <DialogTitle className="text-sm sm:text-xl">
            {mode === 'add' ? 'Create New Class' : 'Edit Class'}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm hidden sm:block">
            {mode === 'add' 
              ? 'Create a new class to organize and track your academic assignments.'
              : 'Edit the class details and manage assignments.'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-1.5 sm:space-y-4">
          {/* Class Title */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="title" className="text-xs sm:text-sm">Class Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter class title"
              required
            />
          </div>

          {/* Class Code, Semester and Year */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="classCode" className="text-xs sm:text-sm">Class Code</Label>
              <Input
                id="classCode"
                value={formData.classCode}
                onChange={(e) => setFormData(prev => ({ ...prev, classCode: e.target.value }))}
                placeholder="e.g., CS101, MATH201"
              />
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="semester" className="text-xs sm:text-sm">Semester</Label>
              <Select
                value={formData.semester}
                onValueChange={(value: Class['semester']) => 
                  setFormData(prev => ({ ...prev, semester: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fall">Fall</SelectItem>
                  <SelectItem value="Winter">Winter</SelectItem>
                  <SelectItem value="Spring">Spring</SelectItem>
                  <SelectItem value="Summer">Summer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="year" className="text-xs sm:text-sm">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                min="2000"
                max="2100"
              />
            </div>
          </div>

          {/* Credit Hours and Class Type */}
          <div className="grid grid-cols-2 gap-1.5 sm:gap-4">
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="creditHours" className="text-xs sm:text-sm">Credit Hours</Label>
              <Input
                id="creditHours"
                type="number"
                value={formData.creditHours}
                onChange={(e) => setFormData(prev => ({ ...prev, creditHours: parseInt(e.target.value) || 3 }))}
                min="1"
                max="10"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="classType" className="text-xs sm:text-sm">Class Type</Label>
              <Select
                value={formData.classType}
                onValueChange={(value: Class['classType']) => 
                  setFormData(prev => ({ ...prev, classType: value }))
                }
              >
                <SelectTrigger className="touch-target">
                  <SelectValue placeholder="Select class type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Major" className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#9333ea' }}
                      />
                      Major
                    </div>
                  </SelectItem>
                  <SelectItem value="Minor" className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#ec4899' }}
                      />
                      Minor
                    </div>
                  </SelectItem>
                  <SelectItem value="GE" className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#f97316' }}
                      />
                      GE
                    </div>
                  </SelectItem>
                  <SelectItem value="Religion" className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#eab308' }}
                      />
                      Religion
                    </div>
                  </SelectItem>
                  <SelectItem value="Elective" className="touch-target min-h-[44px]">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: '#22c55e' }}
                      />
                      Elective
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class Schedule */}
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs sm:text-sm">Class Schedule</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddSchedule}
                className="gap-1 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                <Plus className="h-4 w-4" />
                Add Time Slot
              </Button>
            </div>
            
            {formData.schedule.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                No schedule added. Click "Add Time Slot" to add class times.
              </p>
            ) : (
              <div className="space-y-3">
                {formData.schedule.map((scheduleItem, index) => (
                  <div
                    key={index}
                    className="border rounded-md p-3 space-y-3 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-3">
                        {/* Time Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Start Time
                            </Label>
                            <Input
                              type="time"
                              value={scheduleItem.time}
                              onChange={(e) => handleScheduleTimeChange(index, e.target.value)}
                              className="w-full"
                              placeholder="Select time"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              End Time
                            </Label>
                            <Input
                              type="time"
                              value={scheduleItem.endTime || ''}
                              onChange={(e) => handleScheduleEndTimeChange(index, e.target.value)}
                              className="w-full"
                              placeholder="Select time"
                              min={scheduleItem.time || undefined}
                            />
                          </div>
                        </div>

                        {/* Days Selection */}
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Days</Label>
                          <div className="flex flex-wrap gap-2">
                            {dayOptions.map(day => (
                              <label
                                key={day.value}
                                className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={scheduleItem.days.includes(day.value)}
                                  onChange={() => handleScheduleDayToggle(index, day.value)}
                                  className="rounded"
                                />
                                <span className="text-xs font-medium">{day.label}</span>
                              </label>
                            ))}
                          </div>
                          {scheduleItem.days.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Selected: {scheduleItem.days.map(d => dayOptions.find(opt => opt.value === d)?.label).join(', ')}
                            </p>
                          )}
                        </div>

                        {/* Date Range */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Start Date</Label>
                            <Input
                              type="date"
                              value={scheduleItem.startDate || ''}
                              onChange={(e) => handleScheduleDateChange(index, 'startDate', e.target.value)}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">End Date</Label>
                            <Input
                              type="date"
                              value={scheduleItem.endDate || ''}
                              onChange={(e) => handleScheduleDateChange(index, 'endDate', e.target.value)}
                              className="w-full"
                              min={scheduleItem.startDate || undefined}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSchedule(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className={`flex flex-col sm:flex-row gap-1.5 sm:gap-2 pt-1.5 sm:pt-4 ${mode === 'edit' ? 'justify-between' : 'justify-end'}`}>
            {mode === 'edit' && (
              <Button 
                type="button" 
                variant="destructive" 
                onClick={handleDelete}
                size="sm"
                className="w-full sm:w-auto touch-target h-8 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                Delete Class
              </Button>
            )}
            <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                size="sm"
                className="w-full sm:w-auto touch-target h-8 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                size="sm"
                className="w-full sm:w-auto touch-target h-8 sm:h-auto min-h-[44px] sm:min-h-0 text-xs sm:text-sm"
              >
                {mode === 'add' ? 'Create Class' : 'Update Class'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

