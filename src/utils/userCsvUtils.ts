import Papa from 'papaparse';

export interface UserCSVRow {
  userId?: string; // For updates
  email: string;
  firstName: string;
  lastName?: string; // Made optional
  password?: string;
  employeeId?: string;
  managerEmail?: string;
  sbuName?: string;
  expertiseName?: string;
  resourceTypeName?: string;
  dateOfJoining?: string;
  careerStartDate?: string;
  dateOfBirth?: string;
  resignationDate?: string;
  exitDate?: string;
  active?: boolean;
  hasOverhead?: boolean;
}

export interface CSVValidationResult {
  valid: UserCSVRow[];
  errors: CSVValidationError[];
}

export interface CSVValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

// Helper function to generate a random password
const generateRandomPassword = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};



// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate and normalize date format - more flexible
const normalizeDate = (dateString: string): string | null => {
  if (!dateString || dateString.trim() === '') return null;
  
  const trimmed = dateString.trim();
  
  // First try parsing as is
  let date = new Date(trimmed);
  
  // If invalid, try common formats
  if (isNaN(date.getTime())) {
    // Try MM/DD/YYYY format
    const mmddyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyy) {
      const [, month, day, year] = mmddyyyy;
      date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    // Try DD/MM/YYYY format
    if (isNaN(date.getTime())) {
      const ddmmyyyy = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (ddmmyyyy) {
        const [, day, month, year] = ddmmyyyy;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    // Try DD-MM-YYYY format
    if (isNaN(date.getTime())) {
      const ddmmyyyy2 = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
      if (ddmmyyyy2) {
        const [, day, month, year] = ddmmyyyy2;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
    
    // Try YYYY/MM/DD format
    if (isNaN(date.getTime())) {
      const yyyymmdd = trimmed.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
      if (yyyymmdd) {
        const [, year, month, day] = yyyymmdd;
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
  }
  
  // If still invalid, return null
  if (isNaN(date.getTime())) {
    return null;
  }
  
  // Return in YYYY-MM-DD format for database
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const downloadCSVTemplate = () => {
  const templateData = [
    {
      email: 'john.doe@company.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employee',
      password: 'SecurePass123!',
      employeeId: 'EMP001',
      managerEmail: 'manager@company.com',
      sbuName: 'Technology Division',
      expertiseName: 'Software Development',
      resourceTypeName: 'Senior Developer',
      dateOfJoining: '2024-01-15',
      careerStartDate: '2020-06-01',
      dateOfBirth: '1990-05-20',
      resignationDate: '',
      exitDate: '',
      active: true,
      hasOverhead: true
    },
    {
      email: 'jane.smith@company.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'manager',
      password: '',
      employeeId: 'EMP002',
      managerEmail: '',
      sbuName: 'Marketing Department',
      expertiseName: 'Digital Marketing',
      resourceTypeName: 'Marketing Manager',
      dateOfJoining: '2023-03-10',
      careerStartDate: '2018-09-15',
      dateOfBirth: '1985-12-03',
      resignationDate: '',
      exitDate: '',
      active: true,
      hasOverhead: true
    },
    {
      email: 'admin@company.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      password: 'AdminPass456!',
      employeeId: 'ADM001',
      managerEmail: '',
      sbuName: '',
      expertiseName: 'System Administration',
      resourceTypeName: 'System Administrator',
      dateOfJoining: '2022-11-01',
      careerStartDate: '2019-04-20',
      dateOfBirth: '1980-08-15',
      resignationDate: '',
      exitDate: '',
      active: true,
      hasOverhead: true
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_create_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const downloadUpdateCSVTemplate = () => {
  const templateData = [
    {
      userId: 'user-id-1',
      email: 'john.doe@company.com',
      firstName: 'John Updated',
      lastName: 'Doe',
      role: 'manager',
      password: '',
      employeeId: 'EMP001',
      managerEmail: 'newmanager@company.com',
      sbuName: 'Technology Division',
      expertiseName: 'Full Stack Development',
      resourceTypeName: 'Tech Lead',
      dateOfJoining: '2024-01-15',
      careerStartDate: '2020-06-01',
      dateOfBirth: '1990-05-20',
      resignationDate: '',
      exitDate: '',
      active: true,
      hasOverhead: true
    },
    {
      userId: 'user-id-2',
      email: 'jane.smith@company.com',
      firstName: 'Jane',
      lastName: 'Smith Updated',
      role: 'admin',
      password: 'NewPassword123!',
      employeeId: 'EMP002',
      managerEmail: '',
      sbuName: 'Marketing Department',
      expertiseName: 'Growth Marketing',
      resourceTypeName: 'Marketing Director',
      dateOfJoining: '2023-03-10',
      careerStartDate: '2018-09-15',
      dateOfBirth: '1985-12-03',
      resignationDate: '2025-03-01',
      exitDate: '2025-03-15',
      active: false,
      hasOverhead: false
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_update_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateCSVData = (data: any[], existingUsers: any[] = [], mode: 'create' | 'update' = 'create'): CSVValidationResult => {
  const valid: UserCSVRow[] = [];
  const errors: CSVValidationError[] = [];
  const seenEmails = new Set();
  const seenUserIds = new Set();
  
  // Create a set of existing user emails for quick lookup
  const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase().trim()));
  const existingUserIds = new Set(existingUsers.map(u => u.id));

  data.forEach((row: any, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    // Validate userId for update mode
    if (mode === 'update') {
      if (!row.userId || typeof row.userId !== 'string' || row.userId.trim() === '') {
        errors.push({
          row: rowNumber,
          field: 'userId',
          value: row.userId || '',
          message: 'User ID is required for updates'
        });
        hasErrors = true;
      } else {
        const trimmedUserId = row.userId.trim();
        if (seenUserIds.has(trimmedUserId)) {
          errors.push({
            row: rowNumber,
            field: 'userId',
            value: trimmedUserId,
            message: 'Duplicate user ID in CSV'
          });
          hasErrors = true;
        } else {
          seenUserIds.add(trimmedUserId);
        }
      }
    }

    // Validate email (required)
    if (!row.email || typeof row.email !== 'string' || row.email.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'email',
        value: row.email || '',
        message: 'Email is required'
      });
      hasErrors = true;
    } else {
      const trimmedEmail = row.email.trim();
      const lowerEmail = trimmedEmail.toLowerCase();
      
      // Basic email validation
      if (!isValidEmail(trimmedEmail)) {
        errors.push({
          row: rowNumber,
          field: 'email',
          value: trimmedEmail,
          message: 'Invalid email format'
        });
        hasErrors = true;
      } else {
        // Check for duplicates within CSV
        if (seenEmails.has(lowerEmail)) {
          errors.push({
            row: rowNumber,
            field: 'email',
            value: trimmedEmail,
            message: 'Duplicate email in CSV'
          });
          hasErrors = true;
        } else {
          seenEmails.add(lowerEmail);
          
          // For create mode, check if user already exists
          if (mode === 'create' && existingEmails.has(lowerEmail)) {
            errors.push({
              row: rowNumber,
              field: 'email',
              value: trimmedEmail,
              message: 'User with this email already exists'
            });
            hasErrors = true;
          }
        }
      }
    }

    // Validate firstName (required)
    if (!row.firstName || typeof row.firstName !== 'string' || row.firstName.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'firstName',
        value: row.firstName || '',
        message: 'First name is required'
      });
      hasErrors = true;
    }

    // lastName is now optional - no validation needed



    // Validate manager email format if provided
    if (row.managerEmail && row.managerEmail.trim() && !isValidEmail(row.managerEmail.trim())) {
      errors.push({
        row: rowNumber,
        field: 'managerEmail',
        value: row.managerEmail,
        message: 'Invalid manager email format'
      });
      hasErrors = true;
    }

    // Validate and normalize date of joining if provided
    let normalizedDateOfJoining = null;
    if (row.dateOfJoining && row.dateOfJoining.trim()) {
      normalizedDateOfJoining = normalizeDate(row.dateOfJoining.trim());
      // Don't fail validation for invalid dates - just set to null and warn
      if (normalizedDateOfJoining === null) {
        console.warn(`Invalid date format for dateOfJoining at row ${rowNumber}: ${row.dateOfJoining}. Will be set to null.`);
      }
    }

    // Validate and normalize career start date if provided
    let normalizedCareerStartDate = null;
    if (row.careerStartDate && row.careerStartDate.trim()) {
      normalizedCareerStartDate = normalizeDate(row.careerStartDate.trim());
      // Don't fail validation for invalid dates - just set to null and warn
      if (normalizedCareerStartDate === null) {
        console.warn(`Invalid date format for careerStartDate at row ${rowNumber}: ${row.careerStartDate}. Will be set to null.`);
      }
    }

    // Validate and normalize date of birth if provided
    let normalizedDateOfBirth = null;
    if (row.dateOfBirth && row.dateOfBirth.trim()) {
      normalizedDateOfBirth = normalizeDate(row.dateOfBirth.trim());
      if (normalizedDateOfBirth === null) {
        console.warn(`Invalid date format for dateOfBirth at row ${rowNumber}: ${row.dateOfBirth}. Will be set to null.`);
      }
    }

    // Validate and normalize resignation date if provided
    let normalizedResignationDate = null;
    if (row.resignationDate && row.resignationDate.trim()) {
      normalizedResignationDate = normalizeDate(row.resignationDate.trim());
      if (normalizedResignationDate === null) {
        console.warn(`Invalid date format for resignationDate at row ${rowNumber}: ${row.resignationDate}. Will be set to null.`);
      }
    }

    // Validate and normalize exit date if provided
    let normalizedExitDate = null;
    if (row.exitDate && row.exitDate.trim()) {
      normalizedExitDate = normalizeDate(row.exitDate.trim());
      if (normalizedExitDate === null) {
        console.warn(`Invalid date format for exitDate at row ${rowNumber}: ${row.exitDate}. Will be set to null.`);
      }
    }

    // If no errors, add to valid array with defaults
    if (!hasErrors) {
      const validRow: UserCSVRow = {
        email: row.email.trim(),
        firstName: row.firstName.trim(),
        lastName: row.lastName && row.lastName.trim() ? row.lastName.trim() : undefined, // Make optional
        employeeId: row.employeeId ? row.employeeId.trim() : '',
        managerEmail: row.managerEmail ? row.managerEmail.trim() : '',
        sbuName: row.sbuName ? row.sbuName.trim() : '',
        expertiseName: row.expertiseName ? row.expertiseName.trim() : '',
        resourceTypeName: row.resourceTypeName ? row.resourceTypeName.trim() : '',
        dateOfJoining: normalizedDateOfJoining || '',
        careerStartDate: normalizedCareerStartDate || '',
        dateOfBirth: normalizedDateOfBirth || '',
        resignationDate: normalizedResignationDate || '',
        exitDate: normalizedExitDate || '',
        active: row.active !== undefined ? (row.active === 'true' || row.active === true) : true,
        hasOverhead: row.hasOverhead !== undefined ? (row.hasOverhead === 'true' || row.hasOverhead === true) : true
      };

      // Add userId for update mode
      if (mode === 'update') {
        validRow.userId = row.userId.trim();
      }

      // Handle password
      if (mode === 'create') {
        validRow.password = row.password && row.password.trim() ? row.password.trim() : generateRandomPassword();
      } else {
        // For updates, only include password if provided
        if (row.password && row.password.trim()) {
          validRow.password = row.password.trim();
        }
      }

      valid.push(validRow);
    }
  });

  return { valid, errors };
};

export const parseUsersCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Filter out empty rows
          const filteredData = results.data.filter((row: any) => 
            row.email && row.email.toString().trim() !== ''
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
