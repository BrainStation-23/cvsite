import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Edit, Upload, Download, AlertTriangle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useBulkResourcePlanningUpdate } from '@/hooks/use-bulk-resource-planning-update';
import { 
  parseBulkResourcePlanningUpdateCSV, 
  validateBulkResourcePlanningUpdateCSVData,
  downloadBulkResourcePlanningUpdateTemplate,
  BulkResourcePlanningUpdateValidationError
} from '@/utils/bulkResourcePlanningUpdateCsvUtils';

interface BulkResourcePlanningUpdateProps {
  onUpdateComplete?: () => void;
}

export const BulkResourcePlanningUpdate: React.FC<BulkResourcePlanningUpdateProps> = ({ onUpdateComplete }) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<BulkResourcePlanningUpdateValidationError[]>([]);
  const [validRowsCount, setValidRowsCount] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [validatedData, setValidatedData] = useState<any[]>([]);

  const { processUpdate, downloadErrorsAsCSV, isProcessing, progress, updateErrors } = useBulkResourcePlanningUpdate();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file.',
        variant: 'destructive',
      });
      return;
    }

    setFile(selectedFile);
    setIsValidating(true);
    setValidationErrors([]);
    setValidRowsCount(0);

    try {
      const parsedData = await parseBulkResourcePlanningUpdateCSV(selectedFile);
      const { valid, errors } = validateBulkResourcePlanningUpdateCSVData(parsedData);
      
      setValidationErrors(errors);
      setValidRowsCount(valid.length);
      setValidatedData(valid);

      if (errors.length === 0) {
        toast({
          title: 'CSV validated successfully',
          description: `${valid.length} valid records found and ready for update.`,
        });
      } else {
        toast({
          title: 'CSV validation completed with errors',
          description: `${valid.length} valid records, ${errors.length} errors found.`,
          variant: errors.length === parsedData.length ? 'destructive' : 'default',
        });
      }
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: error instanceof Error ? error.message : 'Failed to parse CSV file',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleUpdate = async () => {
    if (!validatedData.length) return;

    try {
      const result = await processUpdate(validatedData);
      
      if (result && result.successful > 0) {
        // Close dialog and reset state after successful update
        setTimeout(() => {
          setIsOpen(false);
          setFile(null);
          setValidatedData([]);
          setValidationErrors([]);
          setValidRowsCount(0);
          onUpdateComplete?.();
        }, 2000);
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const resetDialog = () => {
    setFile(null);
    setValidatedData([]);
    setValidationErrors([]);
    setValidRowsCount(0);
    setIsValidating(false);
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetDialog();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Edit className="h-4 w-4" />
        Update CSV
      </Button>

      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Bulk Update Resource Planning</DialogTitle>
            <DialogDescription>
              Upload a CSV file to update existing resource planning records. Make sure your CSV includes columns for employee_id, bill_type, project_name, engagement_percentage, billing_percentage, start_date, and release_date.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!isProcessing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="csv-file">CSV File</Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={isValidating}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadBulkResourcePlanningUpdateTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                {isValidating && (
                  <Alert>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <AlertDescription>
                      Validating CSV data...
                    </AlertDescription>
                  </Alert>
                )}

                {file && !isValidating && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Validation Results</span>
                      <div className="flex gap-2">
                        {validRowsCount > 0 && (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {validRowsCount} Valid
                          </Badge>
                        )}
                        {validationErrors.length > 0 && (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            {validationErrors.length} Errors
                          </Badge>
                        )}
                      </div>
                    </div>

                    {validationErrors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <div className="space-y-1">
                            <p className="font-medium">Found {validationErrors.length} validation errors:</p>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {validationErrors.slice(0, 5).map((error, index) => (
                                <div key={index} className="text-xs">
                                  Row {error.row}: {error.message} (Field: {error.field})
                                </div>
                              ))}
                              {validationErrors.length > 5 && (
                                <div className="text-xs text-muted-foreground">
                                  ... and {validationErrors.length - 5} more errors
                                </div>
                              )}
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </>
            )}

            {isProcessing && (
              <div className="space-y-4">
                <Alert>
                  <Upload className="h-4 w-4" />
                  <AlertDescription>
                    Updating resource planning records... {progress.currentItem && `Currently processing: ${progress.currentItem}`}
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.processed} / {progress.total}</span>
                  </div>
                  <Progress 
                    value={progress.total > 0 ? (progress.processed / progress.total) * 100 : 0} 
                  />
                </div>

                {progress.isComplete && (
                  <div className="flex gap-2 justify-center">
                    {progress.successful > 0 && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {progress.successful} Updated
                      </Badge>
                    )}
                    {progress.failed > 0 && (
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {progress.failed} Failed
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex gap-2 w-full">
              {updateErrors.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadErrorsAsCSV}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Errors
                </Button>
              )}
              
              <div className="flex gap-2 ml-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogChange(false)}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleUpdate}
                  disabled={!validatedData.length || isProcessing || validationErrors.length > 0}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Update {validRowsCount} Records
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};