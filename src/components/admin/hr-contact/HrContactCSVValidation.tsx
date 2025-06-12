
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Upload } from 'lucide-react';
import { HrContactFormData } from '@/hooks/use-hr-contact-settings';

interface ValidationResult {
  valid: HrContactFormData[];
  errors: Array<{
    row: number;
    errors: string[];
    data: HrContactFormData;
  }>;
}

interface HrContactCSVValidationProps {
  validationResult: ValidationResult;
  onImport: () => void;
  isImporting: boolean;
}

const HrContactCSVValidation: React.FC<HrContactCSVValidationProps> = ({
  validationResult,
  onImport,
  isImporting
}) => {
  const { valid, errors } = validationResult;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>{valid.length}</strong> valid HR contacts ready to import
          </AlertDescription>
        </Alert>
        
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{errors.length}</strong> rows with errors
          </AlertDescription>
        </Alert>
      </div>

      {valid.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-green-800">Valid HR Contacts ({valid.length})</h4>
          <div className="max-h-40 overflow-y-auto border rounded p-2 bg-green-50">
            {valid.map((contact, index) => (
              <div key={index} className="text-sm text-green-700">
                {contact.name} - {contact.email}
              </div>
            ))}
          </div>
        </div>
      )}

      {errors.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-red-800">Errors ({errors.length})</h4>
          <div className="max-h-40 overflow-y-auto border rounded p-2 bg-red-50">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-red-700 border-b border-red-200 pb-1 mb-1">
                <strong>Row {error.row}:</strong> {error.data.name || 'No name'} - {error.data.email || 'No email'}
                <ul className="ml-4 list-disc">
                  {error.errors.map((err, errIndex) => (
                    <li key={errIndex}>{err}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {valid.length > 0 && (
        <Button
          onClick={onImport}
          disabled={isImporting}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {isImporting ? 'Importing...' : `Import ${valid.length} HR Contacts`}
        </Button>
      )}
    </div>
  );
};

export default HrContactCSVValidation;
