
import { format, parseISO, isValid } from 'date-fns';

type Joinable = string | number | boolean | null | undefined;

export const templateUtilities = {
  formatDate: (dateString: string, formatStr: string = 'MMM yyyy'): string => {
    if (!dateString) return '';
    
    try {
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, formatStr);
      }
      return dateString;
    } catch {
      return dateString;
    }
  },

  formatDateRange: (startDate: string, endDate: string | null, isCurrent: boolean = false): string => {
    const formattedStart = templateUtilities.formatDate(startDate);
    
    if (isCurrent || !endDate) {
      return `${formattedStart} - Present`;
    }
    
    const formattedEnd = templateUtilities.formatDate(endDate);
    return `${formattedStart} - ${formattedEnd}`;
  },

  joinArray: (array: Joinable[] | unknown, separator: string = ', '): string => {
    if (!Array.isArray(array)) return '';
    return array
      .filter((item: Joinable): item is Exclude<Joinable, null | undefined> => 
        item !== null && item !== undefined && item !== ''
      )
      .map(String)
      .join(separator);
  },

  truncate: (text: string, length: number = 100): string => {
    if (!text || text.length <= length) return text;
    return `${text.substring(0, length).trim()}...`;
  },

  capitalize: (text: string): string => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  formatProficiency: (proficiency: number): string => {
    if (proficiency >= 9) return 'Expert';
    if (proficiency >= 7) return 'Advanced';
    if (proficiency >= 5) return 'Intermediate';
    if (proficiency >= 3) return 'Beginner';
    return 'Novice';
  },

  // Helper function to safely get default value
  defaultValue: (value: unknown, defaultVal: string): string => {
    if (value === null || value === undefined || value === '') {
      return defaultVal;
    }
    return String(value);
  }
} as const;

export const applyUtilityFilter = (value: unknown, filter: string, args: string[] = []): string => {
  const [utilityName, ...filterArgs] = filter.split(':');
  const allArgs = [...filterArgs, ...args];

  const stringValue = (val: unknown): string => String(val ?? '');
  const safeNumber = (val: unknown, fallback: number = 0): number => {
    const num = Number(val);
    return Number.isFinite(num) ? num : fallback;
  };

  try {
    switch (utilityName) {
      case 'formatDate':
        return templateUtilities.formatDate(stringValue(value), allArgs[0]);
      
      case 'formatDateRange':
        return templateUtilities.formatDateRange(
          stringValue(value),
          allArgs[0] || null,
          allArgs[1] === 'true'
        );
      
      case 'join': {
        const items = Array.isArray(value) ? value : [value];
        return templateUtilities.joinArray(items, allArgs[0]);
      }
      
      case 'truncate':
        return templateUtilities.truncate(
          stringValue(value),
          safeNumber(allArgs[0], 100)
        );
      
      case 'capitalize':
        return templateUtilities.capitalize(stringValue(value));
      
      case 'formatProficiency':
        return templateUtilities.formatProficiency(safeNumber(value));
      
      case 'defaultValue':
        return templateUtilities.defaultValue(value, allArgs[0] || '');
      
      default:
        return stringValue(value);
    }
  } catch (error) {
    console.error(`Error applying filter ${utilityName}:`, error);
    return stringValue(value);
  }
};
