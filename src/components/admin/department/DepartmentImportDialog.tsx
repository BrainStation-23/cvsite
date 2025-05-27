
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { parseDepartmentsCSV, validateDepartmentCSVData, downloadDepartmentCSVTemplate } from '@/utils/departmentCsvUtils';
import { DepartmentItem } from '@/hooks/use-department-settings';

interface DepartmentImportDialogProps {
  departments: DepartmentItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const DepartmentImportDialog: React.FC<DepartmentImportDialogProps> = ({
  departments,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const parsedData = await parseDepartmentsCSV(file);
      
      if (parsedData.length === 0) {
        toast({
          title: "Import failed",
          description: "No valid data found in CSV file.",
          variant: "destructive"
        });
        return;
      }

      // Validate the data
      const validation = validateDepartmentCSVData(parsedData, departments);
      onValidationResult(validation);

      if (validation.errors.length === 0) {
        toast({
          title: "Validation successful",
          description: `${validation.valid.length} departments ready to import.`,
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
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={isBulkImporting}>
          <Upload className="mr-2 h-4 w-4" />
          {isBulkImporting ? "Importing..." : "Import CSV"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Import Departments from CSV
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* CSV Format Guidelines */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">CSV Format Guidelines</h3>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please ensure your CSV file follows the exact format below to avoid import errors.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Required Format:</h4>
                <div className="bg-white p-3 rounded border font-mono text-sm">
                  <div className="text-gray-600">name,full_form</div>
                  <div>Computer Science,Department of Computer Science and Engineering</div>
                  <div>Mathematics,Department of Mathematics</div>
                  <div>Physics,Department of Physics</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-green-700 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Required Fields
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li><strong>name:</strong> Department name (required, unique)</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-700 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Optional Fields
                  </h4>
                  <ul className="text-sm space-y-1 text-gray-700">
                    <li><strong>full_form:</strong> Full department name</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="space-y-3">
            <h4 className="font-medium">Important Notes:</h4>
            <ul className="text-sm space-y-1 text-gray-700 list-disc list-inside">
              <li>Department names must be unique and cannot be empty</li>
              <li>Duplicate department names within the CSV or existing in the database will be rejected</li>
              <li>The first row must contain column headers exactly as shown above</li>
              <li>Save your file in CSV format (UTF-8 encoding recommended)</li>
              <li>Maximum file size: 5MB</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={downloadDepartmentCSVTemplate}
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
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentImportDialog;
