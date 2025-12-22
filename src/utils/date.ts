import { format, startOfWeek, endOfWeek, getISOWeek, getYear, setISOWeek, addDays } from 'date-fns';

/**
 * Calculate ISO year from a date
 * ISO year is the year that contains the Thursday of the ISO week
 */
const getISOYear = (date: Date): number => {
  // Get the Thursday of the ISO week (Thursday is day 4, Monday is day 1)
  // ISO week starts on Monday, so Thursday is 3 days after Monday
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const thursday = addDays(weekStart, 3);
  return getYear(thursday);
};

/**
 * Get current week information
 */
export const getCurrentWeek = (): { isoWeek: number; year: number } => {
  const now = new Date();
  return {
    isoWeek: getISOWeek(now),
    year: getISOYear(now) // Use ISO year to match ISO week
  };
};

/**
 * Get week dates for a given ISO week and year
 * 
 * ISO weeks don't align with calendar years. ISO week 1 is the week containing
 * the first Thursday of the year. This function correctly calculates the
 * start and end dates for any ISO week/year combination.
 */
export const getWeekDates = (isoWeek: number, year: number): { startDate: string; endDate: string } => {
  // Start with January 4th of the year, which is always in ISO week 1
  // This ensures we're working with the correct ISO year
  const jan4 = new Date(year, 0, 4);
  const jan4ISOYear = getISOYear(jan4);
  
  // If the ISO year doesn't match, adjust to the correct year
  // (ISO week 1 might belong to the previous calendar year)
  const baseDate = jan4ISOYear === year ? jan4 : new Date(year - 1, 11, 28);
  
  // Set to the correct ISO week
  const targetDate = setISOWeek(baseDate, isoWeek);
  
  // Get the start (Monday) and end (Sunday) of the ISO week
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });
  
  return {
    startDate: format(weekStart, 'yyyy-MM-dd'),
    endDate: format(weekEnd, 'yyyy-MM-dd')
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