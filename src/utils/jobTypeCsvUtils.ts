import Papa from 'papaparse';

export interface JobTypeFormData {
  name: string;
  color_code?: string;
}

export interface JobTypeItem {
  id: string;
  name: string;
  color_code?: string;
  created_at: string;
}

export const parseJobTypesCSV = (file: File): Promise<JobTypeFormData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const jobTypes = results.data as JobTypeFormData[];
          resolve(jobTypes);
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

export const validateJobTypeCSVData = (
  data: JobTypeFormData[], 
  existingJobTypes: JobTypeItem[]
) => {
  const errors: Array<{
    row: number;
    errors: string[];
    data: JobTypeFormData;
  }> = [];
  
  const valid: JobTypeFormData[] = [];
  const existingNames = new Set(existingJobTypes.map(d => d.name.toLowerCase()));
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
        rowErrors.push(`Job type "${item.name.trim()}" already exists`);
      }
      
      // Check for duplicates within the CSV
      if (seenNames.has(normalizedName)) {
        rowErrors.push(`Duplicate job type "${item.name.trim()}" found in CSV`);
      } else {
        seenNames.add(normalizedName);
      }
    }

    // Validate color code format if provided
    if (item.color_code && !/^#[0-9A-Fa-f]{6}$/.test(item.color_code)) {
      rowErrors.push('Color code must be in hex format (e.g., #FF0000)');
    }

    if (rowErrors.length > 0) {
      errors.push({
        row,
        errors: rowErrors,
        data: item
      });
    } else {
      valid.push({
        name: item.name.trim(),
        color_code: item.color_code?.trim() || undefined
      });
    }
  });

  return { valid, errors };
};

export const exportJobTypesToCSV = (jobTypes: JobTypeItem[]) => {
  const csvData = jobTypes.map(jobType => ({
    name: jobType.name,
    color_code: jobType.color_code || ''
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job_types_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadJobTypeCSVTemplate = () => {
  const templateData = [
    { 
      name: 'Full-time', 
      color_code: '#3B82F6'
    },
    { 
      name: 'Part-time', 
      color_code: '#10B981'
    },
    { 
      name: 'Contract', 
      color_code: '#F59E0B'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_type_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};