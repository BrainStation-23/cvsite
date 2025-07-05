
import Papa from 'papaparse';
import { SettingTableName } from '@/hooks/use-platform-settings';

export interface ResourcePlanningCSVRow {
  name: string;
}

export interface CSVValidationResult {
  valid: ResourcePlanningCSVRow[];
  errors: CSVValidationError[];
}

export interface CSVValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

// Entity name mappings for display purposes
export const ENTITY_NAMES: Record<SettingTableName, string> = {
  'universities': 'University',
  'departments': 'Department', 
  'degrees': 'Degree',
  'designations': 'Designation',
  'references': 'Reference',
  'sbus': 'SBU',
  'hr_contacts': 'HR Contact',
  'resource_types': 'Resource Type',
  'bill_types': 'Bill Type',
  'project_types': 'Project Type',
  'expertise_types': 'Expertise Type'
};

export const downloadCSVTemplate = (tableName: SettingTableName) => {
  const entityName = ENTITY_NAMES[tableName];
  const templateData = [
    { name: `Sample ${entityName} 1` },
    { name: `Sample ${entityName} 2` },
    { name: `Sample ${entityName} 3` }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const exportItemsToCSV = (items: any[], tableName: SettingTableName) => {
  const csvData = items.map(item => ({
    name: item.name
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${tableName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateCSVData = (data: any[], existingItems: any[] = []): CSVValidationResult => {
  const valid: ResourcePlanningCSVRow[] = [];
  const errors: CSVValidationError[] = [];
  const seenNames = new Set();
  
  // Create a set of existing item names for quick lookup
  const existingNames = new Set(existingItems.map(item => item.name.toLowerCase().trim()));

  data.forEach((row: any, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    // Validate name
    if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'name',
        value: row.name || '',
        message: 'Name is required'
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
          message: 'Duplicate name in CSV'
        });
        hasErrors = true;
      } else if (existingNames.has(lowerName)) {
        errors.push({
          row: rowNumber,
          field: 'name',
          value: trimmedName,
          message: 'Name already exists in database'
        });
        hasErrors = true;
      } else {
        seenNames.add(lowerName);
      }
    }

    // If no errors, add to valid array
    if (!hasErrors) {
      valid.push({
        name: row.name.trim()
      });
    }
  });

  return { valid, errors };
};

export const parseResourcePlanningCSV = (file: File): Promise<any[]> => {
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
