
import Papa from 'papaparse';
import { UniversityFormData } from '@/hooks/use-university-settings';

export interface UniversityCSVRow {
  name: string;
  type: 'Public' | 'Private' | 'International' | 'Special';
  acronyms?: string;
}

export interface CSVValidationResult {
  valid: UniversityFormData[];
  errors: CSVValidationError[];
}

export interface CSVValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

// Helper function to format type with proper case
const formatUniversityType = (type: string): 'Public' | 'Private' | 'International' | 'Special' | null => {
  if (!type || typeof type !== 'string') return null;
  
  const lowerType = type.toLowerCase().trim();
  switch (lowerType) {
    case 'public':
      return 'Public';
    case 'private':
      return 'Private';
    case 'international':
      return 'International';
    case 'special':
      return 'Special';
    default:
      return null;
  }
};

export const downloadCSVTemplate = () => {
  const templateData = [
    {
      name: 'Harvard University',
      type: 'Private',
      acronyms: 'HU'
    },
    {
      name: 'University of California, Berkeley',
      type: 'Public',
      acronyms: 'UC Berkeley, UCB'
    },
    {
      name: 'Massachusetts Institute of Technology',
      type: 'Private',
      acronyms: 'MIT'
    },
    {
      name: 'International University of Monaco',
      type: 'International',
      acronyms: 'IUM'
    },
    {
      name: 'Special Forces University',
      type: 'Special',
      acronyms: 'SFU'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'university_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportUniversitiesToCSV = (universities: UniversityFormData[]) => {
  const csvData = universities.map(university => ({
    name: university.name,
    type: university.type,
    acronyms: university.acronyms || ''
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `universities_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateCSVData = (data: UniversityCSVRow[], existingUniversities: UniversityFormData[] = []): CSVValidationResult => {
  const valid: UniversityFormData[] = [];
  const errors: CSVValidationError[] = [];
  const seenNames = new Set<string>();
  
  // Create a set of existing university names for quick lookup
  const existingNames = new Set<string>(existingUniversities.map(u => u.name.toLowerCase().trim()));

  data.forEach((row: UniversityCSVRow, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    // Validate name
    if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        value: row.name || '',
        message: 'University name is required'
      });
      hasErrors = true;
    } else {
      const trimmedName = row.name.trim();
      const lowerName = trimmedName.toLowerCase();
      
      // Check for duplicates within CSV
      if (seenNames.has(lowerName)) {
        errors.push({
          row: rowNumber,
          field: 'name',
          value: trimmedName,
          message: 'Duplicate university name in CSV'
        });
        hasErrors = true;
      } else if (existingNames.has(lowerName)) {
        errors.push({
          row: rowNumber,
          field: 'name',
          value: trimmedName,
          message: 'University already exists in database'
        });
        hasErrors = true;
      } else {
        seenNames.add(lowerName);
      }
    }

    // Validate type
    const formattedType = formatUniversityType(row.type);
    if (!formattedType) {
      errors.push({
        row: rowNumber,
        field: 'type',
        value: row.type || '',
        message: 'Type must be one of: Public, Private, International, Special (case insensitive)'
      });
      hasErrors = true;
    }

    // If no errors, add to valid array
    if (!hasErrors && formattedType) {
      valid.push({
        name: row.name.trim(),
        type: formattedType,
        acronyms: row.acronyms ? row.acronyms.trim() : ''
      });
    }
  });

  return { valid, errors };
};

export const parseUniversitiesCSV = (file: File): Promise<UniversityCSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<UniversityCSVRow>(file, {
      header: true,
      complete: (results) => {
        try {
          // Filter out empty rows
          const filteredData: UniversityCSVRow[] = results.data.filter((row) => 
            row && typeof row.name !== 'undefined' && row.name !== null && row.name.toString().trim() !== ''
          );
          resolve(filteredData);
        } catch (error) {
          reject(error);
        }
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
