
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  parseBulkResourcePlanningCSV, 
  validateBulkResourcePlanningCSVData, 
  downloadBulkResourcePlanningTemplate,
  BulkResourcePlanningValidationResult 
} from '@/utils/bulkResourcePlanningCsvUtils';
import { BulkResourcePlanningCSVValidation } from './BulkResourcePlanningCSVValidation';
import { BulkImportProgress } from './BulkImportProgress';
import { useBulkResourcePlanningImport } from '@/hooks/use-bulk-resource-planning-import';

interface BulkResourcePlanningImportProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkResourcePlanningImport: React.FC<BulkResourcePlanningImportProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<BulkResourcePlanningValidationResult | null>(null);
  
  const {
    processImport,
    downloadErrorsAsCSV,
    isProcessing,
    progress,
    importErrors
  } = useBulkResourcePlanningImport();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select a CSV file.',
        variant: 'destructive'
      });
      return;
    }

    setFile(selectedFile);
    setValidationResult(null);

    try {
      const data = await parseBulkResourcePlanningCSV(selectedFile);
      const validation = validateBulkResourcePlanningCSVData(data);
      setValidationResult(validation);
    } catch (error) {
      toast({
        title: 'Error parsing CSV',
        description: 'Failed to parse the CSV file. Please check the format.',
        variant: 'destructive'
      });
    }
  };

  const handleBulkImport = async () => {
    if (!validationResult?.valid.length) return;

    try {
      const result = await processImport(validationResult.valid);
      
      if (result && result.successful > 0) {
        onSuccess();
        
        // If all records were successful, close the dialog
        if (result.failed === 0) {
          setTimeout(() => {
            handleClose();
          }, 2000);
        }
      }
    } catch (error) {
      toast({
        title: 'Import failed',
        description: 'Failed to start the import process. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDownloadTemplate = () => {
    downloadBulkResourcePlanningTemplate();
    toast({
      title: 'Template downloaded',
      description: 'CSV template for bulk resource planning has been downloaded.'
    });
  };

  const handleClose = () => {
    if (isProcessing) {
      toast({
        title: 'Import in progress',
        description: 'Please wait for the import to complete before closing.',
        variant: 'destructive'
      });
      return;
    }

    setFile(null);
    setValidationResult(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Resource Planning Import</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Display */}
          <BulkImportProgress
            progress={progress}
            isProcessing={isProcessing}
            errorCount={importErrors.length}
            onDownloadErrors={downloadErrorsAsCSV}
          />

          {/* Download Template */}
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Download className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-medium text-blue-900">Download CSV Template</h3>
              <p className="text-sm text-blue-700">
                Get the CSV template with the correct format for bulk resource planning import.
              </p>
            </div>
            <Button variant="outline" onClick={handleDownloadTemplate} disabled={isProcessing}>
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={isProcessing}
            />
            <p className="text-sm text-gray-600">
              Select a CSV file containing resource planning data to import.
            </p>
          </div>

          {/* Validation Results */}
          {file && validationResult && (
            <BulkResourcePlanningCSVValidation
              validationResult={validationResult}
              fileName={file.name}
            />
          )}

          {/* Import Actions */}
          {validationResult?.valid.length > 0 && !progress.isComplete && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-900 mb-2">Ready to Import</h3>
              <p className="text-sm text-green-700 mb-4">
                This will create {validationResult.valid.length} new resource planning assignments.
                Progress will be shown above during import.
              </p>
              <Button 
                onClick={handleBulkImport} 
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isProcessing ? 'Importing...' : `Import ${validationResult.valid.length} Records`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
