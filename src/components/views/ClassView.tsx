import { useState, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { useAtom } from 'jotai';
import { ClassModal } from '@/components/modals/ClassModal';
import { AssignmentModal } from '@/components/modals/AssignmentModal';
import { AddClassOrAssignmentModal } from '@/components/modals/AddClassOrAssignmentModal';
import { classesAtom } from '@/stores/classStore';
import { assignmentsAtom, deleteAssignmentAtom, updateAssignmentAtom } from '@/stores/assignmentStore';
import { settingsAtom } from '@/stores/settingsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Plus, Edit, FileText, Book, FileCheck, FolderKanban, ClipboardList, MoreHorizontal, Trash2, CheckCircle2, List, Grid, BarChart3, Weight, Loader2 } from 'lucide-react';
import type { Class, Assignment, AssignmentType } from '@/types';
import { formatRecurrencePattern } from '@/utils/assignmentRecurrenceUtils';
import { getWeightGradientColor } from '@/utils/color';
import { getClassEndDate } from '@/utils/date';

// Lazy load chart component to reduce initial bundle size
const ClassAnalyticsCharts = lazy(() => import('@/components/charts/ClassAnalyticsCharts').then(m => ({ default: m.ClassAnalyticsCharts })));

export function ClassView() {
  const [classes] = useAtom(classesAtom);
  const [assignments] = useAtom(assignmentsAtom);
  const [settings] = useAtom(settingsAtom);
  const [, deleteAssignment] = useAtom(deleteAssignmentAtom);
  const [, updateAssignment] = useAtom(updateAssignmentAtom);
  
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentModalMode, setAssignmentModalMode] = useState<'add' | 'edit'>('add');
  const [assignmentClassId, setAssignmentClassId] = useState<string>('');
  
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [showCharts, setShowCharts] = useState(false);
  const [selectedClassForAnalytics, setSelectedClassForAnalytics] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const classRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleAddClass = () => {
    setSelectedClass(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  const handleSelectClassFromModal = () => {
    handleAddClass();
  };

  const handleSelectAssignmentFromModal = (classId: string) => {
    setAssignmentClassId(classId);
    setSelectedAssignment(null);
    setAssignmentModalMode('add');
    setIsAssignmentModalOpen(true);
  };

  const handleEditClass = (classItem: Class) => {
    setSelectedClass(classItem);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const getClassAssignments = (classItem: Class) => {
    return assignments.filter(assignment =>
      classItem.assignmentIds?.includes(assignment.id)
    );
  };

  const handleAddAssignment = (classId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setAssignmentClassId(classId);
    setSelectedAssignment(null);
    setAssignmentModalMode('add');
    setIsAssignmentModalOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedAssignment(assignment);
    setAssignmentClassId(assignment.classId);
    setAssignmentModalMode('edit');
    setIsAssignmentModalOpen(true);
  };

  const handleDeleteAssignment = (assignmentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this assignment?')) {
      deleteAssignment(assignmentId);
    }
  };

  const handleToggleAssignmentStatus = (assignment: Assignment, e: React.MouseEvent) => {
    e.stopPropagation();
    const statusOrder: Assignment['status'][] = ['not-started', 'in-progress', 'completed', 'submitted'];
    const currentIndex = statusOrder.indexOf(assignment.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];
    updateAssignment(assignment.id, { status: nextStatus });
  };

  const getAssignmentTypeIcon = (type: AssignmentType | string) => {
    // Handle legacy "exam" type
    if (type === 'exam') type = 'test';
    
    switch (type) {
      case 'homework':
        return <FileText className="h-4 w-4" />;
      case 'reading':
        return <Book className="h-4 w-4" />;
      case 'paper':
        return <FileCheck className="h-4 w-4" />;
      case 'project':
        return <FolderKanban className="h-4 w-4" />;
      case 'test':
        return <ClipboardList className="h-4 w-4" />;
      default:
        return <MoreHorizontal className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Assignment['status']) => {
    switch (status) {
      case 'not-started':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const groupAssignmentsByType = (assignments: Assignment[]) => {
    const grouped: Record<AssignmentType, Assignment[]> = {
      homework: [],
      reading: [],
      paper: [],
      project: [],
      test: [],
      other: []
    };

    assignments.forEach(assignment => {
      // Handle legacy "exam" type by treating it as "test"
      const assignmentType = (assignment.type === 'test' || (assignment.type as string) === 'exam') ? 'test' : assignment.type;
      if (grouped[assignmentType]) {
        grouped[assignmentType].push(assignment);
      } else {
        grouped.other.push(assignment);
      }
    });

    return grouped;
  };

  const getSemesterColor = (semester: Class['semester']) => {
    const colors = {
      Fall: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      Winter: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
      Spring: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
      Summer: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
    };
    return colors[semester] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  };

  const getClassTypeColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
      Minor: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
      GE: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
      Religion: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
      Elective: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
    };
    return colors[classType] || 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  };

  const getClassTypeBorderColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'border-purple-300 dark:border-purple-700',
      Minor: 'border-pink-300 dark:border-pink-700',
      GE: 'border-orange-300 dark:border-orange-700',
      Religion: 'border-yellow-300 dark:border-yellow-700',
      Elective: 'border-green-300 dark:border-green-700'
    };
    return colors[classType] || 'border-gray-300 dark:border-gray-700';
  };

  const getClassTypeAccentColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'bg-purple-500',
      Minor: 'bg-pink-500',
      GE: 'bg-orange-500',
      Religion: 'bg-yellow-500',
      Elective: 'bg-green-500'
    };
    return colors[classType] || 'bg-gray-500';
  };

  const getClassTypeBgColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'bg-purple-50 dark:bg-purple-950/50',
      Minor: 'bg-pink-50 dark:bg-pink-950/50',
      GE: 'bg-orange-50 dark:bg-orange-950/50',
      Religion: 'bg-yellow-50 dark:bg-yellow-950/50',
      Elective: 'bg-green-50 dark:bg-green-950/50'
    };
    return colors[classType] || 'bg-gray-50 dark:bg-gray-900/50';
  };

  const getClassTypeButtonColor = (classType: Class['classType']) => {
    const colors = {
      Major: 'bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-900/50',
      Minor: 'bg-pink-100 text-pink-800 border-pink-300 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700 dark:hover:bg-pink-900/50',
      GE: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/50',
      Religion: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700 dark:hover:bg-yellow-900/50',
      Elective: 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/50'
    };
    return colors[classType] || 'bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700';
  };

  const getDayName = (dayAbbr: string): string => {
    const dayMap: Record<string, string> = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'TH': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday',
      'SU': 'Sunday'
    };
    return dayMap[dayAbbr] || dayAbbr;
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    // Convert 24-hour format (HH:MM) to 12-hour format (H:MM AM/PM)
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const scrollToClass = useCallback((classId: string) => {
    const element = classRefs.current[classId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }, []);

  // Get all assignments up to class end dates
  const allAssignments = useMemo(() => {
    const now = new Date();
    return assignments.filter(assignment => {
      const classItem = classes.find(c => c.id === assignment.classId);
      if (!classItem) return false;
      
      const classEndDate = getClassEndDate(classItem);
      // Include assignment if it's due before or on the class end date
      if (assignment.dueDate) {
        const dueDate = new Date(assignment.dueDate);
        return dueDate <= classEndDate;
      }
      // If no due date, include if class hasn't ended
      return classEndDate >= now;
    });
  }, [assignments, classes]);

  // Chart data for assignments by class (use all assignments for analytics)
  const assignmentsByClassData = useMemo(() => {
    const classMap = new Map<string, number>();
    assignments.forEach(assignment => {
      const classItem = classes.find(c => c.id === assignment.classId);
      if (classItem) {
        const key = classItem.classCode || classItem.title;
        classMap.set(key, (classMap.get(key) || 0) + 1);
      }
    });
    return Array.from(classMap.entries()).map(([name, value]) => ({ name, value }));
  }, [assignments, classes]);

  // Chart data for assignments by class type (use all assignments for analytics)
  const assignmentsByClassTypeData = useMemo(() => {
    const typeMap = new Map<string, number>();
    assignments.forEach(assignment => {
      const classItem = classes.find(c => c.id === assignment.classId);
      if (classItem) {
        const classType = classItem.classType || 'Major';
        typeMap.set(classType, (typeMap.get(classType) || 0) + 1);
      }
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  }, [assignments, classes]);

  // Chart data for assignments by assignment type (use all assignments for analytics)
  const assignmentsByTypeData = useMemo(() => {
    const typeMap = new Map<string, number>();
    assignments.forEach(assignment => {
      const type = ((assignment.type as string) === 'exam' || assignment.type === 'test') ? 'test' : assignment.type;
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    return Array.from(typeMap.entries()).map(([name, value]) => ({ name, value }));
  }, [assignments]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0', '#ffb347'];

  // Chart data for assignment statuses by selected class (use all assignments for analytics)
  const assignmentsByStatusData = useMemo(() => {
    if (!selectedClassForAnalytics || selectedClassForAnalytics === 'all') return [];
    
    const classAssignments = assignments.filter(a => a.classId === selectedClassForAnalytics);
    const statusMap = new Map<string, number>();
    
    classAssignments.forEach(assignment => {
      const status = assignment.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });
    
    return Array.from(statusMap.entries()).map(([name, value]) => ({ 
      name: name.replace('-', ' '), 
      value 
    }));
  }, [assignments, selectedClassForAnalytics]);

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      {/* Class codes navigation row with Add button */}
      <div className="mb-2 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex items-start gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap flex-1 min-w-0">
            {classes.map((classItem) => {
              const classType = classItem.classType || 'Major';
              const buttonColor = getClassTypeButtonColor(classType);
              return (
                <Button
                  key={classItem.id}
                  variant="outline"
                  size="sm"
                  onClick={() => scrollToClass(classItem.id)}
                  className={`flex-shrink-0 whitespace-nowrap h-7 px-2 text-xs ${buttonColor}`}
                >
                  {classItem.classCode || classItem.title}
                </Button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {viewMode === 'list' && (
              <Button
                variant={showCharts ? "default" : "outline"}
                size="sm"
                onClick={() => setShowCharts(!showCharts)}
                className="h-8 gap-1.5"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline text-xs">Charts</span>
              </Button>
            )}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'cards' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-2 rounded-r-none"
              >
                <Grid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant={viewMode === 'list' ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-2 rounded-l-none"
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
            <Button onClick={handleAddClick} size="sm" className="h-8 gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline text-xs">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {classes.length === 0 ? (
        <Card className="flex-1 flex items-center justify-center">
          <CardContent className="text-center py-12">
            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No classes yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first class to get started
            </p>
            <Button onClick={handleAddClass} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Class
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'list' ? (
        <>
          {/* Charts Section */}
          {showCharts && (
            <div className="space-y-4 mb-4">
              {/* Class Selector for Status Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select Class for Status Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={selectedClassForAnalytics} onValueChange={setSelectedClassForAnalytics}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a class to view assignment statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {classes.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.classCode || classItem.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              <Suspense fallback={
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <Card key={i}>
                      <CardContent className="h-[200px] flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              }>
                <ClassAnalyticsCharts
                  assignmentsByClassData={assignmentsByClassData}
                  assignmentsByClassTypeData={assignmentsByClassTypeData}
                  assignmentsByTypeData={assignmentsByTypeData}
                  assignmentsByStatusData={assignmentsByStatusData}
                  selectedClassForAnalytics={selectedClassForAnalytics}
                  colors={COLORS}
                  statusChartTitle={selectedClassForAnalytics && selectedClassForAnalytics !== 'all' 
                    ? `Status - ${classes.find(c => c.id === selectedClassForAnalytics)?.classCode || classes.find(c => c.id === selectedClassForAnalytics)?.title}`
                    : undefined}
                />
              </Suspense>
            </div>
          )}

          {/* Assignments List */}
          <div className="space-y-2 overflow-y-auto">
            {allAssignments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No assignments</h3>
                  <p className="text-sm text-muted-foreground">
                    All assignments up to class end dates will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              allAssignments.map((assignment) => {
                const classItem = classes.find(c => c.id === assignment.classId);
                const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed' && assignment.status !== 'submitted';
                const classType = classItem?.classType || 'Major';
                const borderColor = getClassTypeBorderColor(classType);
                
                return (
                  <Card key={assignment.id} className={`hover:shadow-md transition-shadow border-2 ${borderColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {getAssignmentTypeIcon(assignment.type)}
                            <h3 className="font-semibold text-sm">{assignment.title}</h3>
                            {classItem && (
                              <Badge variant="outline" className={`text-xs ${getClassTypeButtonColor(classType)}`}>
                                {classItem.classCode || classItem.title}
                              </Badge>
                            )}
                          </div>
                          {assignment.description && (
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {assignment.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className={`text-xs ${getStatusColor(assignment.status)}`}>
                              {assignment.status.replace('-', ' ')}
                            </Badge>
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                backgroundColor: `${getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21)}20`,
                                color: getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21),
                                borderColor: getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21)
                              }}
                            >
                              W:{assignment.weight || 3}
                            </Badge>
                            {assignment.dueDate && (
                              <span className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                                Due: {formatDate(assignment.dueDate)}
                                {assignment.dueTime && ` at ${formatTime(assignment.dueTime)}`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleToggleAssignmentStatus(assignment, e)}
                            className="h-8 w-8 p-0"
                            title="Toggle status"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditAssignment(assignment, e)}
                            className="h-8 w-8 p-0"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteAssignment(assignment.id, e)}
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* Classes grid - horizontal scroll on mobile, grid on desktop */}
          <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-x-auto md:overflow-y-auto md:overflow-x-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
            {classes.map((classItem) => {
            const classAssignments = getClassAssignments(classItem);
            const assignmentsByType = groupAssignmentsByType(classAssignments);
            const hasAssignments = classAssignments.length > 0;
            const totalWeight = classAssignments.reduce((sum, assignment) => sum + (assignment.weight || 3), 0);
            
            const classType = classItem.classType || 'Major';
            const borderColor = getClassTypeBorderColor(classType);
            const accentColor = getClassTypeAccentColor(classType);
            const bgColor = getClassTypeBgColor(classType);
            
            return (
              <Card 
                key={classItem.id}
                ref={(el) => {
                  classRefs.current[classItem.id] = el;
                }}
                className={`hover:shadow-md transition-shadow border-2 ${borderColor} ${bgColor} relative overflow-hidden flex-shrink-0 w-[85vw] md:w-auto`}
              >
                {/* Class type accent bar */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 ${accentColor}`}
                />
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle 
                        className="text-lg mb-2 cursor-pointer"
                        onClick={() => handleEditClass(classItem)}
                      >
                        {classItem.title}
                      </CardTitle>
                      {classItem.classCode && (
                        <Badge variant="outline" className="text-xs mb-2">
                          {classItem.classCode}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClass(classItem);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSemesterColor(classItem.semester)}`}
                      >
                        {classItem.semester} {classItem.year}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getClassTypeColor(classItem.classType || 'Major')}`}
                      >
                        {classItem.classType || 'Major'}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      >
                        {classItem.creditHours || 3} credit{classItem.creditHours !== 1 ? 's' : ''}
                      </Badge>
                    </div>

                    {classItem.schedule && classItem.schedule.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <div className="font-medium mb-1">Schedule:</div>
                        {classItem.schedule.map((scheduleItem, idx) => (
                          <div key={idx} className="ml-2 space-y-0.5">
                            <div>
                              {scheduleItem.days.map(getDayName).join(', ')} 
                              {scheduleItem.time && (
                                scheduleItem.endTime
                                  ? ` at ${formatTime(scheduleItem.time)} - ${formatTime(scheduleItem.endTime)}`
                                  : ` at ${formatTime(scheduleItem.time)}`
                              )}
                            </div>
                            {(scheduleItem.startDate || scheduleItem.endDate) && (
                              <div className="text-xs opacity-75 ml-2">
                                {scheduleItem.startDate && scheduleItem.endDate
                                  ? `${formatDate(scheduleItem.startDate)} - ${formatDate(scheduleItem.endDate)}`
                                  : scheduleItem.startDate
                                  ? `From ${formatDate(scheduleItem.startDate)}`
                                  : scheduleItem.endDate
                                  ? `Until ${formatDate(scheduleItem.endDate)}`
                                  : ''}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Assignments Section */}
                    <div className="border-t pt-3 mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-muted-foreground">
                            Assignments ({classAssignments.length})
                          </span>
                          <div title={`Total Weight: ${totalWeight}`}>
                            <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => handleAddAssignment(classItem.id, e)}
                          className="h-6 px-2 text-xs"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {!hasAssignments ? (
                          <p className="text-xs text-muted-foreground text-center py-2">
                            No assignments yet. Click "Add" to create one.
                          </p>
                        ) : (
                            Object.entries(assignmentsByType).map(([type, typeAssignments]) => {
                              if (typeAssignments.length === 0) return null;
                              return (
                                <div key={type} className="space-y-1">
                                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    {getAssignmentTypeIcon(type as AssignmentType)}
                                    <span className="capitalize">{type}</span>
                                    <span className="text-xs opacity-75">({typeAssignments.length})</span>
                                  </div>
                                  <div className="space-y-1 ml-6">
                                    {typeAssignments.map(assignment => {
                                      const isOverdue = assignment.dueDate && new Date(assignment.dueDate) < new Date() && assignment.status !== 'completed' && assignment.status !== 'submitted';
                                      return (
                                        <div
                                          key={assignment.id}
                                          className="text-xs border rounded p-2 bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/50 dark:hover:bg-gray-800 transition-colors"
                                        >
                                          <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1 min-w-0">
                                              <div className="font-medium truncate">{assignment.title}</div>
                                              {assignment.description && (
                                                <div className="text-muted-foreground text-xs mt-0.5 line-clamp-1">
                                                  {assignment.description}
                                                </div>
                                              )}
                                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                <Badge
                                                  variant="outline"
                                                  className={`text-xs ${getStatusColor(assignment.status)}`}
                                                >
                                                  {assignment.status.replace('-', ' ')}
                                                </Badge>
                                                <Badge
                                                  variant="outline"
                                                  className="text-xs"
                                                  style={{
                                                    backgroundColor: `${getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21)}20`,
                                                    color: getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21),
                                                    borderColor: getWeightGradientColor(assignment.weight || 3, settings.assignmentWeightBaseColor || settings.weightBaseColor || '#3B82F6', 21)
                                                  }}
                                                >
                                                  W:{assignment.weight || 3}
                                                </Badge>
                                                {assignment.dueDate && (
                                                  <span className={`text-xs ${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-muted-foreground'}`}>
                                                    Due: {formatDate(assignment.dueDate)}
                                                    {assignment.dueTime && ` at ${formatTime(assignment.dueTime)}`}
                                                  </span>
                                                )}
                                                {assignment.recurrencePattern && (
                                                  <span className="text-xs text-muted-foreground italic">
                                                    {formatRecurrencePattern(assignment.recurrencePattern, classItem)}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleToggleAssignmentStatus(assignment, e)}
                                                className="h-6 w-6 p-0"
                                                title="Toggle status"
                                              >
                                                <CheckCircle2 className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleEditAssignment(assignment, e)}
                                                className="h-6 w-6 p-0"
                                                title="Edit"
                                              >
                                                <Edit className="h-3 w-3" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => handleDeleteAssignment(assignment.id, e)}
                                                className="h-6 w-6 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                                title="Delete"
                                              >
                                                <Trash2 className="h-3 w-3" />
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
        </>
      )}

      {/* Add Class or Assignment Modal */}
      <AddClassOrAssignmentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSelectClass={handleSelectClassFromModal}
        onSelectAssignment={handleSelectAssignmentFromModal}
      />

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        assignment={selectedAssignment}
        classId={assignmentClassId}
        mode={assignmentModalMode}
      />

      {/* Class Modal */}
      <ClassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        classItem={selectedClass}
        mode={modalMode}
      />
    </div>
  );
}

