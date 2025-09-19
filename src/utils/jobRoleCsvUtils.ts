import Papa from 'papaparse';

export interface JobRoleFormData {
  name: string;
  purpose?: string;
  responsibilities?: string;
  color_code?: string;
}

export interface JobRoleItem {
  id: string;
  name: string;
  purpose?: string;
  responsibilities?: string;
  color_code?: string;
  created_at: string;
}

export const parseJobRolesCSV = (file: File): Promise<JobRoleFormData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const jobRoles = results.data as JobRoleFormData[];
          resolve(jobRoles);
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

export const validateJobRoleCSVData = (
  data: JobRoleFormData[], 
  existingJobRoles: JobRoleItem[]
) => {
  const errors: Array<{
    row: number;
    errors: string[];
    data: JobRoleFormData;
  }> = [];
  
  const valid: JobRoleFormData[] = [];
  const existingNames = new Set(existingJobRoles.map(d => d.name.toLowerCase()));
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
        rowErrors.push(`Job role "${item.name.trim()}" already exists`);
      }
      
      // Check for duplicates within the CSV
      if (seenNames.has(normalizedName)) {
        rowErrors.push(`Duplicate job role "${item.name.trim()}" found in CSV`);
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
        purpose: item.purpose?.trim() || undefined,
        responsibilities: item.responsibilities?.trim() || undefined,
        color_code: item.color_code?.trim() || undefined
      });
    }
  });

  return { valid, errors };
};

export const exportJobRolesToCSV = (jobRoles: JobRoleItem[]) => {
  const csvData = jobRoles.map(jobRole => ({
    name: jobRole.name,
    purpose: jobRole.purpose || '',
    responsibilities: jobRole.responsibilities || '',
    color_code: jobRole.color_code || ''
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `job_roles_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadJobRoleCSVTemplate = () => {
  const templateData = [
    { 
      name: 'Developer', 
      purpose: 'Software development and maintenance',
      responsibilities: 'Code, test, debug applications',
      color_code: '#3B82F6'
    },
    { 
      name: 'Manager', 
      purpose: 'Team leadership and project management',
      responsibilities: 'Lead team, manage projects, coordinate tasks',
      color_code: '#10B981'
    },
    { 
      name: 'Designer', 
      purpose: 'User interface and experience design',
      responsibilities: 'Create designs, prototypes, user flows',
      color_code: '#8B5CF6'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'job_role_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};