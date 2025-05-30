
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { exportDepartmentsToCSV } from '@/utils/departmentCsvUtils';
import { DepartmentItem } from '@/hooks/settings/use-department-settings';
import DepartmentImportDialog from './DepartmentImportDialog';

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

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={departments.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <DepartmentImportDialog
        departments={departments}
        onValidationResult={onValidationResult}
        isBulkImporting={isBulkImporting}
      />
    </div>
  );
};

export default DepartmentCSVManager;
