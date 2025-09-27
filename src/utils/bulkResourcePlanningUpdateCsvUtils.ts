import Papa from 'papaparse';

export interface BulkResourcePlanningUpdateCSVRow {
  resource_planning_id: string;
  profile_id: string;
  project_id: string;
  bill_type_id: string;
  employee_id: string; // Keep for reference/validation
  engagement_percentage: number;
  billing_percentage: number;
  engagement_start_date: string; // Fixed field name
  release_date: string;
}

export interface BulkResourcePlanningUpdateValidationResult {
  valid: BulkResourcePlanningUpdateCSVRow[];
  errors: BulkResourcePlanningUpdateValidationError[];
}

export interface BulkResourcePlanningUpdateValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

// Loosely-typed input row as read from CSV (values may be strings, numbers, etc.)
export type BulkResourcePlanningUpdateInputRow = {
  resource_planning_id?: unknown;
  profile_id?: unknown;
  project_id?: unknown;
  bill_type_id?: unknown;
  employee_id?: unknown;
  engagement_percentage?: unknown;
  billing_percentage?: unknown;
  engagement_start_date?: unknown;
  release_date?: unknown;
} & Record<string, unknown>;

// Utility function to sanitize percentage values
const sanitizePercentage = (value: unknown): number | null => {
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
const sanitizeText = (value: unknown): string => {
  if (!value) return '';
  return String(value).trim().replace(/\s+/g, ' '); // Replace multiple spaces with single space
};

// Utility function to sanitize date fields
const sanitizeDate = (value: unknown): string => {
  if (!value) return '';
  const trimmed = String(value).trim();
  
  // Try to parse and reformat the date to ensure consistency
  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }
  
  return trimmed; // Return original if can't parse
};

