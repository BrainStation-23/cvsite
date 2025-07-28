
import Papa from "https://esm.sh/papaparse@5.4.1";
import { UserUpdateData } from "./types.ts";

export const parseCSVData = async (file: File): Promise<UserUpdateData[]> => {
  console.log('Parsing CSV file:', file.name, 'Size:', file.size);
  
  const text = await file.text();
  console.log('CSV text length:', text.length);
  
  return new Promise((resolve, reject) => {
    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        const normalized = header.trim().toLowerCase();
        const headerMap: Record<string, string> = {
          'userid': 'userId',
          'user_id': 'userId',
          'id': 'userId',
          'firstname': 'firstName',
          'first_name': 'firstName',
          'lastname': 'lastName',
          'last_name': 'lastName',
          'employeeid': 'employeeId',
          'employee_id': 'employeeId',
          'manageremail': 'managerEmail',
          'manager_email': 'managerEmail',
          'sbuname': 'sbuName',
          'sbu_name': 'sbuName',
          'expertisename': 'expertiseName',
          'expertise_name': 'expertiseName',
          'resourcetypename': 'resourceTypeName',
          'resource_type_name': 'resourceTypeName',
          'dateofjoining': 'dateOfJoining',
          'date_of_joining': 'dateOfJoining',
          'careerstartdate': 'careerStartDate',
          'career_start_date': 'careerStartDate'
        };
        return headerMap[normalized] || header;
      },
      complete: (results) => {
        console.log('Parse complete. Rows:', results.data.length);
        
        if (results.errors.length > 0) {
          console.error('CSV parsing errors:', results.errors);
        }
        
        const users = results.data
          .filter((row: any) => row.userId && row.userId.trim() !== '')
          .map((row: any) => ({
            userId: row.userId?.trim(),
            email: row.email?.trim(),
            firstName: row.firstName?.trim(),
            lastName: row.lastName?.trim() || undefined,
            role: row.role?.trim(),
            employeeId: row.employeeId?.trim(),
            password: row.password?.trim(),
            managerEmail: row.managerEmail?.trim(),
            sbuName: row.sbuName?.trim(),
            expertiseName: row.expertiseName?.trim(),
            resourceTypeName: row.resourceTypeName?.trim(),
            dateOfJoining: row.dateOfJoining?.trim(),
            careerStartDate: row.careerStartDate?.trim()
          }));
        
        console.log('Filtered users count:', users.length);
        resolve(users);
      },
      error: (error) => {
        console.error('Papa parse error:', error);
        reject(error);
      }
    });
  });
};
