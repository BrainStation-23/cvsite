
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, X } from 'lucide-react';
import { CSVValidationResult, CSVValidationError } from '@/utils/csvUtils';
import { UniversityFormData } from '@/hooks/use-university-settings';

interface UniversityCSVValidationProps {
  validationResult: CSVValidationResult;
  onProceed: (validUniversities: UniversityFormData[]) => void;
  onCancel: () => void;
  isImporting: boolean;
}

const UniversityCSVValidation: React.FC<UniversityCSVValidationProps> = ({
  validationResult,
  onProceed,
  onCancel,
  isImporting
}) => {
  const { valid, errors } = validationResult;
  const hasErrors = errors.length > 0;
  const hasValidData = valid.length > 0;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            {hasErrors ? (
              <AlertCircle className="h-5 w-5 text-destructive" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600" />
            )}
            CSV Validation Results
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-600">
              {valid.length} Valid
            </Badge>
          </div>
          {hasErrors && (
            <div className="flex items-center gap-2">
              <Badge variant="destructive">
                {errors.length} Errors
              </Badge>
            </div>
          )}
        </div>

        {hasErrors && (
          <div>
            <h4 className="font-semibold text-destructive mb-2">Errors Found:</h4>
            <div className="max-h-48 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Row</TableHead>
                    <TableHead>Field</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errors.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>{error.row}</TableCell>
                      <TableCell className="font-medium">{error.field}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{error.value}</TableCell>
                      <TableCell className="text-destructive">{error.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {hasValidData && (
          <div>
            <h4 className="font-semibold text-green-600 mb-2">
              Valid Universities ({valid.length}):
            </h4>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Acronyms</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {valid.map((university, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{university.name}</TableCell>
                      <TableCell>
                        <Badge variant={university.type === 'public' ? 'default' : 'secondary'}>
                          {university.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{university.acronyms || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={isImporting}>
            Cancel
          </Button>
          {hasValidData && (
            <Button 
              onClick={() => onProceed(valid)} 
              disabled={isImporting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isImporting ? "Importing..." : `Import ${valid.length} Valid Universities`}
            </Button>
          )}
        </div>

        {hasErrors && hasValidData && (
          <div className="text-sm text-muted-foreground">
            <p>Only valid universities will be imported. Please fix the errors in your CSV file and re-upload to import all data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UniversityCSVValidation;
