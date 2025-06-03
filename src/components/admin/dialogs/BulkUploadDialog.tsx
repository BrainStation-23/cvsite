
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import UserCSVValidation from '@/components/admin/UserCSVValidation';

interface BulkUploadDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onBulkUpload: (file: File) => Promise<boolean>;
  isBulkUploading: boolean;
}

export const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  isOpen,
  onOpenChange,
  onBulkUpload,
  isBulkUploading
}) => {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  
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
      
      // Validate the file
      setIsValidating(true);
      try {
        const { parseUsersCSV, validateCSVData } = await import('@/utils/userCsvUtils');
        const parsedData = await parseUsersCSV(file);
        const validation = validateCSVData(parsedData, []); // TODO: Pass existing users if needed
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
  
  const handleDownloadTemplate = async () => {
    const { downloadCSVTemplate } = await import('@/utils/userCsvUtils');
    downloadCSVTemplate();
  };
  
  const handleBulkUpload = async () => {
    if (!uploadFile || !validationResult || validationResult.errors.length > 0) return;
    
    const success = await onBulkUpload(uploadFile);
    if (success) {
      onOpenChange(false);
    }
  };
  
  const canUpload = uploadFile && validationResult && validationResult.errors.length === 0 && validationResult.valid.length > 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Users</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Upload a CSV file with user data. Download the template to see the required format.
            </p>
            <Button variant="outline" onClick={handleDownloadTemplate} className="flex items-center gap-2">
              <Upload size={16} />
              Download Template
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
              <UserCSVValidation validationResult={validationResult} />
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
                Uploading...
              </>
            ) : (
              `Upload ${validationResult?.valid?.length || 0} Users`
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
