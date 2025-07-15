
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { CSVValidationResult, CSVValidationError } from '@/utils/userCsvUtils';

interface UserCSVValidationProps {
  validationResult: CSVValidationResult;
  mode?: 'create' | 'update';
}

const UserCSVValidation: React.FC<UserCSVValidationProps> = ({ 
  validationResult, 
  mode = 'create' 
}) => {
  const { valid, errors } = validationResult;
  const hasErrors = errors.length > 0;
  const hasValid = valid.length > 0;

  // Group errors by row for better display
  const errorsByRow = errors.reduce((acc, error) => {
    if (!acc[error.row]) {
      acc[error.row] = [];
    }
    acc[error.row].push(error);
    return acc;
  }, {} as Record<number, CSVValidationError[]>);

  const actionText = mode === 'create' ? 'import' : 'update';
  const entityText = mode === 'create' ? 'users ready to import' : 'users ready to update';

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          <div>
            <div className="font-medium text-green-900 dark:text-green-100">Valid Users</div>
            <div className="text-sm text-green-700 dark:text-green-300">{valid.length} {entityText}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <div>
            <div className="font-medium text-red-900 dark:text-red-100">Errors Found</div>
            <div className="text-sm text-red-700 dark:text-red-300">{errors.length} issues need fixing</div>
          </div>
        </div>
      </div>

      {/* Validation Messages */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following errors before {actionText}ing:
          </AlertDescription>
        </Alert>
      )}

      {/* Error Details */}
      {hasErrors && (
        <div className="space-y-3">
          <h4 className="font-medium text-red-900 dark:text-red-100">Validation Errors:</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {Object.entries(errorsByRow).map(([row, rowErrors]) => (
              <div key={row} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                <div className="font-medium text-red-900 dark:text-red-100 mb-2">
                  Row {row}:
                </div>
                <div className="space-y-1">
                  {rowErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm">
                      <Badge variant="destructive" className="text-xs">
                        {error.field}
                      </Badge>
                      <span className="text-red-700 dark:text-red-300">
                        {error.message}
                        {error.value && (
                          <span className="font-mono bg-red-100 dark:bg-red-900/40 px-1 rounded ml-1">
                            "{error.value}"
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          CSV Format Requirements for {mode === 'create' ? 'Create' : 'Update'}:
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          {mode === 'update' && (
            <li>• <strong>userId</strong>: Required for updates, must be existing user ID</li>
          )}
          <li>• <strong>email</strong>: Required, must be valid email format</li>
          <li>• <strong>firstName</strong>: Required, cannot be empty</li>
          <li>• <strong>lastName</strong>: Required, cannot be empty</li>
          <li>• <strong>role</strong>: Optional (admin, manager, employee), defaults to employee</li>
          <li>• <strong>password</strong>: Optional, {mode === 'create' ? 'auto-generated if empty' : 'leave empty to keep current password'}</li>
          <li>• <strong>employeeId</strong>: Optional employee identifier</li>
          <li>• <strong>managerEmail</strong>: Optional, must be valid email if provided</li>
          <li>• <strong>sbuName</strong>: Optional, SBU name (human-readable)</li>
          <li>• <strong>expertiseName</strong>: Optional, expertise type name</li>
          <li>• <strong>resourceTypeName</strong>: Optional, resource type name</li>
          <li>• <strong>dateOfJoining</strong>: Optional, format: YYYY-MM-DD</li>
          <li>• <strong>careerStartDate</strong>: Optional, format: YYYY-MM-DD</li>
        </ul>
      </div>
    </div>
  );
};

export default UserCSVValidation;
