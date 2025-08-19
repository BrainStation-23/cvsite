
import Papa from 'papaparse';

export interface SbuFormData {
  name: string;
  sbu_head_email: string;
  sbu_head_name: string;
  is_department: boolean;
}

export interface SbuItem {
  id: string;
  name: string;
  sbu_head_email: string;
  sbu_head_name: string;
  is_department: boolean;
  created_at: string;
  updated_at: string;
}

export const parseSbuCSV = (file: File): Promise<SbuFormData[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const sbus = results.data.map((item: any) => ({
            name: item.name || '',
            sbu_head_email: item.sbu_head_email || '',
            sbu_head_name: item.sbu_head_name || '',
            is_department: item.is_department === 'true' || item.is_department === true
          })) as SbuFormData[];
          resolve(sbus);
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

export const validateSbuCSVData = (
  data: SbuFormData[], 
  existingSbus: SbuItem[]
) => {
  const errors: Array<{
    row: number;
    errors: string[];
    data: SbuFormData;
  }> = [];
  
  const valid: SbuFormData[] = [];
  const existingNames = new Set(existingSbus.map(s => s.name?.toLowerCase()).filter(Boolean));
  const existingEmails = new Set(existingSbus.map(s => s.sbu_head_email?.toLowerCase()).filter(Boolean));
  const seenNames = new Set<string>();
  const seenEmails = new Set<string>();

  data.forEach((item, index) => {
    const rowErrors: string[] = [];
    const row = index + 2; // +2 because CSV is 1-indexed and we skip header

    // Validate required fields
    if (!item.name || typeof item.name !== 'string' || item.name.trim() === '') {
      rowErrors.push('SBU name is required');
    } else {
      const normalizedName = item.name.trim().toLowerCase();
      
      // Check for duplicates in existing data
      if (existingNames.has(normalizedName)) {
        rowErrors.push(`SBU name "${item.name.trim()}" already exists`);
      }
      
      // Check for duplicates within the CSV
      if (seenNames.has(normalizedName)) {
        rowErrors.push(`Duplicate SBU name "${item.name.trim()}" found in CSV`);
      } else {
        seenNames.add(normalizedName);
      }
    }
    
    if (!item.sbu_head_email || typeof item.sbu_head_email !== 'string' || item.sbu_head_email.trim() === '') {
      rowErrors.push('SBU head email is required');
    } else {
      const normalizedEmail = item.sbu_head_email.trim().toLowerCase();
      
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        rowErrors.push('Invalid email format');
      } else {
        // Check for duplicates in existing data
        if (existingEmails.has(normalizedEmail)) {
          rowErrors.push(`Email "${item.sbu_head_email.trim()}" already exists`);
        }
        
        // Check for duplicates within the CSV
        if (seenEmails.has(normalizedEmail)) {
          rowErrors.push(`Duplicate email "${item.sbu_head_email.trim()}" found in CSV`);
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
        sbu_head_email: item.sbu_head_email.trim(),
        sbu_head_name: item.sbu_head_name?.trim() || '',
        is_department: item.is_department || false
      });
    }
  });

  return { valid, errors };
};

export const exportSbusToCSV = (sbus: SbuItem[]) => {
  const csvData = sbus.map(sbu => ({
    name: sbu.name,
    sbu_head_email: sbu.sbu_head_email,
    sbu_head_name: sbu.sbu_head_name,
    is_department: sbu.is_department
  }));

  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sbus_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadSbuCSVTemplate = () => {
  const templateData = [
    { 
      name: 'Technology Division',
      sbu_head_email: 'tech.head@company.com',
      sbu_head_name: 'John Doe',
      is_department: false
    },
    { 
      name: 'Marketing Department',
      sbu_head_email: 'marketing.head@company.com',
      sbu_head_name: 'Jane Smith',
      is_department: true
    },
    { 
      name: 'Finance Division',
      sbu_head_email: 'finance.head@company.com',
      sbu_head_name: 'Bob Johnson',
      is_department: false
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sbu_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
