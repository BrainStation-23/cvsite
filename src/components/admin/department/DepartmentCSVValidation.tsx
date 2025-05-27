
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { DepartmentFormData } from '@/hooks/use-department-settings';

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
  return (
    <div className="mb-4 p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">CSV Validation Results</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="space-y-2">
        <div className="flex gap-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {validationResult.valid.length} Valid
          </Badge>
          {validationResult.errors.length > 0 && (
            <Badge variant="destructive">
              {validationResult.errors.length} Errors
            </Badge>
          )}
        </div>
        {validationResult.valid.length > 0 && (
          <Button 
            onClick={() => onProceed(validationResult.valid)}
            disabled={isBulkImporting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isBulkImporting ? "Importing..." : `Import ${validationResult.valid.length} Valid Departments`}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DepartmentCSVValidation;
