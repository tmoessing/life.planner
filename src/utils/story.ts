import { v4 as uuidv4 } from 'uuid';
import type { Story, Priority } from '@/types';

/**
 * Create a new story with default values
 */
export const createStory = (overrides: Partial<Story> = {}): Story => {
  const now = new Date().toISOString();
  return {
    id: uuidv4(),
    title: '',
    description: '',
    labels: [],
    priority: 'Q4',
    weight: 1,
    size: 'M',
    type: 'Intellectual',
    status: 'backlog', // Default status
    checklist: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
};

/**
 * Get priority order for sorting
 */
export const getPriorityOrder = (priority: Priority): number => {
  const order = { Q1: 1, Q2: 2, Q3: 3, Q4: 4 };
  return order[priority];
};

/**
 * Map story weight to size
 */
export const getWeightSize = (weight: number): "XS" | "S" | "M" | "L" | "XL" => {
  if (weight <= 1) return 'XS';
  if (weight <= 3) return 'S';
  if (weight <= 8) return 'M';
  if (weight <= 13) return 'L';
  return 'XL';
};
