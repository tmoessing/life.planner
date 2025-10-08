/**
 * Validation utilities for forms and data
 */

export const validateStory = (story: any) => {
  const errors: string[] = [];
  
  if (!story.title || story.title.trim() === '') {
    errors.push('Title is required');
  }
  
  if (story.title && story.title.length > 200) {
    errors.push('Title must be less than 200 characters');
  }
  
  if (story.description && story.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }
  
  return errors;
};

export const validateProject = (project: any) => {
  const errors: string[] = [];
  
  if (!project.name || project.name.trim() === '') {
    errors.push('Project name is required');
  }
  
  if (project.name && project.name.length > 100) {
    errors.push('Project name must be less than 100 characters');
  }
  
  return errors;
};

export const validateGoal = (goal: any) => {
  const errors: string[] = [];
  
  if (!goal.title || goal.title.trim() === '') {
    errors.push('Goal title is required');
  }
  
  if (goal.title && goal.title.length > 200) {
    errors.push('Goal title must be less than 200 characters');
  }
  
  return errors;
};
