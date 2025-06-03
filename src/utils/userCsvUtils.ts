
import Papa from 'papaparse';
import { UserRole } from '@/types';

export interface UserCSVRow {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  password?: string;
  employeeId?: string;
  sbuName?: string;
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

export const downloadCSVTemplate = () => {
  const templateData = [
    {
      email: 'john.doe@company.com',
      firstName: 'John',
      lastName: 'Doe',
      role: 'employee',
      password: 'SecurePass123!',
      employeeId: 'EMP001',
      sbuName: 'Technology Division'
    },
    {
      email: 'jane.smith@company.com',
      firstName: 'Jane',
      lastName: 'Smith',
      role: 'manager',
      password: '',
      employeeId: '',
      sbuName: 'Marketing Department'
    },
    {
      email: 'admin@company.com',
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      password: 'AdminPass456!',
      employeeId: 'ADM001',
      sbuName: ''
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'user_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateCSVData = (data: any[], existingUsers: any[] = []): CSVValidationResult => {
  const valid: UserCSVRow[] = [];
  const errors: CSVValidationError[] = [];
  const seenEmails = new Set();
  
  // Create a set of existing user emails for quick lookup
  const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase().trim()));

  data.forEach((row: any, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

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
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
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
        } else if (existingEmails.has(lowerEmail)) {
          errors.push({
            row: rowNumber,
            field: 'email',
            value: trimmedEmail,
            message: 'User with this email already exists'
          });
          hasErrors = true;
        } else {
          seenEmails.add(lowerEmail);
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

    // Validate lastName (optional but if provided, should not be empty)
    if (row.lastName && typeof row.lastName === 'string' && row.lastName.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'lastName',
        value: row.lastName,
        message: 'Last name cannot be empty if provided'
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

    // Validate sbuName (optional)
    let sbuName = '';
    if (row.sbuName && typeof row.sbuName === 'string') {
      sbuName = row.sbuName.trim();
    }

    // If no errors, add to valid array with defaults
    if (!hasErrors && formattedRole) {
      valid.push({
        email: row.email.trim(),
        firstName: row.firstName.trim(),
        lastName: row.lastName ? row.lastName.trim() : '',
        role: formattedRole,
        password: row.password && row.password.trim() ? row.password.trim() : generateRandomPassword(),
        employeeId: row.employeeId ? row.employeeId.trim() : '',
        sbuName: sbuName
      });
    }
  });

  return { valid, errors };
};

export const parseUsersCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
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
