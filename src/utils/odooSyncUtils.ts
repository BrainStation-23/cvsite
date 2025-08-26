
import Papa from 'papaparse';

export interface NotFoundEmployee {
  employeeId: string;
  name: string;
  email: string;
  sbuName: string;
  managerEmail?: string;
}

export interface UserCreateCSVRow {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  password: string;
  employeeId: string;
  managerEmail: string;
  sbuName: string;
  expertiseName: string;
  resourceTypeName: string;
  dateOfJoining: string;
  careerStartDate: string;
}

export const convertNotFoundEmployeesToCSV = (employees: NotFoundEmployee[]): string => {
  const csvData: UserCreateCSVRow[] = employees.map(employee => {
    // Parse the full name into first and last name
    const nameParts = employee.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    return {
      email: employee.email || '',
      firstName,
      lastName,
      role: 'employee', // Default role
      password: '', // Will be auto-generated
      employeeId: employee.employeeId || '',
      managerEmail: employee.managerEmail || '',
      sbuName: employee.sbuName || '',
      expertiseName: '', // Empty - can be filled later
      resourceTypeName: '', // Empty - can be filled later
      dateOfJoining: '', // Empty - can be filled later
      careerStartDate: '' // Empty - can be filled later
    };
  });

  return Papa.unparse(csvData);
};

export const createFileFromCSV = (csvContent: string, filename: string = 'odoo_sync_users.csv'): File => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  return new File([blob], filename, { type: blob.type });
};
