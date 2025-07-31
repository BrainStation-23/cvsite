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

// Utility function to sanitize percentage values
const sanitizePercentage = (value: any): number | null => {
  if (!value) return null;
  
  let stringValue = String(value).trim();
  
  // Remove % symbol if present
  stringValue = stringValue.replace('%', '');
  
  const numValue = parseFloat(stringValue);
  if (isNaN(numValue)) return null;
  
  // If value is between 0 and 1 (like 0.25), convert to percentage
  if (numValue > 0 && numValue <= 1) {
    return numValue * 100;
  }
  
  // If value is already a percentage (like 25), keep as is
  return numValue;
};

// Utility function to sanitize text fields
const sanitizeText = (value: any): string => {
  if (!value) return '';
  return String(value).trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Utility function to sanitize date fields
const sanitizeDate = (value: any): string => {
  if (!value) return '';
  const trimmed = String(value).trim();
  
  // Try to parse and reformat the date to ensure consistency
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }
  
  return trimmed; // Return original if can't parse
};

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
      employee_id: 'EMP001',
      bill_type: 'Billable',
      project_name: 'Project Gamma',
      engagement_percentage: '75%',
      billing_percentage: '0.75',
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
  const seenEmployeeProjectCombinations = new Set<string>();

  data.forEach((row: any, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;
    const sanitizedRow: any = {};

    // Sanitize and validate employee_id
    const sanitizedEmployeeId = sanitizeText(row.employee_id);
    if (!sanitizedEmployeeId) {
      errors.push({
        row: rowNumber,
        field: 'employee_id',
        value: row.employee_id || '',
        message: 'Employee ID is required'
      });
      hasErrors = true;
    } else {
      sanitizedRow.employee_id = sanitizedEmployeeId;
    }

    // Sanitize and validate bill_type
    const sanitizedBillType = sanitizeText(row.bill_type);
    if (!sanitizedBillType) {
      errors.push({
        row: rowNumber,
        field: 'bill_type',
        value: row.bill_type || '',
        message: 'Bill type is required'
      });
      hasErrors = true;
    } else {
      sanitizedRow.bill_type = sanitizedBillType;
    }

    // Sanitize and validate project_name
    const sanitizedProjectName = sanitizeText(row.project_name);
    if (!sanitizedProjectName) {
      errors.push({
        row: rowNumber,
        field: 'project_name',
        value: row.project_name || '',
        message: 'Project name is required'
      });
      hasErrors = true;
    } else {
      sanitizedRow.project_name = sanitizedProjectName;
    }

    // Check for duplicate employee_id + project_name combination
    if (sanitizedEmployeeId && sanitizedProjectName) {
      const combination = `${sanitizedEmployeeId.toLowerCase()}|${sanitizedProjectName.toLowerCase()}`;
      if (seenEmployeeProjectCombinations.has(combination)) {
        errors.push({
          row: rowNumber,
          field: 'employee_id',
          value: sanitizedEmployeeId,
          message: 'Duplicate combination of employee ID and project name found in CSV'
        });
        hasErrors = true;
      } else {
        seenEmployeeProjectCombinations.add(combination);
      }
    }

    // Sanitize and validate engagement_percentage
    const sanitizedEngagementPercentage = sanitizePercentage(row.engagement_percentage);
    if (sanitizedEngagementPercentage === null || sanitizedEngagementPercentage < 0 || sanitizedEngagementPercentage > 100) {
      errors.push({
        row: rowNumber,
        field: 'engagement_percentage',
        value: row.engagement_percentage || '',
        message: 'Engagement percentage must be a valid number between 0 and 100 (can include % symbol or decimal format like 0.25)'
      });
      hasErrors = true;
    } else {
      sanitizedRow.engagement_percentage = sanitizedEngagementPercentage;
    }

    // Sanitize and validate billing_percentage
    const sanitizedBillingPercentage = sanitizePercentage(row.billing_percentage);
    if (sanitizedBillingPercentage === null || sanitizedBillingPercentage < 0 || sanitizedBillingPercentage > 100) {
      errors.push({
        row: rowNumber,
        field: 'billing_percentage',
        value: row.billing_percentage || '',
        message: 'Billing percentage must be a valid number between 0 and 100 (can include % symbol or decimal format like 0.25)'
      });
      hasErrors = true;
    } else {
      sanitizedRow.billing_percentage = sanitizedBillingPercentage;
    }

    // Sanitize and validate start_date
    const sanitizedStartDate = sanitizeDate(row.start_date);
    if (!sanitizedStartDate || isNaN(Date.parse(sanitizedStartDate))) {
      errors.push({
        row: rowNumber,
        field: 'start_date',
        value: row.start_date || '',
        message: 'Start date must be a valid date (YYYY-MM-DD format preferred)'
      });
      hasErrors = true;
    } else {
      sanitizedRow.start_date = sanitizedStartDate;
    }

    // Sanitize and validate release_date
    const sanitizedReleaseDate = sanitizeDate(row.release_date);
    if (!sanitizedReleaseDate || isNaN(Date.parse(sanitizedReleaseDate))) {
      errors.push({
        row: rowNumber,
        field: 'release_date',
        value: row.release_date || '',
        message: 'Release date must be a valid date (YYYY-MM-DD format preferred)'
      });
      hasErrors = true;
    } else {
      sanitizedRow.release_date = sanitizedReleaseDate;
    }

    // Validate date order
    if (sanitizedStartDate && sanitizedReleaseDate && 
        !isNaN(Date.parse(sanitizedStartDate)) && !isNaN(Date.parse(sanitizedReleaseDate))) {
      if (new Date(sanitizedStartDate) > new Date(sanitizedReleaseDate)) {
        errors.push({
          row: rowNumber,
          field: 'start_date',
          value: sanitizedStartDate,
          message: 'Start date must be before release date'
        });
        hasErrors = true;
      }
    }

    // If no errors, add to valid array with sanitized data
    if (!hasErrors) {
      valid.push({
        employee_id: sanitizedRow.employee_id,
        bill_type: sanitizedRow.bill_type,
        project_name: sanitizedRow.project_name,
        engagement_percentage: sanitizedRow.engagement_percentage,
        billing_percentage: sanitizedRow.billing_percentage,
        start_date: sanitizedRow.start_date,
        release_date: sanitizedRow.release_date
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
