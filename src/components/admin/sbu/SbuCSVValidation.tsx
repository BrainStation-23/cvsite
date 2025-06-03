
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { SbuFormData } from '@/hooks/use-sbu-settings';

interface ValidationError {
  row: number;
  errors: string[];
  data: SbuFormData;
}

interface SbuCSVValidationProps {
  validData: SbuFormData[];
  errors: ValidationError[];
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}

const SbuCSVValidation: React.FC<SbuCSVValidationProps> = ({
  validData,
  errors,
  onConfirm,
  onCancel,
  isImporting
}) => {
  return (
    <div className="space-y-4">
      {validData.length > 0 && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{validData.length} valid SBU(s)</strong> ready to be imported.
          </AlertDescription>
        </Alert>
      )}

      {errors.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{errors.length} error(s)</strong> found in the CSV file:
            <div className="mt-2 max-h-40 overflow-y-auto">
              {errors.map((error, index) => (
                <div key={index} className="text-sm mt-1">
                  <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {validData.length === 0 && errors.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            No valid SBUs found. Please fix the errors in your CSV file and try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {validData.length > 0 && (
          <Button onClick={onConfirm} disabled={isImporting}>
            {isImporting ? 'Importing...' : `Import ${validData.length} SBU(s)`}
          </Button>
        )}
      </div>
    </div>
  );
};

export default SbuCSVValidation;
