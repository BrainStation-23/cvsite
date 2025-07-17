
import Papa from 'papaparse';

export interface HrContactFormData {
  name: string;
  email: string;
}

export interface HrContactItem {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export const parseHrContactCSV = (file: File): Promise<HrContactFormData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const hrContacts = results.data as HrContactFormData[];
          resolve(hrContacts);
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

export const validateHrContactCSVData = (
  data: HrContactFormData[], 
  existingHrContacts: HrContactItem[]
) => {
  const errors: Array<{
    row: number;
    errors: string[];
    data: HrContactFormData;
  }> = [];
  
  const valid: HrContactFormData[] = [];
  const existingNames = new Set(existingHrContacts.map(c => c.name?.toLowerCase()).filter(Boolean));
  const existingEmails = new Set(existingHrContacts.map(c => c.email?.toLowerCase()).filter(Boolean));
  const seenNames = new Set<string>();
  const seenEmails = new Set<string>();

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
        rowErrors.push(`Name "${item.name.trim()}" already exists`);
      }
      
      // Check for duplicates within the CSV
      if (seenNames.has(normalizedName)) {
        rowErrors.push(`Duplicate name "${item.name.trim()}" found in CSV`);
      } else {
        seenNames.add(normalizedName);
      }
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

    if (rowErrors.length > 0) {
      errors.push({
        row,
        errors: rowErrors,
        data: item
      });
    } else {
      valid.push({
        name: item.name.trim(),
        email: item.email.trim()
      });
    }
  });

  return { valid, errors };
};

export const exportHrContactsToCSV = (hrContacts: HrContactItem[]) => {
  const csvData = hrContacts.map(contact => ({
    name: contact.name,
    email: contact.email
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `hr_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadHrContactCSVTemplate = () => {
  const templateData = [
    { 
      name: 'John Doe',
      email: 'john.doe@company.com'
    },
    { 
      name: 'Jane Smith',
      email: 'jane.smith@company.com'
    },
    { 
      name: 'Mike Johnson',
      email: 'mike.johnson@company.com'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'hr_contact_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
