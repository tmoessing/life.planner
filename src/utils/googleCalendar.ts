import type { Story } from '@/types';

/**
 * Google Calendar integration utilities
 */

const SIZE_TO_HOURS: Record<string, number> = {
  'XS': 0.5,  // 30 minutes
  'S': 1,     // 1 hour
  'M': 2,     // 2 hours
  'L': 4,     // 4 hours
  'XL': 8     // 8 hours
};

/**
 * Get the start date for a story, with fallback logic
 */
export const getStoryStartDate = (story: Story): Date => {
  let startDate: Date;
  
  if (story.scheduledDate) {
    startDate = new Date(story.scheduledDate);
    // If it's a date-only string (no time), set to 9 AM
    if (!story.scheduledDate.includes('T')) {
      startDate.setHours(9, 0, 0, 0);
    }
  } else if (story.dueDate) {
    startDate = new Date(story.dueDate);
    // If it's a date-only string (no time), set to 9 AM
    if (!story.dueDate.includes('T')) {
      startDate.setHours(9, 0, 0, 0);
    }
  } else {
    // Default to today at 9 AM
    startDate = new Date();
    startDate.setHours(9, 0, 0, 0);
  }
  
  return startDate;
};

/**
 * Get the end date for a story based on its size
 */
export const getStoryEndDate = (story: Story, startDate: Date): Date => {
  const durationHours = SIZE_TO_HOURS[story.size] || 1;
  const endDate = new Date(startDate);
  endDate.setHours(endDate.getHours() + durationHours);
  return endDate;
};

/**
 * Format a date for Google Calendar URL (YYYYMMDDTHHMMSSZ format)
 */
export const formatDateForGoogleCalendar = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Generate a Google Calendar URL for a story
 */
export const generateGoogleCalendarUrl = (story: Story): string => {
  const title = encodeURIComponent(story.title);
  const description = story.description ? encodeURIComponent(story.description) : '';
  
  const startDate = getStoryStartDate(story);
  const endDate = getStoryEndDate(story, startDate);
  
  const startDateString = formatDateForGoogleCalendar(startDate);
  const endDateString = formatDateForGoogleCalendar(endDate);
  
  // Build Google Calendar URL
  let googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateString}/${endDateString}`;
  
  if (description) {
    googleCalendarUrl += `&details=${description}`;
  }
  
  if (story.location) {
    googleCalendarUrl += `&location=${encodeURIComponent(story.location)}`;
  }
  
  return googleCalendarUrl;
};

/**
 * Open a story in Google Calendar
 */
export const openStoryInGoogleCalendar = (story: Story): void => {
  const url = generateGoogleCalendarUrl(story);
  window.open(url, '_blank');
};

