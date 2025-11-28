import { format, startOfWeek, endOfWeek, getISOWeek, getYear, addWeeks } from 'date-fns';

/**
 * Get current week information
 */
export const getCurrentWeek = (): { isoWeek: number; year: number } => {
  const now = new Date();
  return {
    isoWeek: getISOWeek(now),
    year: getYear(now)
  };
};

/**
 * Get week dates for a given ISO week and year
 */
export const getWeekDates = (isoWeek: number, year: number): { startDate: string; endDate: string } => {
  const date = new Date(year, 0, 1);
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const targetWeek = addWeeks(weekStart, isoWeek - 1);
  
  return {
    startDate: format(targetWeek, 'yyyy-MM-dd'),
    endDate: format(endOfWeek(targetWeek, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  };
};

/**
 * Create a sprint ID from ISO week and year
 */
export const createSprintId = (isoWeek: number, year: number): string => {
  return `Week-${isoWeek}-${year}`;
};

/**
 * Get the end date for a class based on semester and year
 * Falls back to schedule endDate if available
 */
export const getClassEndDate = (classItem: { semester: string; year: number; schedule?: Array<{ endDate?: string }> }): Date => {
  // First check if schedule has an endDate
  if (classItem.schedule && classItem.schedule.length > 0) {
    const scheduleEndDates = classItem.schedule
      .map(s => s.endDate ? new Date(s.endDate) : null)
      .filter((d): d is Date => d !== null);
    
    if (scheduleEndDates.length > 0) {
      // Return the latest end date from schedules
      return new Date(Math.max(...scheduleEndDates.map(d => d.getTime())));
    }
  }
  
  // Calculate based on semester and year
  const semester = classItem.semester;
  const year = classItem.year;
  
  // Typical semester end dates (approximate)
  let month = 0;
  let day = 1;
  
  switch (semester) {
    case 'Fall':
      month = 11; // December
      day = 15;
      break;
    case 'Winter':
      month = 2; // March
      day = 15;
      break;
    case 'Spring':
      month = 5; // June
      day = 15;
      break;
    case 'Summer':
      month = 7; // August
      day = 15;
      break;
    default:
      month = 11;
      day = 31;
  }
  
  return new Date(year, month, day);
};