
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportDepartmentsToCSV, parseDepartmentsCSV, validateDepartmentCSVData, downloadDepartmentCSVTemplate } from '@/utils/departmentCsvUtils';
import { DepartmentItem } from '@/hooks/use-department-settings';

interface DepartmentCSVManagerProps {
  departments: DepartmentItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const DepartmentCSVManager: React.FC<DepartmentCSVManagerProps> = ({
  departments,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportDepartmentsToCSV(departments);
      toast({
        title: "Export successful",
        description: "Departments have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export departments to CSV.",
        variant: "destructive"
      });
    }
  };

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
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={departments.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <Button variant="outline" onClick={downloadDepartmentCSVTemplate}>
        <Download className="mr-2 h-4 w-4" />
        Template
      </Button>
      <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isBulkImporting}>
        <Upload className="mr-2 h-4 w-4" />
        {isBulkImporting ? "Importing..." : "Import CSV"}
      </Button>
      <Input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default DepartmentCSVManager;
