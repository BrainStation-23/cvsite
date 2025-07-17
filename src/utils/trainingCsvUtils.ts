
import Papa from 'papaparse';

interface TrainingCSVRow {
  employee_id: string;
  title: string;
  provider?: string;
  certification_date?: string;
  description?: string;
  certificate_url?: string;
  is_renewable?: string;
  expiry_date?: string;
}

interface TrainingFormData {
  employee_id: string;
  title: string;
  provider: string;
  certification_date: string;
  description?: string;
  certificate_url?: string;
  is_renewable: boolean;
  expiry_date?: string;
}

export interface TrainingCSVValidationResult {
  valid: TrainingFormData[];
  errors: TrainingCSVValidationError[];
}

interface TrainingCSVValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

// Helper function to validate date format
const validateDate = (dateString: string): boolean => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

// Helper function to format date to YYYY-MM-DD
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Helper function to validate boolean values
const parseBoolean = (value: string): boolean => {
  if (!value) return false;
  const lowerValue = value.toLowerCase().trim();
  return ['true', '1', 'yes', 'y'].includes(lowerValue);
};

export const downloadTrainingCSVTemplate = () => {
  const templateData = [
    {
      employee_id: 'EMP001',
      title: 'AWS Solutions Architect',
      provider: 'Amazon Web Services',
      certification_date: '2024-01-15',
      description: 'Cloud architecture certification',
      certificate_url: 'https://example.com/certificate1',
      is_renewable: 'true',
      expiry_date: '2027-01-15'
    },
    {
      employee_id: 'EMP002',
      title: 'Scrum Master Certification',
      provider: 'Scrum.org',
      certification_date: '2024-03-20',
      description: 'Agile project management certification',
      certificate_url: '',
      is_renewable: 'false',
      expiry_date: ''
    },
    {
      employee_id: 'EMP003',
      title: 'ISTQB Foundation Level',
      provider: 'ISTQB',
      certification_date: '2023-12-10',
      description: 'Software testing foundation certification',
      certificate_url: 'https://example.com/certificate3',
      is_renewable: 'true',
      expiry_date: '2026-12-10'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'training_certifications_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateTrainingCSVData = async (data: any[]): Promise<TrainingCSVValidationResult> => {
  const valid: TrainingFormData[] = [];
  const errors: TrainingCSVValidationError[] = [];
  const seenCombinations = new Set();

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    // Validate employee_id (required)
    if (!row.employee_id || typeof row.employee_id !== 'string' || row.employee_id.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'employee_id',
        value: row.employee_id || '',
        message: 'Employee ID is required'
      });
      hasErrors = true;
    }

    // Validate title (required)
    if (!row.title || typeof row.title !== 'string' || row.title.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'title',
        value: row.title || '',
        message: 'Certification title is required'
      });
      hasErrors = true;
    }

    // Check for duplicate employee_id + title combination
    if (row.employee_id && row.title) {
      const combination = `${row.employee_id.trim()}-${row.title.trim()}`;
      if (seenCombinations.has(combination)) {
        errors.push({
          row: rowNumber,
          field: 'combination',
          value: combination,
          message: 'Duplicate employee ID and title combination'
        });
        hasErrors = true;
      } else {
        seenCombinations.add(combination);
      }
    }

    // Validate certification_date (optional but must be valid if provided)
    let formattedCertDate = '';
    if (row.certification_date && row.certification_date.trim() !== '') {
      if (!validateDate(row.certification_date)) {
        errors.push({
          row: rowNumber,
          field: 'certification_date',
          value: row.certification_date,
          message: 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY'
        });
        hasErrors = true;
      } else {
        formattedCertDate = formatDate(row.certification_date);
      }
    }

    // Validate expiry_date (optional but must be valid if provided)
    let formattedExpiryDate = '';
    if (row.expiry_date && row.expiry_date.trim() !== '') {
      if (!validateDate(row.expiry_date)) {
        errors.push({
          row: rowNumber,
          field: 'expiry_date',
          value: row.expiry_date,
          message: 'Invalid expiry date format. Use YYYY-MM-DD or MM/DD/YYYY'
        });
        hasErrors = true;
      } else {
        formattedExpiryDate = formatDate(row.expiry_date);
      }
    }

    // Validate URL format (optional)
    if (row.certificate_url && row.certificate_url.trim() !== '') {
      try {
        new URL(row.certificate_url);
      } catch {
        errors.push({
          row: rowNumber,
          field: 'certificate_url',
          value: row.certificate_url,
          message: 'Invalid URL format'
        });
        hasErrors = true;
      }
    }

    // If no errors, add to valid array
    if (!hasErrors) {
      valid.push({
        employee_id: row.employee_id.trim(),
        title: row.title.trim(),
        provider: row.provider?.trim() || 'Unknown',
        certification_date: formattedCertDate || new Date().toISOString().split('T')[0],
        description: row.description?.trim() || '',
        certificate_url: row.certificate_url?.trim() || '',
        is_renewable: parseBoolean(row.is_renewable || ''),
        expiry_date: formattedExpiryDate || ''
      });
    }
  }

  return { valid, errors };
};

export const parseTrainingCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          // Filter out empty rows
          const filteredData = results.data.filter((row: any) => 
            row.employee_id && row.employee_id.toString().trim() !== ''
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
