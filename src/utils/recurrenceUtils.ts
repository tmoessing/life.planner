import type { Story, RecurrenceInstance, RecurrencePattern } from '@/types';

/**
 * Generate virtual instances for a recurring story within a date range
 */
export function generateRecurrenceInstances(
  story: Story,
  startDate: Date,
  endDate: Date
): RecurrenceInstance[] {
  if (!story.repeat || story.repeat.cadence === 'none') {
    return [];
  }

  const instances: RecurrenceInstance[] = [];
  
  // Use the story's creation date as the starting point for recurrence
  const storyCreatedDate = new Date(story.createdAt);
  const recurrenceStartDate = new Date(Math.max(storyCreatedDate.getTime(), startDate.getTime()));
  
  const occurrenceDates = calculateOccurrences(story.repeat as RecurrencePattern, recurrenceStartDate);
  
  occurrenceDates.forEach(date => {
    if (date >= startDate && date <= endDate) {
      const instanceDate = date.toISOString().split('T')[0];
      const instanceOverride = story.repeat?.instances?.[instanceDate];
      
      instances.push({
        date: instanceDate,
        storyId: story.id,
        status: instanceOverride?.status || story.status,
        completed: instanceOverride?.completed || false,
        skipped: instanceOverride?.skipped || false,
        isOriginal: false
      });
    }
  });

  return instances;
}

/**
 * Calculate the next occurrence date for a recurring story
 */
export function getNextOccurrence(story: Story, afterDate: Date): Date | null {
  if (!story.repeat || story.repeat.cadence === 'none') {
    return null;
  }

  const occurrences = calculateOccurrences(story.repeat as RecurrencePattern, afterDate);
  return occurrences.length > 0 ? occurrences[0] : null;
}

/**
 * Determine which complete week (Mon-Sun) a date falls in within its month
 */
export function getWeekOfMonth(date: Date): "first" | "second" | "third" | "fourth" | "last" {
  const year = date.getFullYear();
  const month = date.getMonth();
  
  // Find all complete weeks in the month
  const completeWeeks = getCompleteWeeksInMonth(year, month);
  
  // Find which week this date falls in
  for (let i = 0; i < completeWeeks.length; i++) {
    const weekStart = completeWeeks[i];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    if (date >= weekStart && date <= weekEnd) {
      const weekIndex = i;
      if (weekIndex === 0) return "first";
      if (weekIndex === 1) return "second";
      if (weekIndex === 2) return "third";
      if (weekIndex === 3) return "fourth";
      if (weekIndex === completeWeeks.length - 1) return "last";
      return "fourth"; // fallback for any other week
    }
  }
  
  return "first"; // fallback
}

/**
 * Check if a week (Mon-Sun) is entirely within a month
 */
export function isCompleteWeekInMonth(weekStart: Date): boolean {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const month = weekStart.getMonth();
  const year = weekStart.getFullYear();
  
  return weekStart.getMonth() === month && 
         weekStart.getFullYear() === year &&
         weekEnd.getMonth() === month && 
         weekEnd.getFullYear() === year;
}

/**
 * Find the start date of a specific complete week in a month
 */
export function findWeekInMonth(
  year: number, 
  month: number, 
  weekOfMonth: "first" | "second" | "third" | "fourth" | "last"
): Date | null {
  const completeWeeks = getCompleteWeeksInMonth(year, month);
  
  switch (weekOfMonth) {
    case "first":
      return completeWeeks[0] || null;
    case "second":
      return completeWeeks[1] || null;
    case "third":
      return completeWeeks[2] || null;
    case "fourth":
      return completeWeeks[3] || null;
    case "last":
      return completeWeeks[completeWeeks.length - 1] || null;
    default:
      return null;
  }
}

/**
 * Get all complete weeks (Mon-Sun) that fall entirely within a month
 */
