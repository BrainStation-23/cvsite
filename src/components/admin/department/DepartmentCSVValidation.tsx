import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X } from 'lucide-react';
import { DepartmentFormData } from '@/hooks/settings/use-department-settings';

interface DepartmentCSVValidationProps {
  validationResult: {
    valid: DepartmentFormData[];
    errors: Array<{
      row: number;
      field: string;
      value: string;
      message: string;
    }>;
  };
  onProceed: (validDepartments: DepartmentFormData[]) => void;
  onClose: () => void;
  isBulkImporting: boolean;
}

const DepartmentCSVValidation: React.FC<DepartmentCSVValidationProps> = ({
  validationResult,
  onProceed,
  onClose,
  isBulkImporting
}) => {
  const groupedErrors = validationResult.errors.reduce((acc, error) => {
    const key = `${error.row}-${error.field}`;
    if (!acc[key]) {
      acc[key] = error;
    }
    return acc;
  }, {} as Record<string, typeof validationResult.errors[0]>);

  const uniqueErrors = Object.values(groupedErrors);

  return (
    <div className="mb-4 p-4 border rounded-lg bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">CSV Validation Results</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="flex gap-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {validationResult.valid.length} Valid Departments
          </Badge>
          {validationResult.errors.length > 0 && (
            <Badge variant="destructive">
              {validationResult.errors.length} Validation Errors
            </Badge>
          )}
        </div>

        {validationResult.errors.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-red-600">Issues Found:</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {uniqueErrors.map((error, index) => (
                <Alert key={index} variant="destructive" className="text-sm">
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">
                        Row {error.row}, Column "{error.field}"
                      </div>
                      <div className="text-gray-600">
                        Value: "{error.value || '(empty)'}"
                      </div>
                      <div className="text-red-700">
                        Issue: {error.message}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {getFixSuggestion(error.field, error.message)}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <div className="font-medium text-blue-800 mb-1">How to fix these issues:</div>
              <ul className="text-blue-700 space-y-1 list-disc list-inside">
                <li>Open your CSV file in a spreadsheet application</li>
                <li>Navigate to the specific rows and columns mentioned above</li>
                <li>Fix the identified issues following the suggestions</li>
                <li>Save the file and upload it again</li>
              </ul>
            </div>
          </div>
        )}

        {validationResult.valid.length > 0 && (
          <div className="space-y-2">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="text-green-800 font-medium">
                {validationResult.valid.length} departments are ready to import
              </div>
              <div className="text-green-700 text-sm mt-1">
                These departments passed all validation checks and can be safely imported.
              </div>
            </div>
            
            <Button 
              onClick={() => onProceed(validationResult.valid)}
              disabled={isBulkImporting}
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              {isBulkImporting ? "Importing..." : `Import ${validationResult.valid.length} Valid Departments`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const getFixSuggestion = (field: string, message: string): string => {
  if (field === 'name') {
    if (message.includes('required')) {
      return 'Action: Add a department name in this cell';
    }
    if (message.includes('duplicate')) {
      return 'Action: Choose a different department name or remove the duplicate row';
    }
    if (message.includes('already exists')) {
      return 'Action: This department already exists in the database. Remove this row or use a different name';
    }
  }
  
  if (field === 'full_form') {
    return 'Action: This field is optional but should contain the full department name if provided';
  }
  
  return 'Action: Please review and correct the value in this field';
};

export default DepartmentCSVValidation;
