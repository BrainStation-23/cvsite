
export const parseAndValidateDate = (dateString: string): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  try {
    const date = new Date(dateString.trim());
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date format: ${dateString}. Setting to null.`);
      return null;
    }
    
    // Convert to YYYY-MM-DD format
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.warn(`Error parsing date ${dateString}:`, error, 'Setting to null.');
    return null;
  }
};
