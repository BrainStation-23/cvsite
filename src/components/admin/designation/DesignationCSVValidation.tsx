
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import { DesignationFormData } from '@/utils/designationCsvUtils';

interface ValidationResult {
  valid: DesignationFormData[];
  errors: Array<{
    row: number;
    errors: string[];
    data: any;
  }>;
}

interface DesignationCSVValidationProps {
  validationResult: ValidationResult;
  onProceed: (validDesignations: DesignationFormData[]) => void;
  onClose: () => void;
  isBulkImporting: boolean;
}

const DesignationCSVValidation: React.FC<DesignationCSVValidationProps> = ({
  validationResult,
  onProceed,
  onClose,
  isBulkImporting
}) => {
  const { valid, errors } = validationResult;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            {errors.length === 0 ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            CSV Validation Results
          </span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Badge variant="default" className="bg-green-100 text-green-800">
            {valid.length} Valid
          </Badge>
          {errors.length > 0 && (
            <Badge variant="destructive">
              {errors.length} Errors
            </Badge>
          )}
        </div>

        {errors.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700">Errors Found:</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {errors.map((error, index) => (
                <Alert key={index} variant="destructive">
                  <AlertDescription>
                    <strong>Row {error.row}:</strong> {error.errors.join(', ')}
                    {error.data.name && (
                      <div className="text-sm mt-1">Name: "{error.data.name}"</div>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </div>
        )}

        {valid.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-green-700">Valid Entries to Import:</h4>
            <div className="max-h-32 overflow-y-auto">
              <div className="grid grid-cols-1 gap-1 text-sm">
                {valid.map((designation, index) => (
                  <div key={index} className="bg-green-50 p-2 rounded">
                    {designation.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          {valid.length > 0 && (
            <Button 
              onClick={() => onProceed(valid)}
              disabled={isBulkImporting}
              className="flex-1"
            >
              {isBulkImporting ? 'Importing...' : `Import ${valid.length} Designations`}
            </Button>
          )}
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DesignationCSVValidation;
