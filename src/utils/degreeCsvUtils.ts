
import Papa from 'papaparse';

export interface DegreeFormData {
  name: string;
  full_form?: string;
}

export interface DegreeItem {
  id: string;
  name: string;
  full_form?: string;
  created_at: string;
  updated_at: string;
}

export interface DegreeCSVRow {
  name: string;
  full_form?: string;
}

export interface DegreeCSVValidationResult {
  valid: DegreeFormData[];
  errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }>;
}

export const parseDegreeCSV = (file: File): Promise<DegreeCSVRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<DegreeCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as DegreeCSVRow[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};

export const validateDegreeCSVData = (
  data: DegreeCSVRow[],
  existingDegrees: DegreeItem[]
): DegreeCSVValidationResult => {
  const valid: DegreeFormData[] = [];
  const errors: Array<{
    row: number;
    field: string;
    value: string;
    message: string;
  }> = [];

  const seenNames = new Set<string>();
  const existingNames = new Set<string>(existingDegrees.map(d => d.name.toLowerCase()));

  data.forEach((row: DegreeCSVRow, index: number) => {
    const rowNumber = index + 2; // +2 because of 0-index and header row
    
    // Validate name (required)
    const name = row.name?.toString().trim();
    if (!name) {
      errors.push({
        row: rowNumber,
        field: 'name',
        value: row.name || '',
        message: 'Degree name is required'
      });
    } else {
      const nameLower = name.toLowerCase();
      
      // Check for duplicates within the CSV
      if (seenNames.has(nameLower)) {
        errors.push({
          row: rowNumber,
          field: 'name',
          value: name,
          message: 'Duplicate degree name found in CSV'
        });
      } else if (existingNames.has(nameLower)) {
        errors.push({
          row: rowNumber,
          field: 'name',
          value: name,
          message: 'Degree already exists in database'
        });
      } else {
        seenNames.add(nameLower);
      }
    }

    // If no errors for this row, add to valid array
    if (!errors.some(error => error.row === rowNumber)) {
      valid.push({
        name: name as string,
        full_form: row.full_form?.toString().trim() || undefined
      });
    }
  });

  return { valid, errors };
};

export const exportDegreesToCSV = (degrees: DegreeItem[]) => {
  const csvData = degrees.map(degree => ({
    name: degree.name,
    full_form: degree.full_form || ''
  }));

  const csv = Papa.unparse(csvData, {
    header: true
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `degrees_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadDegreeCSVTemplate = () => {
  const templateData = [
    { name: 'Bachelor of Science', full_form: 'Bachelor of Science in Computer Science' },
    { name: 'Master of Arts', full_form: 'Master of Arts in English Literature' }
  ];

  const csv = Papa.unparse(templateData, {
    header: true
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', 'degrees_template.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
