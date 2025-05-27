
import Papa from 'papaparse';

export interface ReferenceFormData {
  name: string;
  email: string;
  designation: string;
  company: string;
}

export interface ReferenceItem {
  id: string;
  name: string;
  email: string;
  designation: string;
  company: string;
  created_at: string;
  updated_at: string;
}

export const parseReferencesCSV = (file: File): Promise<ReferenceFormData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const references = results.data as ReferenceFormData[];
          resolve(references);
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

export const validateReferenceCSVData = (
  data: ReferenceFormData[], 
  existingReferences: ReferenceItem[]
) => {
  const errors: Array<{
    row: number;
    errors: string[];
    data: ReferenceFormData;
  }> = [];
  
  const valid: ReferenceFormData[] = [];
  const existingEmails = new Set(existingReferences.map(r => r.email?.toLowerCase()).filter(Boolean));
  const seenEmails = new Set<string>();

  data.forEach((item, index) => {
    const rowErrors: string[] = [];
    const row = index + 2; // +2 because CSV is 1-indexed and we skip header

    // Validate required fields
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      rowErrors.push('Name is required');
    }
    
    if (!item.email || typeof item.email !== 'string' || item.email.trim() === '') {
      rowErrors.push('Email is required');
    } else {
      const normalizedEmail = item.email.trim().toLowerCase();
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        rowErrors.push('Invalid email format');
      } else {
        // Check for duplicates in existing data
        if (existingEmails.has(normalizedEmail)) {
          rowErrors.push(`Email "${item.email.trim()}" already exists`);
        }
        
        // Check for duplicates within the CSV
        if (seenEmails.has(normalizedEmail)) {
          rowErrors.push(`Duplicate email "${item.email.trim()}" found in CSV`);
        } else {
          seenEmails.add(normalizedEmail);
        }
      }
    }

    if (!item.designation || typeof item.designation !== 'string' || item.designation.trim() === '') {
      rowErrors.push('Designation is required');
    }

    if (!item.company || typeof item.company !== 'string' || item.company.trim() === '') {
      rowErrors.push('Company is required');
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
        email: item.email.trim(),
        designation: item.designation.trim(),
        company: item.company.trim()
      });
    }
  });

  return { valid, errors };
};

export const exportReferencesToCSV = (references: ReferenceItem[]) => {
  const csvData = references.map(reference => ({
    name: reference.name,
    email: reference.email,
    designation: reference.designation,
    company: reference.company
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `references_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadReferenceCSVTemplate = () => {
  const templateData = [
    { 
      name: 'John Smith',
      email: 'john.smith@company.com',
      designation: 'Senior Manager',
      company: 'Tech Corp'
    },
    { 
      name: 'Jane Doe',
      email: 'jane.doe@startup.com',
      designation: 'Team Lead',
      company: 'Startup Inc'
    },
    { 
      name: 'Robert Johnson',
      email: 'robert.j@enterprise.org',
      designation: 'Director',
      company: 'Enterprise Ltd'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'reference_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
