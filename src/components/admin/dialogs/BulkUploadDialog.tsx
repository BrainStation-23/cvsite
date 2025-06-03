
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, Download } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UserCSVValidation from '@/components/admin/UserCSVValidation';
import { parseUsersCSV, validateCSVData, downloadCSVTemplate, downloadUpdateCSVTemplate } from '@/utils/userCsvUtils';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onBulkUpload: (file: File) => Promise<boolean>;
  isBulkUploading: boolean;
  mode: 'create' | 'update';
  title?: string;
  description?: string;
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  isOpen,
  onOpenChange,
  onBulkUpload,
  isBulkUploading,
  mode,
  title,
  description
}) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  const dialogTitle = title || (mode === 'create' ? 'Bulk Create Users' : 'Bulk Update Users');
  const dialogDescription = description || (mode === 'create' 
    ? 'Upload a CSV file to create new users in bulk.' 
    : 'Upload a CSV file to update existing users in bulk.');
  
  useEffect(() => {
    if (!isOpen) {
      setUploadFile(null);
      setValidationResult(null);
    }
  }, [isOpen]);
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadFile(file);
      
      // Validate the file using papaparse
      setIsValidating(true);
      try {
        const parsedData = await parseUsersCSV(file);
        const validation = validateCSVData(parsedData, [], mode); // TODO: Pass existing users if needed for update mode
        setValidationResult(validation);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        setValidationResult({
          valid: [],
          errors: [{ row: 1, field: 'file', value: file.name, message: 'Failed to parse CSV file. Please check the format.' }]
        });
      } finally {
        setIsValidating(false);
      }
    }
  };
  
  const handleDownloadTemplate = () => {
    if (mode === 'create') {
      downloadCSVTemplate();
    } else {
      downloadUpdateCSVTemplate();
    }
  };
  
  const handleBulkUpload = async () => {
    if (!uploadFile || !validationResult || validationResult.errors.length > 0) return;
    
    const success = await onBulkUpload(uploadFile);
    if (success) {
      onOpenChange(false);
    }
  };
  
  const canUpload = uploadFile && validationResult && validationResult.errors.length === 0 && validationResult.valid.length > 0;
  
  const templateButtonText = mode === 'create' ? 'Download Create Template' : 'Download Update Template';
  const uploadButtonText = mode === 'create' 
    ? `Create ${validationResult?.valid?.length || 0} Users`
    : `Update ${validationResult?.valid?.length || 0} Users`;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {dialogDescription} Download the template to see the required format.
            </p>
            <Button variant="outline" onClick={handleDownloadTemplate} className="flex items-center gap-2">
              <Download size={16} />
              {templateButtonText}
            </Button>
          </div>
          
          <div>
            <Label htmlFor="file-upload">Upload CSV File</Label>
            <Input 
              id="file-upload" 
              type="file" 
              accept=".csv" 
              onChange={handleFileChange}
              className="mt-1"
            />
            {uploadFile && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  {uploadFile.name}
                  <button 
                    onClick={() => {
                      setUploadFile(null);
                      setValidationResult(null);
                    }}
                    className="ml-1 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </Badge>
              </div>
            )}
          </div>

          {/* Validation Results */}
          {isValidating && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Validating CSV file...</span>
            </div>
          )}

          {validationResult && !isValidating && (
            <div className="border rounded-lg p-4">
              <UserCSVValidation validationResult={validationResult} mode={mode} />
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUpload} 
            disabled={!canUpload || isBulkUploading}
          >
            {isBulkUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              uploadButtonText
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
