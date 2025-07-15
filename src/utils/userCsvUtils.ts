
import Papa from 'papaparse';
import { UserRole } from '@/types';

export interface UserCSVRow {
  userId?: string; // For updates
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  password?: string;
  employeeId?: string;
  managerEmail?: string;
  sbuName?: string;
  expertiseName?: string;
  resourceTypeName?: string;
  dateOfJoining?: string;
  careerStartDate?: string;
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

// Helper function to format role with proper case
const formatUserRole = (role: string): UserRole | null => {
  if (!role || typeof role !== 'string') return 'employee';
  
  const lowerRole = role.toLowerCase().trim();
  switch (lowerRole) {
    case 'admin':
      return 'admin';
    case 'manager':
      return 'manager';
    case 'employee':
    case '':
      return 'employee';
    default:
      return null;
  }
};

// Helper function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate date format (YYYY-MM-DD)
const isValidDate = (dateString: string): boolean => {
  if (!dateString) return true; // Empty dates are allowed
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
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
      careerStartDate: '2020-06-01'
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
      careerStartDate: '2018-09-15'
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
      careerStartDate: '2019-04-20'
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
      careerStartDate: '2020-06-01'
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
      careerStartDate: '2018-09-15'
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

    // Validate lastName (required)
    if (!row.lastName || typeof row.lastName !== 'string' || row.lastName.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'lastName',
        value: row.lastName || '',
        message: 'Last name is required'
      });
      hasErrors = true;
    }

    // Validate role (optional, defaults to employee)
    const formattedRole = formatUserRole(row.role);
    if (row.role && !formattedRole) {
      errors.push({
        row: rowNumber,
        field: 'role',
        value: row.role || '',
        message: 'Role must be one of: admin, manager, employee (case insensitive)'
      });
      hasErrors = true;
    }

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

    // Validate date of joining if provided
    if (row.dateOfJoining && row.dateOfJoining.trim() && !isValidDate(row.dateOfJoining.trim())) {
      errors.push({
        row: rowNumber,
        field: 'dateOfJoining',
        value: row.dateOfJoining,
        message: 'Date of joining must be in YYYY-MM-DD format'
      });
      hasErrors = true;
    }

    // Validate career start date if provided
    if (row.careerStartDate && row.careerStartDate.trim() && !isValidDate(row.careerStartDate.trim())) {
      errors.push({
        row: rowNumber,
        field: 'careerStartDate',
        value: row.careerStartDate,
        message: 'Career start date must be in YYYY-MM-DD format'
      });
      hasErrors = true;
    }

    // If no errors, add to valid array with defaults
    if (!hasErrors && formattedRole) {
      const validRow: UserCSVRow = {
        email: row.email.trim(),
        firstName: row.firstName.trim(),
        lastName: row.lastName.trim(),
        role: formattedRole,
        employeeId: row.employeeId ? row.employeeId.trim() : '',
        managerEmail: row.managerEmail ? row.managerEmail.trim() : '',
        sbuName: row.sbuName ? row.sbuName.trim() : '',
        expertiseName: row.expertiseName ? row.expertiseName.trim() : '',
        resourceTypeName: row.resourceTypeName ? row.resourceTypeName.trim() : '',
        dateOfJoining: row.dateOfJoining ? row.dateOfJoining.trim() : '',
        careerStartDate: row.careerStartDate ? row.careerStartDate.trim() : ''
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
