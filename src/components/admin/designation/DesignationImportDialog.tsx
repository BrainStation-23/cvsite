
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { DesignationItem } from '@/hooks/settings/use-designation-settings';
import { parseDesignationsCSV, validateDesignationCSVData, downloadDesignationCSVTemplate } from '@/utils/designationCsvUtils';
import DesignationCSVValidation from './DesignationCSVValidation';

interface DesignationImportDialogProps {
  designations: DesignationItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DesignationImportDialog: React.FC<DesignationImportDialogProps> = ({
  designations,
  onValidationResult,
  isBulkImporting,
  isOpen,
  onOpenChange
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseDesignationsCSV(file);
      
      if (parsedData.length === 0) {
        toast({
          title: "Import failed",
          description: "No valid data found in CSV file.",
          variant: "destructive"
        });
        return;
      }

      const validation = validateDesignationCSVData(parsedData, designations);
      onValidationResult(validation);
      
      // Close the dialog after processing
      onOpenChange(false);

      if (validation.errors.length === 0) {
        toast({
          title: "Validation successful",
          description: `${validation.valid.length} designations ready to import.`,
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isBulkImporting}>
          <Upload className="mr-2 h-4 w-4" />
          {isBulkImporting ? "Importing..." : "Import CSV"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Designations from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please ensure your CSV file follows the exact format below to avoid import errors.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-3 rounded-lg">
            <h4 className="font-medium mb-2">Required Format:</h4>
            <div className="bg-white p-2 rounded border font-mono text-sm">
              <div className="text-gray-600">name</div>
              <div>Software Engineer</div>
              <div>Product Manager</div>
              <div>Data Scientist</div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="space-y-1">
              <h4 className="font-medium text-green-700 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Required
              </h4>
              <p className="text-gray-700"><strong>name:</strong> Designation name (unique)</p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <h4 className="font-medium text-blue-800 mb-1">Important Notes:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Designation names must be unique and cannot be empty</li>
              <li>• First row must contain column headers exactly as shown</li>
              <li>• Save file in CSV format (UTF-8 encoding recommended)</li>
            </ul>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={downloadDesignationCSVTemplate}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={isBulkImporting}
              className="flex-1"
            >
              <Upload className="mr-2 h-4 w-4" />
              Choose CSV File
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
      </DialogContent>
    </Dialog>
  );
};

export default DesignationImportDialog;
