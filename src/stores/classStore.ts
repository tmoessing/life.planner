import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import type { Class } from '@/types';
import { STORAGE_KEYS } from '@/constants/storage';

// Core class atoms
export const classesAtom = atomWithStorage<Class[]>(STORAGE_KEYS.CLASSES, []);

// Class action atoms
export const addClassAtom = atom(
  null,
  (get, set, classData: Partial<Class>) => {
    const newClass: Class = {
      id: crypto.randomUUID(),
      title: classData.title || '',
      classCode: classData.classCode || '',
      semester: classData.semester || 'Fall',
      year: classData.year || new Date().getFullYear(),
      creditHours: classData.creditHours || 3,
      classType: classData.classType || 'Major',
      schedule: classData.schedule || [],
      assignmentIds: classData.assignmentIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const currentClasses = get(classesAtom);
    set(classesAtom, [...currentClasses, newClass]);
    return newClass;
  }
);

export const updateClassAtom = atom(
  null,
  (get, set, classId: string, updates: Partial<Class>) => {
    const classes = get(classesAtom);
    const updatedClasses = classes.map(cls => 
      cls.id === classId 
        ? { ...cls, ...updates, updatedAt: new Date().toISOString() }
        : cls
    );
    set(classesAtom, updatedClasses);
  }
);

export const deleteClassAtom = atom(
  null,
  (get, set, classId: string) => {
    const classes = get(classesAtom);
    const classToDelete = classes.find(cls => cls.id === classId);
    
    if (classToDelete) {
      // Remove class
      const updatedClasses = classes.filter(cls => cls.id !== classId);
      set(classesAtom, updatedClasses);
      
      // Note: Assignments are not automatically deleted when class is deleted
      // This allows for recovery or reassignment. If you want to delete assignments,
      // you can add that logic here using deleteAssignmentAtom
    }
  }
);

// Bulk delete atoms
export const deleteAllClassesAtom = atom(
  null,
  (_get, set) => {
    set(classesAtom, []);
  }
);

