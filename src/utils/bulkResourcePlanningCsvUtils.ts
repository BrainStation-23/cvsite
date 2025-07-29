
import Papa from 'papaparse';

export interface BulkResourcePlanningCSVRow {
  employee_id: string;
  bill_type: string;
  project_name: string;
  engagement_percentage: number;
  billing_percentage: number;
  start_date: string;
  release_date: string;
}

export interface BulkResourcePlanningValidationResult {
  valid: BulkResourcePlanningCSVRow[];
  errors: BulkResourcePlanningValidationError[];
}

export interface BulkResourcePlanningValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export const downloadBulkResourcePlanningTemplate = () => {
  const templateData = [
    {
      employee_id: 'EMP001',
      bill_type: 'Billable',
      project_name: 'Project Alpha',
      engagement_percentage: 100,
      billing_percentage: 80,
      start_date: '2024-01-01',
      release_date: '2024-12-31'
    },
    {
      employee_id: 'EMP002',
      bill_type: 'Non-Billable',
      project_name: 'Project Beta',
      engagement_percentage: 50,
      billing_percentage: 0,
      start_date: '2024-02-01',
      release_date: '2024-06-30'
    },
    {
      employee_id: 'EMP003',
      bill_type: 'Billable',
      project_name: 'Project Gamma',
      engagement_percentage: 75,
      billing_percentage: 75,
      start_date: '2024-03-01',
      release_date: '2024-09-30'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_resource_planning_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateBulkResourcePlanningCSVData = (data: any[]): BulkResourcePlanningValidationResult => {
  const valid: BulkResourcePlanningCSVRow[] = [];
  const errors: BulkResourcePlanningValidationError[] = [];
  const seenEmployeeIds = new Set();

  data.forEach((row: any, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;

    // Validate employee_id
    if (!row.employee_id || typeof row.employee_id !== 'string' || row.employee_id.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'employee_id',
        value: row.employee_id || '',
        message: 'Employee ID is required'
      });
      hasErrors = true;
    } else {
      const trimmedEmployeeId = row.employee_id.trim();
      if (seenEmployeeIds.has(trimmedEmployeeId)) {
        errors.push({
          row: rowNumber,
          field: 'employee_id',
          value: trimmedEmployeeId,
          message: 'Duplicate employee ID in CSV'
        });
        hasErrors = true;
      } else {
        seenEmployeeIds.add(trimmedEmployeeId);
      }
    }

    // Validate bill_type
    if (!row.bill_type || typeof row.bill_type !== 'string' || row.bill_type.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'bill_type',
        value: row.bill_type || '',
        message: 'Bill type is required'
      });
      hasErrors = true;
    }

    // Validate project_name
    if (!row.project_name || typeof row.project_name !== 'string' || row.project_name.trim() === '') {
      errors.push({
        row: rowNumber,
        field: 'project_name',
        value: row.project_name || '',
        message: 'Project name is required'
      });
      hasErrors = true;
    }

    // Validate engagement_percentage
    const engagementPercentage = Number(row.engagement_percentage);
    if (isNaN(engagementPercentage) || engagementPercentage < 0 || engagementPercentage > 100) {
      errors.push({
        row: rowNumber,
        field: 'engagement_percentage',
        value: row.engagement_percentage || '',
        message: 'Engagement percentage must be a number between 0 and 100'
      });
      hasErrors = true;
    }

    // Validate billing_percentage
    const billingPercentage = Number(row.billing_percentage);
    if (isNaN(billingPercentage) || billingPercentage < 0 || billingPercentage > 100) {
      errors.push({
        row: rowNumber,
        field: 'billing_percentage',
        value: row.billing_percentage || '',
        message: 'Billing percentage must be a number between 0 and 100'
      });
      hasErrors = true;
    }

    // Validate start_date
    if (!row.start_date || isNaN(Date.parse(row.start_date))) {
      errors.push({
        row: rowNumber,
        field: 'start_date',
        value: row.start_date || '',
        message: 'Start date must be a valid date (YYYY-MM-DD format)'
      });
      hasErrors = true;
    }

    // Validate release_date
    if (!row.release_date || isNaN(Date.parse(row.release_date))) {
      errors.push({
        row: rowNumber,
        field: 'release_date',
        value: row.release_date || '',
        message: 'Release date must be a valid date (YYYY-MM-DD format)'
      });
      hasErrors = true;
    }

    // Validate date order
    if (row.start_date && row.release_date && !isNaN(Date.parse(row.start_date)) && !isNaN(Date.parse(row.release_date))) {
      if (new Date(row.start_date) > new Date(row.release_date)) {
        errors.push({
          row: rowNumber,
          field: 'start_date',
          value: row.start_date,
          message: 'Start date must be before release date'
        });
        hasErrors = true;
      }
    }

    // If no errors, add to valid array
    if (!hasErrors) {
      valid.push({
        employee_id: row.employee_id.trim(),
        bill_type: row.bill_type.trim(),
        project_name: row.project_name.trim(),
        engagement_percentage: engagementPercentage,
        billing_percentage: billingPercentage,
        start_date: row.start_date.trim(),
        release_date: row.release_date.trim()
      });
    }
  });

  return { valid, errors };
};

export const parseBulkResourcePlanningCSV = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        const normalized = header.trim().toLowerCase();
        const headerMap: Record<string, string> = {
          'employeeid': 'employee_id',
          'employee_id': 'employee_id',
          'emp_id': 'employee_id',
          'billtype': 'bill_type',
          'bill_type': 'bill_type',
          'bill type': 'bill_type',
          'projectname': 'project_name',
          'project_name': 'project_name',
          'project name': 'project_name',
          'engagementpercentage': 'engagement_percentage',
          'engagement_percentage': 'engagement_percentage',
          'engagement percentage': 'engagement_percentage',
          'billingpercentage': 'billing_percentage',
          'billing_percentage': 'billing_percentage',
          'billing percentage': 'billing_percentage',
          'startdate': 'start_date',
          'start_date': 'start_date',
          'start date': 'start_date',
          'releasedate': 'release_date',
          'release_date': 'release_date',
          'release date': 'release_date'
        };
        return headerMap[normalized] || header;
      },
      complete: (results) => {
        try {
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
