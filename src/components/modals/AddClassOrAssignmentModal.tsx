import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GraduationCap, FileText, Plus, Trash2, Clock, Calendar, Repeat } from 'lucide-react';
import { useAtom } from 'jotai';
import { classesAtom, addClassAtom } from '@/stores/classStore';
import { addAssignmentAtom } from '@/stores/assignmentStore';
import type { Class, AssignmentType, AssignmentStatus, AssignmentRecurrencePattern } from '@/types';

interface AddClassOrAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectClass: () => void;
  onSelectAssignment: (classId: string) => void;
}

export function AddClassOrAssignmentModal({ 
  isOpen, 
  onClose
}: AddClassOrAssignmentModalProps) {
  const [classes] = useAtom(classesAtom);
  const [, addClass] = useAtom(addClassAtom);
  const [, addAssignment] = useAtom(addAssignmentAtom);
  
  const [type, setType] = useState<'class' | 'assignment'>('assignment');
  const [selectedClassId, setSelectedClassId] = useState<string>('');

  // Class form data
  const [classFormData, setClassFormData] = useState({
    title: '',
    classCode: '',
    semester: 'Fall' as Class['semester'],
    year: new Date().getFullYear(),
    creditHours: 3,
    classType: 'Major' as Class['classType'],
    schedule: [] as Array<{ time: string; endTime?: string; days: string[]; startDate?: string; endDate?: string }>
  });

  // Assignment form data
  const [assignmentFormData, setAssignmentFormData] = useState({
    title: '',
    type: 'homework' as AssignmentType,
    description: '',
    dueDate: '',
    dueTime: '',
    status: 'not-started' as AssignmentStatus,
    weight: 3 as 1 | 3 | 5 | 8 | 13 | 21,
    recurrencePattern: undefined as AssignmentRecurrencePattern | undefined
  });

  const [recurrenceType, setRecurrenceType] = useState<'none' | 'before-class' | 'weekly' | 'biweekly'>('none');
  const [recurrenceDays, setRecurrenceDays] = useState<number[]>([]);
  const [recurrenceTime, setRecurrenceTime] = useState('');
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('');

  const dayOptions = [
    { value: 'M', label: 'Monday' },
    { value: 'T', label: 'Tuesday' },
    { value: 'W', label: 'Wednesday' },
    { value: 'TH', label: 'Thursday' },
    { value: 'F', label: 'Friday' },
    { value: 'S', label: 'Saturday' },
    { value: 'SU', label: 'Sunday' }
  ];

  const assignmentDayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset forms when modal closes
      setType('assignment');
      setSelectedClassId('');
      setClassFormData({
        title: '',
        classCode: '',
        semester: 'Fall',
        year: new Date().getFullYear(),
        creditHours: 3,
        classType: 'Major',
        schedule: []
      });
      setAssignmentFormData({
        title: '',
        type: 'homework',
        description: '',
        dueDate: '',
        dueTime: '',
        status: 'not-started',
        weight: 3,
        recurrencePattern: undefined
      });
      setRecurrenceType('none');
      setRecurrenceDays([]);
      setRecurrenceTime('');
      setRecurrenceEndDate('');
    }
  }, [isOpen]);

  const handleClassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addClass(classFormData);
    onClose();
  };

  const handleAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedClassId) return;

    let recurrencePattern: AssignmentRecurrencePattern | undefined = undefined;

    if (recurrenceType !== 'none') {
      recurrencePattern = {
        type: recurrenceType,
        daysOfWeek: recurrenceType === 'weekly' || recurrenceType === 'biweekly' ? recurrenceDays : undefined,
        time: recurrenceType === 'weekly' || recurrenceType === 'biweekly' ? recurrenceTime : undefined,
        endDate: recurrenceEndDate || undefined
      };
    }

    addAssignment({
      ...assignmentFormData,
      classId: selectedClassId,
      recurrencePattern
    });
    
    onClose();
  };

  const handleAddSchedule = () => {
    setClassFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', endTime: '', days: [], startDate: '', endDate: '' }]
    }));
  };

  const handleRemoveSchedule = (index: number) => {
    setClassFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleScheduleTimeChange = (index: number, time: string) => {
    setClassFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, time } : item
      )
    }));
  };

  const handleScheduleEndTimeChange = (index: number, endTime: string) => {
    setClassFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, endTime } : item
      )
    }));
  };

  const handleScheduleDateChange = (index: number, field: 'startDate' | 'endDate', value: string) => {
    setClassFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleScheduleDayToggle = (index: number, day: string) => {
    setClassFormData(prev => ({
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

  const handleAssignmentDayToggle = (day: number) => {
    setRecurrenceDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] sm:max-h-[90vh] overflow-y-auto p-2 sm:p-6">
        <DialogHeader className="pb-1 sm:pb-4">
          <DialogTitle className="text-sm sm:text-xl">Add New</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm hidden sm:block">
            Create a new class or assignment
          </DialogDescription>
        </DialogHeader>

        {/* Type Toggle - At the top */}
        <div className="space-y-2 pb-4 border-b mb-4">
          <Label>Type</Label>
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input
                type="radio"
                name="type-select"
                value="class"
                checked={type === 'class'}
                onChange={(e) => {
                  if (e.target.checked) {
                    setType('class');
                  }
                }}
                className="sr-only"
              />
              <div
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  type === 'class'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <GraduationCap className="h-4 w-4" />
                <span>Class</span>
              </div>
            </label>
            <label className={`flex-1 ${classes.length === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
              <input
                type="radio"
                name="type-select"
                value="assignment"
                checked={type === 'assignment'}
                onChange={(e) => {
                  if (e.target.checked && classes.length > 0) {
                    setType('assignment');
                  }
                }}
                disabled={classes.length === 0}
                className="sr-only"
              />
              <div
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border transition-colors ${
                  type === 'assignment'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-foreground border-input hover:bg-accent hover:text-accent-foreground'
                } ${classes.length === 0 ? 'pointer-events-none' : ''}`}
              >
                <FileText className="h-4 w-4" />
                <span>Assignment</span>
              </div>
            </label>
          </div>
          {type === 'assignment' && classes.length === 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Create a class first before adding assignments
            </p>
          )}
        </div>

        {type === 'class' ? (
          <form onSubmit={handleClassSubmit} className="space-y-1.5 sm:space-y-4 pt-4" style={{ pointerEvents: 'auto' }}>
            {/* Class Title */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="title" className="text-xs sm:text-sm">Class Title *</Label>
              <Input
                id="title"
                value={classFormData.title}
                onChange={(e) => setClassFormData(prev => ({ ...prev, title: e.target.value }))}
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
                  value={classFormData.classCode}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, classCode: e.target.value }))}
                  placeholder="e.g., CS101, MATH201"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="semester" className="text-xs sm:text-sm">Semester</Label>
                <Select
                  value={classFormData.semester}
                  onValueChange={(value: Class['semester']) => 
                    setClassFormData(prev => ({ ...prev, semester: value }))
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
                  value={classFormData.year}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
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
                  value={classFormData.creditHours}
                  onChange={(e) => setClassFormData(prev => ({ ...prev, creditHours: parseInt(e.target.value) || 3 }))}
                  min="1"
                  max="10"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="classType" className="text-xs sm:text-sm">Class Type</Label>
                <Select
                  value={classFormData.classType}
                  onValueChange={(value: Class['classType']) => 
                    setClassFormData(prev => ({ ...prev, classType: value }))
                  }
                >
                  <SelectTrigger className="touch-target">
                    <SelectValue placeholder="Select class type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Major" className="touch-target min-h-[44px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#9333ea' }} />
                        Major
                      </div>
                    </SelectItem>
                    <SelectItem value="Minor" className="touch-target min-h-[44px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ec4899' }} />
                        Minor
                      </div>
                    </SelectItem>
                    <SelectItem value="GE" className="touch-target min-h-[44px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f97316' }} />
                        GE
                      </div>
                    </SelectItem>
                    <SelectItem value="Religion" className="touch-target min-h-[44px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#eab308' }} />
                        Religion
                      </div>
                    </SelectItem>
                    <SelectItem value="Elective" className="touch-target min-h-[44px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />
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
              
              {classFormData.schedule.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
                  No schedule added. Click "Add Time Slot" to add class times.
                </p>
              ) : (
                <div className="space-y-3">
                  {classFormData.schedule.map((scheduleItem, index) => (
                    <div
                      key={index}
                      className="border rounded-md p-3 space-y-3 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 space-y-3">
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
                                min={scheduleItem.time || undefined}
                              />
                            </div>
                          </div>

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
                          </div>

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
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveSchedule(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 h-8 w-8 p-0"
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
            <div className="flex flex-col sm:flex-row justify-end gap-1.5 sm:gap-2 pt-1.5 sm:pt-4">
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
                Create Class
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAssignmentSubmit} className="space-y-4 pt-4" style={{ pointerEvents: 'auto' }}>
            {/* Class Selector */}
            <div className="space-y-2">
              <Label htmlFor="classSelect">Class *</Label>
              <Select value={selectedClassId} onValueChange={setSelectedClassId} required>
                <SelectTrigger id="classSelect">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((classItem) => (
                    <SelectItem key={classItem.id} value={classItem.id}>
                      {classItem.classCode || classItem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="assignmentTitle">Title *</Label>
              <Input
                id="assignmentTitle"
                value={assignmentFormData.title}
                onChange={(e) => setAssignmentFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter assignment title"
                required
              />
            </div>

            {/* Type, Status, and Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignmentType">Type</Label>
                <Select
                  value={assignmentFormData.type}
                  onValueChange={(value: AssignmentType) =>
                    setAssignmentFormData(prev => ({ ...prev, type: value }))
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
                <Label htmlFor="assignmentStatus">Status</Label>
                <Select
                  value={assignmentFormData.status}
                  onValueChange={(value: AssignmentStatus) =>
                    setAssignmentFormData(prev => ({ ...prev, status: value }))
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
                <Label htmlFor="assignmentWeight">Weight</Label>
                <Select
                  value={assignmentFormData.weight.toString()}
                  onValueChange={(value) =>
                    setAssignmentFormData(prev => ({ ...prev, weight: parseInt(value) as 1 | 3 | 5 | 8 | 13 | 21 }))
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
              <Label htmlFor="assignmentDescription">Description</Label>
              <Textarea
                id="assignmentDescription"
                value={assignmentFormData.description}
                onChange={(e) => setAssignmentFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  value={assignmentFormData.dueDate}
                  onChange={(e) => setAssignmentFormData(prev => ({ ...prev, dueDate: e.target.value }))}
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
                  value={assignmentFormData.dueTime}
                  onChange={(e) => setAssignmentFormData(prev => ({ ...prev, dueTime: e.target.value }))}
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
                <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md">
                  This assignment will be due before each class meeting based on the class schedule.
                </div>
              )}

              {(recurrenceType === 'weekly' || recurrenceType === 'biweekly') && (
                <div className="space-y-3 border rounded-md p-3 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                  <div className="space-y-2">
                    <Label className="text-xs">Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {assignmentDayOptions.map(day => (
                        <label
                          key={day.value}
                          className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1.5 rounded border border-gray-300 dark:border-gray-600 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={recurrenceDays.includes(day.value)}
                            onChange={() => handleAssignmentDayToggle(day.value)}
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
                disabled={!selectedClassId}
              >
                Create Assignment
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
