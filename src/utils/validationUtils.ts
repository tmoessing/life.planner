import type { Story, Goal, Project, Vision, Role, Label } from '@/types';

/**
 * Comprehensive validation utilities
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidationRule<T> {
  field: keyof T;
  validator: (value: any) => boolean;
  message: string;
  severity: 'error' | 'warning';
}

// Base validation functions
export const validateRequired = (value: any): boolean => {
  return value !== null && value !== undefined && value !== '';
};

export const validateString = (value: any, minLength: number = 1, maxLength: number = 1000): boolean => {
  return typeof value === 'string' && value.length >= minLength && value.length <= maxLength;
};

export const validateEmail = (value: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
};

export const validateUrl = (value: string): boolean => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const validateDate = (value: string): boolean => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

export const validateDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const validateNumber = (value: any, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): boolean => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

export const validateArray = (value: any, minLength: number = 0, maxLength: number = 1000): boolean => {
  return Array.isArray(value) && value.length >= minLength && value.length <= maxLength;
};

export const validateObject = (value: any, requiredKeys: string[] = []): boolean => {
  if (typeof value !== 'object' || value === null) return false;
  
  return requiredKeys.every(key => key in value);
};

// Story validation
export const validateStory = (story: Partial<Story>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!validateRequired(story.title)) {
    errors.push('Title is required');
  } else if (!validateString(story.title, 1, 200)) {
    errors.push('Title must be between 1 and 200 characters');
  }

  if (!validateRequired(story.description)) {
    errors.push('Description is required');
  } else if (!validateString(story.description, 1, 2000)) {
    errors.push('Description must be between 1 and 2000 characters');
  }

  // Priority validation
  if (!validateRequired(story.priority)) {
    errors.push('Priority is required');
  } else if (story.priority && !['Q1', 'Q2', 'Q3', 'Q4'].includes(story.priority)) {
    errors.push('Priority must be Q1, Q2, Q3, or Q4');
  }

  // Type validation
  if (!validateRequired(story.type)) {
    errors.push('Type is required');
  }

  // Size validation
  if (!validateRequired(story.size)) {
    errors.push('Size is required');
  } else if (story.size && !['XS', 'S', 'M', 'L', 'XL'].includes(story.size)) {
    errors.push('Size must be XS, S, M, L, or XL');
  }

  // Weight validation
  if (!validateRequired(story.weight)) {
    errors.push('Weight is required');
  } else if (!validateNumber(story.weight, 1, 21)) {
    errors.push('Weight must be between 1 and 21');
  }

  // Status validation
  if (!validateRequired(story.status)) {
    errors.push('Status is required');
  } else if (story.status && !['icebox', 'backlog', 'todo', 'progress', 'review', 'done'].includes(story.status)) {
    errors.push('Status must be icebox, backlog, todo, progress, review, or done');
  }

  // Labels validation
  if (story.labels && !validateArray(story.labels, 0, 10)) {
    warnings.push('Too many labels (maximum 10 recommended)');
  }

  // Checklist validation
  if (story.checklist && !validateArray(story.checklist, 0, 50)) {
    warnings.push('Too many checklist items (maximum 50 recommended)');
  }

  // Date validation
  if (story.dueDate && !validateDate(story.dueDate)) {
    errors.push('Due date must be a valid date');
  }

  if (story.scheduledDate && !validateDate(story.scheduledDate)) {
    errors.push('Scheduled date must be a valid date');
  }

  // Date range validation
  if (story.dueDate && story.scheduledDate) {
    if (!validateDateRange(story.scheduledDate, story.dueDate)) {
      warnings.push('Scheduled date should be before due date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Goal validation
export const validateGoal = (goal: Partial<Goal>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!validateRequired(goal.title)) {
    errors.push('Title is required');
  } else if (!validateString(goal.title, 1, 200)) {
    errors.push('Title must be between 1 and 200 characters');
  }

  if (!validateRequired(goal.description)) {
    errors.push('Description is required');
  } else if (!validateString(goal.description, 1, 2000)) {
    errors.push('Description must be between 1 and 2000 characters');
  }

  if (!validateRequired(goal.category)) {
    errors.push('Category is required');
  }

  if (!validateRequired(goal.goalType)) {
    errors.push('Goal type is required');
  }

  if (!validateRequired(goal.status)) {
    errors.push('Status is required');
  }

  // Note: Goal type doesn't have targetDate property

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Project validation
export const validateProject = (project: Partial<Project>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!validateRequired(project.name)) {
    errors.push('Name is required');
  } else if (!validateString(project.name, 1, 200)) {
    errors.push('Name must be between 1 and 200 characters');
  }

  if (!validateRequired(project.description)) {
    errors.push('Description is required');
  } else if (!validateString(project.description, 1, 2000)) {
    errors.push('Description must be between 1 and 2000 characters');
  }

  if (!validateRequired(project.status)) {
    errors.push('Status is required');
  }

  if (project.startDate && !validateDate(project.startDate)) {
    errors.push('Start date must be a valid date');
  }

  if (project.endDate && !validateDate(project.endDate)) {
    errors.push('End date must be a valid date');
  }

  if (project.startDate && project.endDate) {
    if (!validateDateRange(project.startDate, project.endDate)) {
      errors.push('Start date must be before end date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Vision validation
export const validateVision = (vision: Partial<Vision>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!validateRequired(vision.title)) {
    errors.push('Title is required');
  } else if (!validateString(vision.title, 1, 200)) {
    errors.push('Title must be between 1 and 200 characters');
  }

  if (!validateRequired(vision.description)) {
    errors.push('Description is required');
  } else if (!validateString(vision.description, 1, 2000)) {
    errors.push('Description must be between 1 and 2000 characters');
  }

  if (!validateRequired(vision.type)) {
    errors.push('Type is required');
  }

  if (vision.order !== undefined && !validateNumber(vision.order, 0)) {
    errors.push('Order must be a non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Role validation
export const validateRole = (role: Partial<Role>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!validateRequired(role.name)) {
    errors.push('Name is required');
  } else if (!validateString(role.name, 1, 100)) {
    errors.push('Name must be between 1 and 100 characters');
  }

  if (!validateRequired(role.color)) {
    errors.push('Color is required');
  } else if (role.color && !/^#[0-9A-F]{6}$/i.test(role.color)) {
    errors.push('Color must be a valid hex color');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Label validation
export const validateLabel = (label: Partial<Label>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!validateRequired(label.name)) {
    errors.push('Name is required');
  } else if (!validateString(label.name, 1, 50)) {
    errors.push('Name must be between 1 and 50 characters');
  }

  if (!validateRequired(label.color)) {
    errors.push('Color is required');
  } else if (label.color && !/^#[0-9A-F]{6}$/i.test(label.color)) {
    errors.push('Color must be a valid hex color');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Form validation
export const validateForm = <T>(
  data: T,
  rules: ValidationRule<T>[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  rules.forEach(rule => {
    const value = data[rule.field];
    const isValid = rule.validator(value);
    
    if (!isValid) {
      if (rule.severity === 'error') {
        errors.push(rule.message);
      } else {
        warnings.push(rule.message);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Bulk validation
export const validateBulk = <T>(
  items: T[],
  validator: (item: T) => ValidationResult
): { valid: T[]; invalid: Array<{ item: T; result: ValidationResult }> } => {
  const valid: T[] = [];
  const invalid: Array<{ item: T; result: ValidationResult }> = [];

  items.forEach(item => {
    const result = validator(item);
    if (result.isValid) {
      valid.push(item);
    } else {
      invalid.push({ item, result });
    }
  });

  return { valid, invalid };
};

// Validation summary
export const getValidationSummary = (results: ValidationResult[]): {
  totalItems: number;
  validItems: number;
  invalidItems: number;
  totalErrors: number;
  totalWarnings: number;
} => {
  const totalItems = results.length;
  const validItems = results.filter(r => r.isValid).length;
  const invalidItems = totalItems - validItems;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  return {
    totalItems,
    validItems,
    invalidItems,
    totalErrors,
    totalWarnings
  };
};

// Custom validation rules
export const createCustomRule = <T>(
  field: keyof T,
  validator: (value: any) => boolean,
  message: string,
  severity: 'error' | 'warning' = 'error'
): ValidationRule<T> => ({
  field,
  validator,
  message,
  severity
});

// Common validation rules
export const commonRules = {
  required: <T>(field: keyof T, message: string = 'This field is required') =>
    createCustomRule(field, validateRequired, message),
  
  string: <T>(field: keyof T, minLength: number = 1, maxLength: number = 1000) =>
    createCustomRule(field, (value) => validateString(value, minLength, maxLength), 
      `Must be between ${minLength} and ${maxLength} characters`),
  
  email: <T>(field: keyof T) =>
    createCustomRule(field, validateEmail, 'Must be a valid email address'),
  
  url: <T>(field: keyof T) =>
    createCustomRule(field, validateUrl, 'Must be a valid URL'),
  
  date: <T>(field: keyof T) =>
    createCustomRule(field, validateDate, 'Must be a valid date'),
  
  number: <T>(field: keyof T, min: number = 0, max: number = Number.MAX_SAFE_INTEGER) =>
    createCustomRule(field, (value) => validateNumber(value, min, max), 
      `Must be between ${min} and ${max}`),
  
  array: <T>(field: keyof T, minLength: number = 0, maxLength: number = 1000) =>
    createCustomRule(field, (value) => validateArray(value, minLength, maxLength), 
      `Must have between ${minLength} and ${maxLength} items`)
};
