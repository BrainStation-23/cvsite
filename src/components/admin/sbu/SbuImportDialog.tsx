
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { parseSbuCSV, validateSbuCSVData, downloadSbuCSVTemplate } from '@/utils/sbuCsvUtils';
import { SbuItem, SbuFormData } from '@/hooks/use-sbu-settings';
import SbuCSVValidation from './SbuCSVValidation';

interface SbuImportDialogProps {
  sbus: SbuItem[];
  onValidationResult: (result: { valid: SbuFormData[]; errors: any[] }) => void;
  isBulkImporting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SbuImportDialog: React.FC<SbuImportDialogProps> = ({
  sbus,
  onValidationResult,
  isBulkImporting,
  isOpen,
  onOpenChange
}) => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<{
    valid: SbuFormData[];
    errors: any[];
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    try {
      const csvData = await parseSbuCSV(file);
      const result = validateSbuCSVData(csvData, sbus);
      setValidationResult(result);
    } catch (error) {
      toast({
        title: "Error parsing CSV",
        description: "Please check your CSV file format and try again.",
        variant: "destructive"
      });
    }
  };

  const handleConfirmImport = () => {
    if (validationResult) {
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import SBUs from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="csv-file">Upload CSV File</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
            />
            <p className="text-sm text-gray-500 mt-1">
              CSV should contain columns: name, sbu_head_email
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={downloadSbuCSVTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            {file && !validationResult && (
              <Button onClick={handleValidate}>
                Validate CSV
              </Button>
            )}
          </div>

          {validationResult && (
            <SbuCSVValidation
              validData={validationResult.valid}
              errors={validationResult.errors}
              onConfirm={handleConfirmImport}
              onCancel={handleClose}
              isImporting={isBulkImporting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SbuImportDialog;