function getCompleteWeeksInMonth(year: number, month: number): Date[] {
  const weeks: Date[] = [];
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  // Find the first Monday of the month or the first day if it's Monday
  let currentDate = new Date(firstDay);
  const dayOfWeek = currentDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
  currentDate.setDate(currentDate.getDate() - daysToMonday);
  
  // If we went back to previous month, move to first Monday of current month
  if (currentDate.getMonth() !== month) {
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  // Find all complete weeks in the month
  while (currentDate <= lastDay) {
    if (isCompleteWeekInMonth(currentDate)) {
      weeks.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 7);
  }
  
  return weeks;
}

/**
 * Calculate all occurrence dates for a recurrence pattern
 */
export function calculateOccurrences(pattern: RecurrencePattern, startDate: Date): Date[] {
  const occurrences: Date[] = [];
  const interval = pattern.interval || 1;
  
  // For weekly patterns, start from the beginning of the week containing startDate
  let currentDate = new Date(startDate);
  
  // Adjust start date for weekly patterns to start from the beginning of the week
  if (pattern.cadence === 'weekly' || pattern.cadence === 'biweekly') {
    const dayOfWeek = currentDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
    currentDate.setDate(currentDate.getDate() - daysToMonday);
  }
  
  let count = 1; // Start at 1 since first occurrence already added
  const hasCountLimit = pattern.count !== undefined;
  const maxCount = pattern.count || 1000; // Use 1000 as safety limit
  const endDate = pattern.endDate ? new Date(pattern.endDate) : null;
  
  // Always include the first occurrence
  if (shouldIncludeDate(currentDate, pattern)) {
    occurrences.push(new Date(currentDate));
  }
  
  while ((!hasCountLimit || count < maxCount) && (!endDate || currentDate <= endDate)) {
    // Move to next occurrence
    currentDate = getNextOccurrenceDate(currentDate, pattern, interval);
    
    if (shouldIncludeDate(currentDate, pattern)) {
      occurrences.push(new Date(currentDate));
      count++;
    }
    
    // Safety check to prevent infinite loops
    if (occurrences.length > 1000) break;
  }
  
  return occurrences;
}

/**
 * Check if a date should be included based on the recurrence pattern
 */
function shouldIncludeDate(date: Date, pattern: RecurrencePattern): boolean {
  // Check day of week for weekly patterns
  if (pattern.cadence === 'weekly' && pattern.daysOfWeek) {
    const dayOfWeek = date.getDay();
    return pattern.daysOfWeek.includes(dayOfWeek);
  }
  
  // Check week of month for monthly patterns
  if (pattern.cadence === 'monthly' && pattern.weekOfMonth) {
    const weekOfMonth = getWeekOfMonth(date);
    return weekOfMonth === pattern.weekOfMonth;
  }
  
  return true;
}

/**
 * Calculate the next occurrence date based on the pattern
 */
function getNextOccurrenceDate(currentDate: Date, pattern: RecurrencePattern, interval: number): Date {
  const nextDate = new Date(currentDate);
  
  switch (pattern.cadence) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
    case 'biweekly':
      nextDate.setDate(nextDate.getDate() + (7 * interval));
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    default:
      nextDate.setDate(nextDate.getDate() + interval);
  }
  
  return nextDate;
}

/**
 * Check if an instance should be displayed (not skipped/deleted)
 */
export function shouldShowInstance(story: Story, date: string): boolean {
  if (!story.repeat?.instances) return true;
  
  const instance = story.repeat.instances[date];
  return !instance?.skipped;
}

/**
 * Get the status for a specific instance date
 */
export function getInstanceStatus(story: Story, date: string): Story['status'] {
  if (!story.repeat?.instances) return story.status;
  
  const instance = story.repeat.instances[date];
  return instance?.status || story.status;
}

/**
 * Check if an instance is completed
 */
export function isInstanceCompleted(story: Story, date: string): boolean {
  if (!story.repeat?.instances) return false;
  
  const instance = story.repeat.instances[date];
  return instance?.completed || false;
}

/**
 * Check if an instance is skipped
 */
export function isInstanceSkipped(story: Story, date: string): boolean {
  if (!story.repeat?.instances) return false;
  
  const instance = story.repeat.instances[date];
  return instance?.skipped || false;
}

/**
 * Create a virtual story instance for display
 */
export function createVirtualStoryInstance(
  story: Story, 
  instanceDate: string
): Story & { _isRecurringInstance: boolean; _instanceDate: string; _originalId: string } {
  const instanceStatus = getInstanceStatus(story, instanceDate);
  
  return {
    ...story,
    id: `${story.id}-${instanceDate}`,
    status: instanceStatus,
    _isRecurringInstance: true,
    _instanceDate: instanceDate,
    _originalId: story.id
  };
}
