
import Papa from 'papaparse';

export interface DesignationFormData {
  name: string;
}

interface DesignationItem {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export const parseDesignationsCSV = (file: File): Promise<DesignationFormData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const designations = results.data as DesignationFormData[];
          resolve(designations);
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

export const validateDesignationCSVData = (
  data: DesignationFormData[], 
  existingDesignations: DesignationItem[]
) => {
  const errors: Array<{
    row: number;
    errors: string[];
    data: DesignationFormData;
  }> = [];
  
  const valid: DesignationFormData[] = [];
  const existingNames = new Set(existingDesignations.map(d => d.name.toLowerCase()));
  const seenNames = new Set<string>();

  data.forEach((item, index) => {
    const rowErrors: string[] = [];
    const row = index + 2; // +2 because CSV is 1-indexed and we skip header

    // Validate required fields
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      rowErrors.push('Name is required');
    } else {
      const normalizedName = item.name.trim().toLowerCase();
      
      // Check for duplicates in existing data
      if (existingNames.has(normalizedName)) {
        rowErrors.push(`Designation "${item.name.trim()}" already exists`);
      }
      
      // Check for duplicates within the CSV
      if (seenNames.has(normalizedName)) {
        rowErrors.push(`Duplicate designation "${item.name.trim()}" found in CSV`);
      } else {
        seenNames.add(normalizedName);
      }
    }

    if (rowErrors.length > 0) {
      errors.push({
        row,
        errors: rowErrors,
        data: item
      });
    } else {
      valid.push({
        name: item.name.trim()
      });
    }
  });

  return { valid, errors };
};

export const exportDesignationsToCSV = (designations: DesignationItem[]) => {
  const csvData = designations.map(designation => ({
    name: designation.name
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `designations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadDesignationCSVTemplate = () => {
  const templateData = [
    { name: 'Software Engineer' },
    { name: 'Product Manager' },
    { name: 'Data Scientist' }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'designation_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
