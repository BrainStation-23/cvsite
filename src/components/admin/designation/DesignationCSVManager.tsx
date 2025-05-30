
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/ui/use-toast';
import { exportDesignationsToCSV } from '@/utils/designationCsvUtils';
import { DesignationItem } from '@/hooks/settings/use-designation-settings';
import DesignationImportDialog from './DesignationImportDialog';

interface DesignationCSVManagerProps {
  designations: DesignationItem[];
  onValidationResult: (result: any) => void;
  isBulkImporting: boolean;
}

const DesignationCSVManager: React.FC<DesignationCSVManagerProps> = ({
  designations,
  onValidationResult,
  isBulkImporting
}) => {
  const { toast } = useToast();
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  // Add safety check for designations
  const safeDesignations = designations || [];

  const handleExport = () => {
    try {
      exportDesignationsToCSV(safeDesignations);
      toast({
        title: "Export successful",
        description: "Designations have been exported to CSV.",
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export designations to CSV.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" onClick={handleExport} disabled={safeDesignations.length === 0}>
        <Download className="mr-2 h-4 w-4" />
        Export CSV
      </Button>
      <DesignationImportDialog
        designations={safeDesignations}
        onValidationResult={onValidationResult}
        isBulkImporting={isBulkImporting}
        isOpen={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
};

export default DesignationCSVManager;
