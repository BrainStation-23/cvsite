
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { BulkResourcePlanningValidationResult, BulkResourcePlanningValidationError } from '@/utils/bulkResourcePlanningCsvUtils';

interface BulkResourcePlanningCSVValidationProps {
  validationResult: BulkResourcePlanningValidationResult;
  fileName: string;
}

export const BulkResourcePlanningCSVValidation: React.FC<BulkResourcePlanningCSVValidationProps> = ({
  validationResult,
  fileName
}) => {
  const { valid, errors } = validationResult;
  const hasErrors = errors.length > 0;
  const hasValidData = valid.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">CSV Validation Results</h3>
        <span className="text-sm text-gray-500">({fileName})</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Alert className={hasValidData ? "border-green-200 bg-green-50" : "border-gray-200"}>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <span className="font-medium text-green-800">{valid.length} Valid Records</span>
            <br />
            <span className="text-green-600 text-sm">Ready to import</span>
          </AlertDescription>
        </Alert>

        <Alert className={hasErrors ? "border-red-200 bg-red-50" : "border-gray-200"}>
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <span className="font-medium text-red-800">{errors.length} Errors Found</span>
            <br />
            <span className="text-red-600 text-sm">Need to be fixed</span>
          </AlertDescription>
        </Alert>
      </div>

      {/* Valid Data Preview */}
      {hasValidData && (
        <div>
          <h4 className="text-md font-medium text-green-800 mb-2">Valid Records ({valid.length})</h4>
          <div className="bg-green-50 border border-green-200 rounded-md p-3 max-h-40 overflow-y-auto">
            <div className="space-y-1">
              {valid.slice(0, 5).map((item, index) => (
                <div key={index} className="text-sm text-green-700">
                  • {item.employee_id} - {item.project_name} ({item.engagement_percentage}% engagement)
                </div>
              ))}
              {valid.length > 5 && (
                <div className="text-sm text-green-600 italic">
                  ... and {valid.length - 5} more
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Errors */}
      {hasErrors && (
        <div>
          <h4 className="text-md font-medium text-red-800 mb-2">Errors ({errors.length})</h4>
          <div className="bg-red-50 border border-red-200 rounded-md p-3 max-h-60 overflow-y-auto">
            <div className="space-y-2">
              {errors.map((error, index) => (
                <Alert key={index} className="border-red-300 bg-red-100 py-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <span className="font-medium">Row {error.row}:</span> {error.message}
                    {error.value && (
                      <span className="block text-sm text-red-600 mt-1">
                        Field: {error.field} | Value: "{error.value}"
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        </div>
      )}

      {!hasValidData && !hasErrors && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No valid data found in the CSV file. Please check the file format and try again.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
