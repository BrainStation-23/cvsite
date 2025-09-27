
import Papa from 'papaparse';

export interface TrainingCSVRow {
  employee_id: string;
  title: string;
  provider?: string;
  certification_date?: string;
  description?: string;
  certificate_url?: string;
  is_renewable?: string;
  expiry_date?: string;
}

export interface TrainingFormData {
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

export interface TrainingCSVValidationError {
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

export const validateTrainingCSVData = async (
  data: Array<Record<string, unknown>>
): Promise<TrainingCSVValidationResult> => {
  const valid: TrainingFormData[] = [];
  const errors: TrainingCSVValidationError[] = [];
  const seenCombinations = new Set<string>();

  const asString = (v: unknown) => (typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v)).trim();

  for (let i = 0; i < data.length; i++) {
    const r = data[i] as Record<string, unknown>;
    const rowNumber = i + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    const employeeId = asString(r.employee_id);
    const title = asString(r.title);

    // Validate employee_id (required)
    if (!employeeId) {
      errors.push({ row: rowNumber, field: 'employee_id', value: employeeId, message: 'Employee ID is required' });
      hasErrors = true;
    }

    // Validate title (required)
    if (!title) {
      errors.push({ row: rowNumber, field: 'title', value: title, message: 'Certification title is required' });
      hasErrors = true;
    }

    // Check for duplicate employee_id + title combination
    if (employeeId && title) {
      const combination = `${employeeId}-${title}`;
      if (seenCombinations.has(combination)) {
        errors.push({ row: rowNumber, field: 'combination', value: combination, message: 'Duplicate employee ID and title combination' });
        hasErrors = true;
      } else {
        seenCombinations.add(combination);
      }
    }

    // Validate certification_date (optional but must be valid if provided)
    let formattedCertDate = '';
    const certDateRaw = asString(r.certification_date);
    if (certDateRaw !== '') {
      if (!validateDate(certDateRaw)) {
        errors.push({ row: rowNumber, field: 'certification_date', value: certDateRaw, message: 'Invalid date format. Use YYYY-MM-DD or MM/DD/YYYY' });
        hasErrors = true;
      } else {
        formattedCertDate = formatDate(certDateRaw);
      }
    }

    // Validate expiry_date (optional but must be valid if provided)
    let formattedExpiryDate = '';
    const expiryDateRaw = asString(r.expiry_date);
    if (expiryDateRaw !== '') {
      if (!validateDate(expiryDateRaw)) {
        errors.push({ row: rowNumber, field: 'expiry_date', value: expiryDateRaw, message: 'Invalid expiry date format. Use YYYY-MM-DD or MM/DD/YYYY' });
        hasErrors = true;
      } else {
        formattedExpiryDate = formatDate(expiryDateRaw);
      }
    }

    // Validate URL format (optional)
    const certUrlRaw = asString(r.certificate_url);
    if (certUrlRaw !== '') {
      try {
        new URL(certUrlRaw);
      } catch {
        errors.push({ row: rowNumber, field: 'certificate_url', value: certUrlRaw, message: 'Invalid URL format' });
        hasErrors = true;
      }
    }

    // If no errors, add to valid array
    if (!hasErrors) {
      valid.push({
        employee_id: employeeId,
        title: title,
        provider: asString(r.provider) || 'Unknown',
        certification_date: formattedCertDate || new Date().toISOString().split('T')[0],
        description: asString(r.description) || '',
        certificate_url: certUrlRaw || '',
        is_renewable: parseBoolean(asString(r.is_renewable)),
        expiry_date: formattedExpiryDate || ''
      });
    }
  }

  return { valid, errors };
};

export const parseTrainingCSV = (file: File): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const raw = results.data as Record<string, unknown>[];
          const filteredData = raw.filter((row) => {
            const val = row['employee_id'];
            if (val === undefined || val === null) return false;
            const s = typeof val === 'string' ? val : String(val);
            return s.trim() !== '';
          });
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
