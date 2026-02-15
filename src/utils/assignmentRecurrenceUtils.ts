import type { Assignment, AssignmentRecurrencePattern, Class } from '@/types';

/**
 * Get the next occurrence date for an assignment based on its recurrence pattern
 */
export function getNextAssignmentOccurrence(
  assignment: Assignment,
  classItem: Class,
  afterDate: Date = new Date()
): Date | null {
  if (!assignment.recurrencePattern) {
    return null;
  }

  const pattern = assignment.recurrencePattern;
  const currentDate = new Date(afterDate);
  currentDate.setHours(0, 0, 0, 0);

  if (pattern.type === 'before-class') {
    // Find the next class meeting after the current date
    if (!classItem.schedule || classItem.schedule.length === 0) {
      return null;
    }

    // Get all class meeting dates
    const meetingDates = getClassMeetingDates(classItem, afterDate);
    if (meetingDates.length === 0) {
      return null;
    }

    // Find the first meeting date after currentDate
    const nextMeeting = meetingDates.find(date => date > currentDate);
    if (!nextMeeting) {
      return null;
    }

    // Return the day before the class (for "before class" assignments)
    const beforeClassDate = new Date(nextMeeting);
    beforeClassDate.setDate(beforeClassDate.getDate() - 1);
    return beforeClassDate;
  }

  if (pattern.type === 'weekly' || pattern.type === 'biweekly') {
    const daysOfWeek = pattern.daysOfWeek || [];
    if (daysOfWeek.length === 0) {
      return null;
    }

    const interval = pattern.type === 'biweekly' ? 2 : 1;
    let nextDate = new Date(currentDate);
    const currentDayOfWeek = nextDate.getDay();

    // Find the next matching day
    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
    let nextDay = sortedDays.find(day => day > currentDayOfWeek);

    if (!nextDay) {
      // If no day found this week, get the first day of next week
      nextDay = sortedDays[0];
      const daysUntilNext = (7 - currentDayOfWeek + nextDay) % 7 || 7;
      nextDate.setDate(nextDate.getDate() + daysUntilNext);
    } else {
      const daysUntilNext = nextDay - currentDayOfWeek;
      nextDate.setDate(nextDate.getDate() + daysUntilNext);
    }

    // Apply interval for biweekly
    if (pattern.type === 'biweekly' && interval > 1) {
      // Check if we need to skip weeks
      // This is a simplified version - you might want more sophisticated logic
    }

    // Check end date
    if (pattern.endDate) {
      const endDate = new Date(pattern.endDate);
      if (nextDate > endDate) {
        return null;
      }
    }

    return nextDate;
  }

  return null;
}

/**
 * Get all class meeting dates within a date range
 */
export function getClassMeetingDates(
  classItem: Class,
  startDate: Date = new Date(),
  endDate?: Date
): Date[] {
  if (!classItem.schedule || classItem.schedule.length === 0) {
    return [];
  }

  const meetingDates: Date[] = [];
  const end = endDate || new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000); // Default to 90 days ahead

  const dayMap: Record<string, number> = {
    'M': 1, // Monday
    'T': 2, // Tuesday
    'W': 3, // Wednesday
    'TH': 4, // Thursday
    'F': 5, // Friday
    'S': 6, // Saturday
    'SU': 0 // Sunday
  };

  classItem.schedule.forEach(scheduleItem => {
    const scheduleStart = scheduleItem.startDate ? new Date(scheduleItem.startDate) : startDate;
    const scheduleEnd = scheduleItem.endDate ? new Date(scheduleItem.endDate) : end;

    // Convert day abbreviations to day numbers
    const dayNumbers = scheduleItem.days.map(day => dayMap[day]).filter(day => day !== undefined);

    // Generate dates for each day of the week
    let currentDate = new Date(Math.max(scheduleStart.getTime(), startDate.getTime()));
    currentDate.setHours(0, 0, 0, 0);

    const scheduleEndDate = new Date(Math.min(scheduleEnd.getTime(), end.getTime()));
    scheduleEndDate.setHours(23, 59, 59, 999);

    while (currentDate <= scheduleEndDate) {
      const dayOfWeek = currentDate.getDay();
      if (dayNumbers.includes(dayOfWeek)) {
        meetingDates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
  });

  // Sort and remove duplicates
  return [...new Set(meetingDates.map(d => d.toISOString().split('T')[0]))]
    .sort()
    .map(dateStr => new Date(dateStr));
}

/**
 * Format recurrence pattern description for display
 */
export function formatRecurrencePattern(
  pattern: AssignmentRecurrencePattern,
  _classItem?: Class
): string {
  if (pattern.type === 'before-class') {
    return 'Before each class';
  }

  if (pattern.type === 'weekly' || pattern.type === 'biweekly') {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const days = (pattern.daysOfWeek || [])
      .sort((a, b) => a - b)
      .map(day => dayNames[day])
      .join(', ');

    const frequency = pattern.type === 'biweekly' ? 'Biweekly' : 'Weekly';
    const timeStr = pattern.time ? ` at ${formatTime(pattern.time)}` : '';

    return `${frequency} on ${days}${timeStr}`;
  }

  return 'Custom pattern';
}

/**
 * Format time from HH:MM to 12-hour format
 */
function formatTime(time: string): string {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Generate assignment instances from a recurring assignment template
 * This is for display purposes - actual instances are created manually
 */
export function getUpcomingAssignmentInstances(
  assignment: Assignment,
  classItem: Class,
  count: number = 5
): Array<{ date: Date; dueDate?: string; dueTime?: string }> {
  if (!assignment.recurrencePattern) {
    return [];
  }

  const instances: Array<{ date: Date; dueDate?: string; dueTime?: string }> = [];
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < count; i++) {
    const nextOccurrence = getNextAssignmentOccurrence(assignment, classItem, currentDate);
    if (!nextOccurrence) {
      break;
    }

    instances.push({
      date: nextOccurrence,
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime || assignment.recurrencePattern.time
    });

    // Move to the day after this occurrence to find the next one
    currentDate = new Date(nextOccurrence);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return instances;
}

