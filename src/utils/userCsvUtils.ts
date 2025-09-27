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

export type ExistingUser = { email: string; id: string };

export const validateCSVData = (
  data: Array<Record<string, unknown>>,
  existingUsers: ExistingUser[] = [],
  mode: 'create' | 'update' = 'create'
): CSVValidationResult => {
  const valid: UserCSVRow[] = [];
  const errors: CSVValidationError[] = [];
  const seenEmails = new Set<string>();
  const seenUserIds = new Set<string>();

  // Helper to safely coerce unknown values to trimmed strings
  const asString = (v: unknown) => (typeof v === 'string' ? v : v === null || v === undefined ? '' : String(v)).trim();

  // Create a set of existing user emails for quick lookup
  const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase().trim()));
  const existingUserIds = new Set(existingUsers.map(u => u.id));

  data.forEach((row, index) => {
    const r = row as Record<string, unknown>;
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    // Validate userId for update mode
    if (mode === 'update') {
      const userId = asString(r.userId);
      if (!userId) {
        errors.push({ row: rowNumber, field: 'userId', value: userId, message: 'User ID is required for updates' });
        hasErrors = true;
      } else {
        if (seenUserIds.has(userId)) {
          errors.push({ row: rowNumber, field: 'userId', value: userId, message: 'Duplicate user ID in CSV' });
          hasErrors = true;
        } else {
          seenUserIds.add(userId);
        }
      }
    }

    // Validate email (required)
    const emailRaw = asString(r.email);
    if (!emailRaw) {
      errors.push({ row: rowNumber, field: 'email', value: emailRaw, message: 'Email is required' });
      hasErrors = true;
    } else {
      const trimmedEmail = emailRaw;
      const lowerEmail = trimmedEmail.toLowerCase();

      // Basic email validation
      if (!isValidEmail(trimmedEmail)) {
        errors.push({ row: rowNumber, field: 'email', value: trimmedEmail, message: 'Invalid email format' });
        hasErrors = true;
      } else {
        // Check for duplicates within CSV
        if (seenEmails.has(lowerEmail)) {
          errors.push({ row: rowNumber, field: 'email', value: trimmedEmail, message: 'Duplicate email in CSV' });
          hasErrors = true;
        } else {
          seenEmails.add(lowerEmail);

          // For create mode, check if user already exists
          if (mode === 'create' && existingEmails.has(lowerEmail)) {
            errors.push({ row: rowNumber, field: 'email', value: trimmedEmail, message: 'User with this email already exists' });
            hasErrors = true;
          }
        }
      }
    }

    // Validate firstName (required)
    const firstNameRaw = asString(r.firstName);
    if (!firstNameRaw) {
      errors.push({ row: rowNumber, field: 'firstName', value: firstNameRaw, message: 'First name is required' });
      hasErrors = true;
    }

    // Validate manager email format if provided
    const managerEmailRaw = asString(r.managerEmail);
    if (managerEmailRaw && !isValidEmail(managerEmailRaw)) {
      errors.push({ row: rowNumber, field: 'managerEmail', value: managerEmailRaw, message: 'Invalid manager email format' });
      hasErrors = true;
    }

    // Validate and normalize date fields if provided (don't fail on invalid dates)
    let normalizedDateOfJoining: string | null = null;
    const dojRaw = asString(r.dateOfJoining);
    if (dojRaw) {
      normalizedDateOfJoining = normalizeDate(dojRaw);
      if (normalizedDateOfJoining === null) {
        console.warn(`Invalid date format for dateOfJoining at row ${rowNumber}: ${dojRaw}. Will be set to null.`);
      }
    }

    let normalizedCareerStartDate: string | null = null;
    const csdRaw = asString(r.careerStartDate);
    if (csdRaw) {
      normalizedCareerStartDate = normalizeDate(csdRaw);
      if (normalizedCareerStartDate === null) {
        console.warn(`Invalid date format for careerStartDate at row ${rowNumber}: ${csdRaw}. Will be set to null.`);
      }
    }

    let normalizedDateOfBirth: string | null = null;
    const dobRaw = asString(r.dateOfBirth);
    if (dobRaw) {
      normalizedDateOfBirth = normalizeDate(dobRaw);
      if (normalizedDateOfBirth === null) {
        console.warn(`Invalid date format for dateOfBirth at row ${rowNumber}: ${dobRaw}. Will be set to null.`);
      }
    }

    let normalizedResignationDate: string | null = null;
    const resRaw = asString(r.resignationDate);
    if (resRaw) {
      normalizedResignationDate = normalizeDate(resRaw);
      if (normalizedResignationDate === null) {
        console.warn(`Invalid date format for resignationDate at row ${rowNumber}: ${resRaw}. Will be set to null.`);
      }
    }

    let normalizedExitDate: string | null = null;
    const exitRaw = asString(r.exitDate);
    if (exitRaw) {
      normalizedExitDate = normalizeDate(exitRaw);
      if (normalizedExitDate === null) {
        console.warn(`Invalid date format for exitDate at row ${rowNumber}: ${exitRaw}. Will be set to null.`);
      }
    }

    // If no errors, add to valid array with defaults
    if (!hasErrors) {
      const validRow: UserCSVRow = {
        email: asString(r.email),
        firstName: asString(r.firstName),
        lastName: asString(r.lastName) || undefined,
        employeeId: asString(r.employeeId) || '',
        managerEmail: asString(r.managerEmail) || '',
        sbuName: asString(r.sbuName) || '',
        expertiseName: asString(r.expertiseName) || '',
        resourceTypeName: asString(r.resourceTypeName) || '',
        dateOfJoining: normalizedDateOfJoining || '',
        careerStartDate: normalizedCareerStartDate || '',
        dateOfBirth: normalizedDateOfBirth || '',
        resignationDate: normalizedResignationDate || '',
        exitDate: normalizedExitDate || '',
        active: r.active !== undefined ? (asString(r.active) === 'true' || asString(r.active) === '1') : true,
        hasOverhead: r.hasOverhead !== undefined ? (asString(r.hasOverhead) === 'true' || asString(r.hasOverhead) === '1') : true
      };

      // Add userId for update mode
      if (mode === 'update') {
        validRow.userId = asString(r.userId);
      }

      // Handle password
      if (mode === 'create') {
        const pw = asString(r.password);
        validRow.password = pw || generateRandomPassword();
      } else {
        // For updates, only include password if provided
        const pw = asString(r.password);
        if (pw) validRow.password = pw;
      }

      valid.push(validRow);
    }
  });

  return { valid, errors };
};

export const parseUsersCSV = (file: File): Promise<Record<string, unknown>[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          // Filter out empty rows and coerce types safely
          const raw = results.data as Record<string, unknown>[];
          const filteredData = raw.filter((row) => {
            const val = row['email'];
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
