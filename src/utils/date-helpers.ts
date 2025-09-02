
import { format } from 'date-fns';

export const formatDateToString = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  if (typeof date === 'string') return date;
  return format(date, 'yyyy-MM-dd');
};

export const parseStringToDate = (dateString: string | null | undefined): Date | undefined => {
  if (!dateString) return undefined;
  try {
    return new Date(dateString);
  } catch {
    return undefined;
  }
};

export const formatDateForDisplay = (dateString: string | Date): string => {
  if (!dateString) return '';
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  return format(date, 'MMM yyyy');
};