export const downloadBulkResourcePlanningUpdateTemplate = (): void => {
  const templateData = [
    {
      'Resource Planning ID': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      'Profile ID': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      'Project ID': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      'Bill Type ID': 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      'Employee ID': 'EMP001',
      'Employee Name': 'John Doe',
      'Overhead': 'Yes',
      'SBU': 'Technology',
      'Project Name': 'Project Alpha',
      'Client Name': 'Client A',
      'Manager': 'Jane Smith',
      'Bill Type': 'Billable',
      'Engagement %': 75,
      'Billing %': 60,
      'Start Date': '2024-01-01',
      'Release Date': '2024-12-31',
      'Weekly Validation': 'Yes',
      'Created At': '2024-01-01'
    }
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_resource_planning_update_template_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const validateBulkResourcePlanningUpdateCSVData = (data: BulkResourcePlanningUpdateInputRow[]): BulkResourcePlanningUpdateValidationResult => {
  const valid: BulkResourcePlanningUpdateCSVRow[] = [];
  const errors: BulkResourcePlanningUpdateValidationError[] = [];
  const seenResourcePlanningIds = new Set<string>();

  data.forEach((row: BulkResourcePlanningUpdateInputRow, index: number) => {
    const rowNumber = index + 2; // +2 because index starts at 0 and CSV has header row
    let hasErrors = false;
    const sanitizedRow: Partial<BulkResourcePlanningUpdateCSVRow> = {};

    // Validate resource_planning_id (required for updates)
    const sanitizedResourcePlanningId = sanitizeText(row.resource_planning_id);
    if (!sanitizedResourcePlanningId) {
      errors.push({
        row: rowNumber,
        field: 'resource_planning_id',
        value: String(row.resource_planning_id ?? ''),
        message: 'Resource Planning ID is required for updates'
      });
      hasErrors = true;
    } else {
      if (seenResourcePlanningIds.has(sanitizedResourcePlanningId)) {
        errors.push({
          row: rowNumber,
          field: 'resource_planning_id',
          value: sanitizedResourcePlanningId,
          message: 'Duplicate Resource Planning ID found in CSV'
        });
        hasErrors = true;
      } else {
        seenResourcePlanningIds.add(sanitizedResourcePlanningId);
        sanitizedRow.resource_planning_id = sanitizedResourcePlanningId;
      }
    }

    // Validate profile_id
    const sanitizedProfileId = sanitizeText(row.profile_id);
    if (!sanitizedProfileId) {
      errors.push({
        row: rowNumber,
        field: 'profile_id',
        value: String(row.profile_id ?? ''),
        message: 'Profile ID is required'
      });
      hasErrors = true;
    } else {
      sanitizedRow.profile_id = sanitizedProfileId;
    }

    // Validate project_id
    const sanitizedProjectId = sanitizeText(row.project_id);
    if (!sanitizedProjectId) {
      errors.push({
        row: rowNumber,
        field: 'project_id',
        value: String(row.project_id ?? ''),
        message: 'Project ID is required'
      });
      hasErrors = true;
    } else {
      sanitizedRow.project_id = sanitizedProjectId;
    }

    // Validate bill_type_id
    const sanitizedBillTypeId = sanitizeText(row.bill_type_id);
    if (!sanitizedBillTypeId) {
      errors.push({
        row: rowNumber,
        field: 'bill_type_id',
        value: String(row.bill_type_id ?? ''),
        message: 'Bill Type ID is required'
      });
      hasErrors = true;
    } else {
      sanitizedRow.bill_type_id = sanitizedBillTypeId;
    }

    // Validate employee_id (for reference)
    const sanitizedEmployeeId = sanitizeText(row.employee_id);
    if (!sanitizedEmployeeId) {
      errors.push({
        row: rowNumber,
        field: 'employee_id',
        value: String(row.employee_id ?? ''),
        message: 'Employee ID is required'
      });
      hasErrors = true;
    } else {
      sanitizedRow.employee_id = sanitizedEmployeeId;
    }

    // Sanitize and validate engagement_percentage
    const sanitizedEngagementPercentage = sanitizePercentage(row.engagement_percentage);
    if (sanitizedEngagementPercentage === null || sanitizedEngagementPercentage < 0 || sanitizedEngagementPercentage > 100) {
      errors.push({
        row: rowNumber,
        field: 'engagement_percentage',
        value: String(row.engagement_percentage ?? ''),
        message: 'Engagement percentage must be a valid number between 0 and 100'
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
        value: String(row.billing_percentage ?? ''),
        message: 'Billing percentage must be a valid number between 0 and 100'
      });
      hasErrors = true;
    } else {
      sanitizedRow.billing_percentage = sanitizedBillingPercentage;
    }

    // Sanitize and validate engagement_start_date
    const sanitizedEngagementStartDate = sanitizeDate(row.engagement_start_date);
    if (!sanitizedEngagementStartDate || isNaN(Date.parse(sanitizedEngagementStartDate))) {
      errors.push({
        row: rowNumber,
        field: 'engagement_start_date',
        value: String(row.engagement_start_date ?? ''),
        message: 'Start date must be a valid date (YYYY-MM-DD format preferred)'
      });
      hasErrors = true;
    } else {
      sanitizedRow.engagement_start_date = sanitizedEngagementStartDate;
    }

    // Sanitize and validate release_date
    const sanitizedReleaseDate = sanitizeDate(row.release_date);
    if (!sanitizedReleaseDate || isNaN(Date.parse(sanitizedReleaseDate))) {
      errors.push({
        row: rowNumber,
        field: 'release_date',
        value: String(row.release_date ?? ''),
        message: 'Release date must be a valid date (YYYY-MM-DD format preferred)'
      });
      hasErrors = true;
    } else {
      sanitizedRow.release_date = sanitizedReleaseDate;
    }

    // Validate date order
    if (sanitizedEngagementStartDate && sanitizedReleaseDate && 
        !isNaN(Date.parse(sanitizedEngagementStartDate)) && !isNaN(Date.parse(sanitizedReleaseDate))) {
      if (new Date(sanitizedEngagementStartDate) > new Date(sanitizedReleaseDate)) {
        errors.push({
          row: rowNumber,
          field: 'engagement_start_date',
          value: sanitizedEngagementStartDate,
          message: 'Start date must be before release date'
        });
        hasErrors = true;
      }
    }

    // If no errors, add to valid array with sanitized data
    if (!hasErrors) {
      valid.push({
        resource_planning_id: sanitizedRow.resource_planning_id as string,
        profile_id: sanitizedRow.profile_id as string,
        project_id: sanitizedRow.project_id as string,
        bill_type_id: sanitizedRow.bill_type_id as string,
        employee_id: sanitizedRow.employee_id as string,
        engagement_percentage: sanitizedRow.engagement_percentage as number,
        billing_percentage: sanitizedRow.billing_percentage as number,
        engagement_start_date: sanitizedRow.engagement_start_date as string,
        release_date: sanitizedRow.release_date as string
      });
    }
  });

  return { valid, errors };
};

export const parseBulkResourcePlanningUpdateCSV = (file: File): Promise<BulkResourcePlanningUpdateInputRow[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse<BulkResourcePlanningUpdateInputRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string): string => {
        const normalized = header.trim().toLowerCase();
        const headerMap: Record<string, string> = {
          // Updated CSV format mappings with IDs
          'resource planning id': 'resource_planning_id',
          'profile id': 'profile_id',
          'project id': 'project_id',
          'bill type id': 'bill_type_id',
          'employee id': 'employee_id',
          'engagement %': 'engagement_percentage',
          'billing %': 'billing_percentage',
          'start date': 'engagement_start_date',
          'release date': 'release_date',
          // Alternative format mappings
          'resource_planning_id': 'resource_planning_id',
          'profile_id': 'profile_id',
          'project_id': 'project_id',
          'bill_type_id': 'bill_type_id',
          'employee_id': 'employee_id',
          'engagement_percentage': 'engagement_percentage',
          'engagement percentage': 'engagement_percentage',
          'billing_percentage': 'billing_percentage',
          'billing percentage': 'billing_percentage',
          'engagement_start_date': 'engagement_start_date',
          'startdate': 'engagement_start_date',
          'start_date': 'engagement_start_date',
          'releasedate': 'release_date',
          'release_date': 'release_date'
        };
        return headerMap[normalized] || header;
      },
      complete: (results) => {
        try {
          const filteredData: BulkResourcePlanningUpdateInputRow[] = results.data.filter((row) => 
            row && typeof row.resource_planning_id !== 'undefined' && row.resource_planning_id !== null && row.resource_planning_id.toString().trim() !== ''
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
