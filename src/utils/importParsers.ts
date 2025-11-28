/**
 * Parser utilities for importing data from CSV/Google Sheets
 */

// Generate a simple ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Base parser configuration for common fields
 */
interface BaseParserConfig {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Generic parser factory for entities with common patterns
 */
export const createBaseParser = <T extends BaseParserConfig>(
  defaults: Partial<T>,
  row: any,
  fieldMappings: Record<string, string> = {}
): T => {
  const result: any = { ...defaults };
  
  // Map fields from row to result
  Object.entries(fieldMappings).forEach(([rowKey, resultKey]) => {
    const value = row[rowKey];
    if (value !== undefined && value !== null && value !== '') {
      result[resultKey] = value;
    }
  });
  
  // Always set ID, createdAt, updatedAt
  result.id = row['Id'] || defaults.id || generateId();
  result.createdAt = row['Created At'] || defaults.createdAt || new Date().toISOString();
  result.updatedAt = row['Updated At'] || defaults.updatedAt || new Date().toISOString();
  
  return result as T;
};

/**
 * Parse string array from semicolon-separated values
 */
export const parseStringArray = (value: string | undefined): string[] => {
  if (!value) return [];
  return value.split('; ').filter(Boolean);
};

/**
 * Parse integer with fallback
 */
export const parseIntSafe = (value: string | undefined, fallback: number = 0): number => {
  if (!value) return fallback;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? fallback : parsed;
};

/**
 * Parse boolean from string
 */
export const parseBoolean = (value: string | boolean | undefined): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true';
  return false;
};

/**
 * Parse optional string with trimming
 */
export const parseOptionalString = (value: string | undefined): string | undefined => {
  if (!value || typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
};

