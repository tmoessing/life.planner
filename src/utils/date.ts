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
