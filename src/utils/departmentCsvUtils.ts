
import Papa from 'papaparse';
import { DepartmentFormData } from '@/hooks/use-department-settings';

export interface DepartmentCSVRow {
  name: string;
  full_form?: string;
}

export interface DepartmentCSVValidationResult {
  valid: DepartmentFormData[];
  errors: DepartmentCSVValidationError[];
}

export interface DepartmentCSVValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export const downloadDepartmentCSVTemplate = () => {
  const templateData = [
    {
      name: 'Computer Science',
      full_form: 'Department of Computer Science and Engineering'
    },
    {
      name: 'Mathematics',
      full_form: 'Department of Mathematics'
    },
    {
      name: 'Physics',
      full_form: 'Department of Physics'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'department_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportDepartmentsToCSV = (departments: any[]) => {
  const csvData = departments.map(department => ({
    name: department.name,
    full_form: department.full_form || ''
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `departments_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateDepartmentCSVData = (data: any[], existingDepartments: any[] = []): DepartmentCSVValidationResult => {
  const valid: DepartmentFormData[] = [];
  const errors: DepartmentCSVValidationError[] = [];
  const seenNames = new Set();
  
  // Create a set of existing department names for quick lookup
  const existingNames = new Set(existingDepartments.map(d => d.name.toLowerCase().trim()));

  data.forEach((row: any, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    // Validate name
    if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        value: row.name || '',
        message: 'Department name is required'
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
          message: 'Duplicate department name in CSV'
        });
        hasErrors = true;
      } else if (existingNames.has(lowerName)) {
        errors.push({
          row: rowNumber,
          field: 'name',
          value: trimmedName,
          message: 'Department already exists in database'
        });
        hasErrors = true;
      } else {
        seenNames.add(lowerName);
      }
    }

    // If no errors, add to valid array
    if (!hasErrors) {
      valid.push({
        name: row.name.trim(),
        full_form: row.full_form ? row.full_form.trim() : ''
      });
    }
  });

  return { valid, errors };
};

export const parseDepartmentsCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          // Filter out empty rows
          const filteredData = results.data.filter((row: any) => 
            row.name && row.name.toString().trim() !== ''
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
