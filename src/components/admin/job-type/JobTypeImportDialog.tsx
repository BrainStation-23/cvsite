import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { parseJobTypesCSV, validateJobTypeCSVData, JobTypeFormData } from '@/utils/jobTypeCsvUtils';
import { JobTypeItem } from '@/hooks/use-job-type-settings';

interface JobTypeImportDialogProps {
  jobTypes: JobTypeItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const JobTypeImportDialog: React.FC<JobTypeImportDialogProps> = ({
  jobTypes,
  onValidationResult,
  isBulkImporting,
  isOpen,
  onOpenChange
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: JobTypeFormData[];
    errors: Array<{ row: number; errors: string[]; data: JobTypeFormData }>;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const parsedData = await parseJobTypesCSV(file);
      const result = validateJobTypeCSVData(parsedData, jobTypes);
      setValidationResult(result);
    } catch (error) {
      console.error('Error processing CSV:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (validationResult && validationResult.valid.length > 0) {
      onValidationResult(validationResult);
      // Reset state after successful import
      setFile(null);
      setValidationResult(null);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Job Types from CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Select CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-600">
              Expected columns: name, color_code
            </p>
          </div>

          {file && !validationResult && (
            <Button onClick={handleValidate} disabled={isProcessing}>
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
              Validate CSV
            </Button>
          )}

          {validationResult && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Alert className="flex-1">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{validationResult.valid.length}</strong> valid job types found
                  </AlertDescription>
                </Alert>
                
                {validationResult.errors.length > 0 && (
                  <Alert variant="destructive" className="flex-1">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>{validationResult.errors.length}</strong> rows have errors
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {validationResult.valid.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Valid Job Types (will be imported):</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Color Code</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.valid.slice(0, 10).map((jobType, index) => (
                        <TableRow key={index}>
                          <TableCell>{jobType.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: jobType.color_code || '#3B82F6' }}
                              />
                              <span className="text-xs">{jobType.color_code}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {validationResult.valid.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2">
                      ... and {validationResult.valid.length - 10} more job types
                    </p>
                  )}
                </div>
              )}

              {validationResult.errors.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Errors (will be skipped):</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Row</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Errors</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {validationResult.errors.map((error, index) => (
                        <TableRow key={index}>
                          <TableCell>{error.row}</TableCell>
                          <TableCell>{error.data.name || 'N/A'}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {error.errors.map((err, errIndex) => (
                                <Badge key={errIndex} variant="destructive" className="text-xs">
                                  {err}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleImport} 
                  disabled={validationResult.valid.length === 0 || isBulkImporting}
                >
                  {isBulkImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Import {validationResult.valid.length} Job Types
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobTypeImportDialog;