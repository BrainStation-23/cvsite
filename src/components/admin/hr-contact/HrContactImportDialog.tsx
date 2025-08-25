
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HrContactItem } from '@/hooks/use-hr-contact-settings';
import { parseHrContactCSV, validateHrContactCSVData } from '@/utils/hrContactCsvUtils';
import HrContactCSVValidation from './HrContactCSVValidation';

interface HrContactImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onValidationResult: (result: any) => void;
  existingHrContacts: HrContactItem[];
  isImporting: boolean;
}

const HrContactImportDialog: React.FC<HrContactImportDialogProps> = ({
  open,
  onOpenChange,
  onValidationResult,
  existingHrContacts,
  isImporting
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setValidationResult(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid CSV file.",
        variant: "destructive"
      });
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    setIsValidating(true);
    try {
      const csvData = await parseHrContactCSV(file);
      const result = validateHrContactCSVData(csvData, existingHrContacts);
      setValidationResult(result);
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = () => {
    if (validationResult?.valid) {
      onValidationResult(validationResult);
      handleClose();
    }
  };

  const handleClose = () => {
    setFile(null);
    setValidationResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import HR Contacts from CSV</DialogTitle>
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
              CSV should have columns: name, email
            </p>
          </div>

          {file && !validationResult && (
            <Button
              onClick={handleValidate}
              disabled={isValidating}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isValidating ? 'Validating...' : 'Validate CSV'}
            </Button>
          )}

          {validationResult && (
            <HrContactCSVValidation
              validationResult={validationResult}
              onImport={handleImport}
              isImporting={isImporting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HrContactImportDialog;
