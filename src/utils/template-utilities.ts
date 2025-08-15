
import { format, parseISO, isValid } from 'date-fns';

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

  formatDateRange: (startDate: string, endDate: string | null, isCurrent?: boolean): string => {
    const formattedStart = templateUtilities.formatDate(startDate);
    
    if (isCurrent || !endDate) {
      return `${formattedStart} - Present`;
    }
    
    const formattedEnd = templateUtilities.formatDate(endDate);
    return `${formattedStart} - ${formattedEnd}`;
  },

  joinArray: (array: any[], separator: string = ', '): string => {
    if (!Array.isArray(array)) return '';
    return array.filter(item => item).join(separator);
  },

  truncate: (text: string, length: number = 100): string => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length).trim() + '...';
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
  }
};

export const applyUtilityFilter = (value: any, filter: string, args?: string[]): string => {
  const [utilityName, ...filterArgs] = filter.split(':');
  const allArgs = [...(filterArgs || []), ...(args || [])];

  switch (utilityName) {
    case 'formatDate':
      return templateUtilities.formatDate(value, allArgs[0]);
    case 'formatDateRange':
      return templateUtilities.formatDateRange(value, allArgs[0], allArgs[1] === 'true');
    case 'join':
      return templateUtilities.joinArray(value, allArgs[0]);
    case 'truncate':
      return templateUtilities.truncate(value, parseInt(allArgs[0]) || 100);
    case 'capitalize':
      return templateUtilities.capitalize(value);
    case 'formatProficiency':
      return templateUtilities.formatProficiency(value);
    default:
      return String(value || '');
  }
};
