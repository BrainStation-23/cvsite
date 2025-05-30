
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Upload, Download } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { parseReferencesCSV, validateReferenceCSVData, downloadReferenceCSVTemplate } from '@/utils/referenceCsvUtils';
import { ReferenceItem } from '@/hooks/settings/use-reference-settings';
import { useDesignationSettings } from '@/hooks/settings/use-designation-settings';
import ReferenceCSVValidation from './ReferenceCSVValidation';

interface ReferenceImportDialogProps {
  references: ReferenceItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReferenceImportDialog: React.FC<ReferenceImportDialogProps> = ({
  references,
  onValidationResult,
  isBulkImporting,
  isOpen,
  onOpenChange
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [validationResult, setValidationResult] = React.useState<any>(null);
  
  // Get valid designations from the database
  const { designations } = useDesignationSettings();
  const validDesignations = designations?.map(d => d.name) || [];

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseReferencesCSV(file);
      
      if (parsedData.length === 0) {
        toast({
          title: "Import failed",
          description: "No valid data found in CSV file.",
          variant: "destructive"
        });
        return;
      }

      const validation = validateReferenceCSVData(parsedData, references, validDesignations);
      setValidationResult(validation);

      if (validation.errors.length === 0) {
        toast({
          title: "Validation successful",
          description: `${validation.valid.length} references ready to import.`,
        });
      } else {
        toast({
          title: "Validation completed",
          description: `Found ${validation.errors.length} errors and ${validation.valid.length} valid entries.`,
          variant: validation.valid.length > 0 ? "default" : "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Import failed",
        description: "Failed to parse CSV file. Please check the format.",
        variant: "destructive"
      });
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleValidationProceed = (validReferences: any[]) => {
    onValidationResult({ valid: validReferences });
    setValidationResult(null);
    onOpenChange(false);
  };

  const handleValidationCancel = () => {
    setValidationResult(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isBulkImporting}>
          <Upload className="mr-2 h-4 w-4" />
          {isBulkImporting ? "Importing..." : "Import CSV"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import References from CSV</DialogTitle>
        </DialogHeader>

        {validationResult ? (
          <ReferenceCSVValidation
            validationResult={validationResult}
            onProceed={handleValidationProceed}
            onClose={handleValidationCancel}
            isBulkImporting={isBulkImporting}
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">CSV Format Requirements:</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Required columns: name, email, designation, company</li>
                <li>• Email addresses must be unique</li>
                <li>• Designation must exist in the system</li>
                <li>• All fields are required</li>
                <li>• Use proper CSV format with headers</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Choose CSV File
              </Button>
              
              <Button
                variant="outline"
                onClick={downloadReferenceCSVTemplate}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>

            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ReferenceImportDialog;
