import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Assignment } from '@/types';
import { STORAGE_KEYS } from '@/constants/storage';
import { classesAtom } from './classStore';

// Core assignment atoms
export const assignmentsAtom = atomWithStorage<Assignment[]>(STORAGE_KEYS.ASSIGNMENTS, []);

// Assignment action atoms
export const addAssignmentAtom = atom(
  null,
  (get, set, assignmentData: Partial<Assignment> & { classId: string; title: string; type: Assignment['type'] }) => {
    const newAssignment: Assignment = {
      id: crypto.randomUUID(),
      classId: assignmentData.classId,
      title: assignmentData.title,
      type: assignmentData.type,
      description: assignmentData.description,
      dueDate: assignmentData.dueDate,
      dueTime: assignmentData.dueTime,
      status: assignmentData.status || 'not-started',
      weight: assignmentData.weight || 3,
      recurrencePattern: assignmentData.recurrencePattern,
      storyId: assignmentData.storyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentAssignments = get(assignmentsAtom);
    set(assignmentsAtom, [...currentAssignments, newAssignment]);
    
    // Add to class
    const classes = get(classesAtom);
    const updatedClasses = classes.map(cls =>
      cls.id === assignmentData.classId
        ? { ...cls, assignmentIds: [...(cls.assignmentIds || []), newAssignment.id], updatedAt: new Date().toISOString() }
        : cls
    );
    set(classesAtom, updatedClasses);
    
    return newAssignment;
  }
);

export const updateAssignmentAtom = atom(
  null,
  (get, set, assignmentId: string, updates: Partial<Assignment>) => {
    const assignments = get(assignmentsAtom);
    const updatedAssignments = assignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, ...updates, updatedAt: new Date().toISOString() }
        : assignment
    );
    set(assignmentsAtom, updatedAssignments);
  }
);

export const deleteAssignmentAtom = atom(
  null,
  (get, set, assignmentId: string) => {
    const assignments = get(assignmentsAtom);
    const assignment = assignments.find(a => a.id === assignmentId);
    
    if (assignment) {
      // Remove from assignments
      const updatedAssignments = assignments.filter(a => a.id !== assignmentId);
      set(assignmentsAtom, updatedAssignments);
      
      // Remove from class
      const classes = get(classesAtom);
      const updatedClasses = classes.map(cls =>
        cls.id === assignment.classId
          ? { ...cls, assignmentIds: (cls.assignmentIds || []).filter(id => id !== assignmentId), updatedAt: new Date().toISOString() }
          : cls
      );
      set(classesAtom, updatedClasses);
    }
  }
);

// Assignment-Class management atoms
export const addAssignmentToClassAtom = atom(
  null,
  (get, set, classId: string, assignmentId: string) => {
    const classes = get(classesAtom);
    const updatedClasses = classes.map(cls =>
      cls.id === classId
        ? { ...cls, assignmentIds: [...(cls.assignmentIds || []), assignmentId], updatedAt: new Date().toISOString() }
        : cls
    );
    set(classesAtom, updatedClasses);
    
    // Update assignment's classId
    const assignments = get(assignmentsAtom);
    const updatedAssignments = assignments.map(assignment =>
      assignment.id === assignmentId
        ? { ...assignment, classId, updatedAt: new Date().toISOString() }
        : assignment
    );
    set(assignmentsAtom, updatedAssignments);
  }
);

export const removeAssignmentFromClassAtom = atom(
  null,
  (get, set, classId: string, assignmentId: string) => {
    const classes = get(classesAtom);
    const updatedClasses = classes.map(cls =>
      cls.id === classId
        ? { ...cls, assignmentIds: (cls.assignmentIds || []).filter(id => id !== assignmentId), updatedAt: new Date().toISOString() }
        : cls
    );
    set(classesAtom, updatedClasses);
  }
);

// Bulk delete atoms
export const deleteAllAssignmentsAtom = atom(
  null,
  (_get, set) => {
    set(assignmentsAtom, []);
  }
);

