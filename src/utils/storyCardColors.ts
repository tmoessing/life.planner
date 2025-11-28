import type { Priority, StoryType } from '@/types';
import { getWeightGradientColor } from '@/utils/color';

interface StorySettings {
  getPriorityColor: (priority: Priority) => string;
  getTypeColor: (type: StoryType) => string;
  getStatusColor: (status: string) => string;
  getSizeColor: (size: string) => string;
  getTaskCategoryColor: (category: string) => string;
  weightBaseColor: string;
}

/**
 * Color utilities for story cards
 */

export const getPriorityColorStyle = (priority: Priority, storySettings: StorySettings) => {
  const priorityColor = storySettings.getPriorityColor(priority);
  return {
    backgroundColor: `${priorityColor}20`,
    color: priorityColor,
    borderColor: `${priorityColor}40`
  };
};

export const getTypeColorStyle = (type: StoryType, storySettings: StorySettings) => {
  const typeColor = storySettings.getTypeColor(type);
  return {
    backgroundColor: `${typeColor}20`,
    color: typeColor,
    borderColor: `${typeColor}40`
  };
};

export const getSizeColorStyle = (size: string, storySettings: StorySettings) => {
  const sizeColor = storySettings.getSizeColor(size);
  return {
    backgroundColor: `${sizeColor}20`,
    color: sizeColor,
    borderColor: `${sizeColor}40`
  };
};

export const getWeightColorStyle = (weight: number, storySettings: StorySettings) => {
  const gradientColor = getWeightGradientColor(weight, storySettings.weightBaseColor, 21);
  return {
    backgroundColor: `${gradientColor}20`,
    color: gradientColor,
    borderColor: `${gradientColor}40`
  };
};

